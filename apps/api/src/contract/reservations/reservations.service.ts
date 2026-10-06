import { ulid } from "ulid";

import { ImagesService as CrudImagesService } from "@/images/images.service";
import { MachinesService as CrudMachinesService } from "@/machines/machines.service";
import { QueuesService } from "@/queues/queues.service";
import { ReservationsService as CrudReservationsService } from "@/reservations/reservations.service";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { db } from "@repo/db/db";

import { DESTROYABLE_STATUSES } from "./constants";
import {
  CreateReservationDtoType,
  DestroyReservationDtoType,
  FindAllReservationsDtoType,
  FindOneReservationDtoType,
} from "./reservations.dto";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly crudReservationsService: CrudReservationsService,
    private readonly crudMachinesService: CrudMachinesService,
    private readonly crudImagesService: CrudImagesService,
    private readonly queuesService: QueuesService,
  ) {}

  async create(createReservationDto: CreateReservationDtoType) {
    const { imageName, imageTag, machineCpu, machineRam, duration, userId } =
      createReservationDto;

    const image = await this.crudImagesService.findOne({
      type: "name-tag",
      name: imageName,
      tag: imageTag,
    });

    if (!image) {
      throw new NotFoundException("Image not found");
    }

    if (machineCpu > image.defaultCpu) {
      throw new BadRequestException(
        `The cpu of the machine you requested exceeds the limit of ${image.defaultCpu} millicores for the ${image.name}:${image.tag} Docker image. Please enter a lower value`,
      );
    }
    if (machineRam > image.defaultRam) {
      throw new BadRequestException(
        `The ram of the machine you requested exceeds the limit of ${image.defaultRam}MB for the ${image.name}:${image.tag} Docker image. Please enter a lower value`,
      );
    }

    const machineName = `vm-${ulid().toLowerCase()}`;

    const { machine, reservation } = await db.transaction(async (tx) => {
      const createdReservation = await this.crudReservationsService.create(
        {
          userId,
          status: "pending",
          duration,
          expiresAt: null,
          endedAt: null,
        },
        tx,
      );

      const createdMachine = await this.crudMachinesService.create(
        {
          reservationId: createdReservation.id,
          imageId: image.id,
          name: machineName,
          cpu: machineCpu,
          ram: machineRam,
          status: "pending",
          workerId: null,
          containerId: null,
          destroyedAt: null,
          lastError: null,
        },
        tx,
      );

      const { status, ...restReservation } = createdReservation;

      const {
        workerId,
        lastError,
        destroyedAt,
        containerId,
        reservationId,
        ...restMachine
      } = createdMachine;

      return { reservation: restReservation, machine: restMachine };
    });

    await this.queuesService.enqueueProvision({
      machineId: machine.id,
      reservationId: reservation.id,
      imageId: machine.imageId,
      name: machine.name,
      cpu: machine.cpu,
      ram: machine.ram,
      duration: reservation.duration,
    });

    const { imageId, ...returningMachine } = machine;

    return { machine: returningMachine, reservation };
  }

  async findOne(findOneReservationDto: FindOneReservationDtoType) {
    const { id, userId } = findOneReservationDto;

    const reservation = await this.crudReservationsService.findOne({
      id,
      userId,
    });

    if (!reservation) {
      throw new NotFoundException("Reservation not found");
    }

    return reservation;
  }

  async findAll(findAllReservationsDto: FindAllReservationsDtoType) {
    const { userId } = findAllReservationsDto;

    const userReservations = await this.crudReservationsService.findAll({
      userId,
    });

    return userReservations;
  }

  async destroy(destroyReservationDto: DestroyReservationDtoType) {
    const { id, userId } = destroyReservationDto;

    const reservation = await this.crudReservationsService.findOne({
      id,
      userId,
    });

    if (!reservation) {
      throw new NotFoundException("Reservation not found");
    }

    const machine = await this.crudMachinesService.findOne({
      type: "reservationId",
      reservationId: id,
    });

    if (!machine) {
      throw new NotFoundException("Reservation not found");
    }

    if (!DESTROYABLE_STATUSES.includes(machine.status)) {
      if (machine.status === "destroyed") {
        throw new ConflictException("The reservation is already destroyed");
      }

      if (machine.status === "destroying") {
        throw new ConflictException(
          "The reservation is already being destroyed",
        );
      }

      throw new ConflictException(
        `A worker is already working on this machine, it is ${machine.status}`,
      );
    }

    const { machine: destroyingMachine, reservation: cancelledReservation } =
      await db.transaction(async (tx) => {
        const claimedMachine = await this.crudMachinesService.transitionStatus(
          {
            id: machine.id,
            from: DESTROYABLE_STATUSES,
            to: "destroying",
          },
          tx,
        );

        if (!claimedMachine) {
          throw new ConflictException(
            "The reservation cannot be destroyed because the machine changed state",
          );
        }

        const cancelled = await this.crudReservationsService.transitionStatus(
          {
            id,
            from: ["pending", "active", "failed"],
            to: "cancelled",
            endedAt: new Date(),
          },
          tx,
        );

        if (!cancelled) {
          throw new ConflictException(
            "The reservation cannot be destroyed because it already ended",
          );
        }

        return { machine: claimedMachine, reservation: cancelled };
      });

    try {
      await this.queuesService.enqueueDestroy({
        reservationId: id,
        machineId: destroyingMachine.id,
        name: destroyingMachine.name,
        containerId: destroyingMachine.containerId,
        reservationStatus: reservation.status,
      });
    } catch (error) {
      await db.transaction(async (tx) => {
        await this.crudMachinesService.transitionStatus(
          {
            id: machine.id,
            from: ["destroying"],
            to: machine.status,
          },
          tx,
        );

        await this.crudReservationsService.transitionStatus(
          {
            id,
            from: ["cancelled"],
            to: reservation.status,
            endedAt: reservation.endedAt,
          },
          tx,
        );
      });

      throw error;
    }

    const { userId: reservationUserId, ...restReservation } =
      cancelledReservation;

    const {
      workerId,
      containerId,
      lastError,
      sshUsername,
      sshPassword,
      sshPort,
      ...restMachine
    } = destroyingMachine;

    return { reservation: restReservation, machine: restMachine };
  }
}
