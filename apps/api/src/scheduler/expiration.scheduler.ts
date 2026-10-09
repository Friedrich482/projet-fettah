import { and, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";

import { MachinesService } from "@/machines/machines.service";
import { QueuesService } from "@/queues/queues.service";
import { ReservationsService } from "@/reservations/reservations.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { db } from "@repo/db/db";
import { machines, reservations } from "@repo/db/schema";

const DESTROYABLE_MACHINE_STATUSES: Array<
  (typeof machines.$inferSelect)["status"]
> = ["running", "stopped", "paused", "failed"];

@Injectable()
export class ExpirationScheduler {
  private readonly logger = new Logger(ExpirationScheduler.name, {
    timestamp: true,
  });

  constructor(
    private readonly crudReservationsService: ReservationsService,
    private readonly crudMachinesService: MachinesService,
    private readonly queuesService: QueuesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations() {
    this.logger.log("Starting expiration check");

    const candidates = await db
      .select({
        reservationId: reservations.id,
        reservationStatus: reservations.status,
        expiresAt: reservations.expiresAt,
        endedAt: reservations.endedAt,
        machineId: machines.id,
        machineStatus: machines.status,
        machineName: machines.name,
        containerId: machines.containerId,
      })
      .from(reservations)
      .innerJoin(machines, eq(machines.reservationId, reservations.id))
      .where(
        and(
          eq(reservations.status, "active"),
          isNotNull(reservations.expiresAt),
          lt(reservations.expiresAt, sql`now()`),
          inArray(machines.status, DESTROYABLE_MACHINE_STATUSES),
        ),
      )
      .orderBy(reservations.expiresAt)
      .limit(50);

    let claimed = 0;
    let failed = 0;

    for (const candidate of candidates) {
      const origMachineStatus = candidate.machineStatus;
      const origEndedAt = candidate.endedAt;

      const result = await db.transaction(async (tx) => {
        const claimedMachine = await this.crudMachinesService.transitionStatus(
          {
            id: candidate.machineId,
            from: DESTROYABLE_MACHINE_STATUSES,
            to: "destroying",
          },
          tx,
        );

        if (!claimedMachine) {
          return null;
        }

        const expiredReservation =
          await this.crudReservationsService.transitionStatus(
            {
              id: candidate.reservationId,
              from: ["active"],
              to: "expired",
              endedAt: new Date(),
            },
            tx,
          );

        if (!expiredReservation) {
          tx.rollback();
          return null;
        }

        return {
          machine: claimedMachine,
          reservation: expiredReservation,
        };
      });

      if (!result) {
        this.logger.log(
          `Skipped expiring reservation ${candidate.reservationId} (state changed)`,
        );
        continue;
      }

      try {
        await this.queuesService.enqueueDestroy({
          reservationId: result.reservation.id,
          machineId: result.machine.id,
          name: result.machine.name,
          containerId: result.machine.containerId,
          reservationStatus: "active",
        });

        claimed++;
        this.logger.log(
          `Expiring reservation ${candidate.reservationId} (machine ${candidate.machineId})`,
        );
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to enqueue destroy for expired reservation ${candidate.reservationId}, reverting`,
          error,
        );

        try {
          await db.transaction(async (tx) => {
            await this.crudMachinesService.transitionStatus(
              {
                id: candidate.machineId,
                from: ["destroying"],
                to: origMachineStatus,
              },
              tx,
            );

            await this.crudReservationsService.transitionStatus(
              {
                id: candidate.reservationId,
                from: ["expired"],
                to: "active",
                endedAt: origEndedAt,
              },
              tx,
            );
          });
        } catch (revertError) {
          this.logger.error(
            `Failed to revert expiration for reservation ${candidate.reservationId}`,
            revertError,
          );
        }
      }
    }

    this.logger.log(
      `Expiration check complete: found=${candidates.length} claimed=${claimed} failed=${failed}`,
    );
  }
}
