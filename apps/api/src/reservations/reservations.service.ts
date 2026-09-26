import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { reservations } from "@/drizzle/schema";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  CreateReservationDtoType,
  DeleteReservationDtoType,
  FindOneReservationDtoType,
  UpdateReservationDtoType,
} from "./reservations.dto";

@Injectable()
export class ReservationsService {
  private readonly reservationsColumns = {
    id: reservations.id,
    userId: reservations.userId,
    status: reservations.status,
    duration: reservations.duration,
    expiresAt: reservations.expiresAt,
    endedAt: reservations.endedAt,
  };

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  async create(createReservationDto: CreateReservationDtoType) {
    const { userId, status, duration, expiresAt, endedAt } =
      createReservationDto;

    const [createdReservation] = await this.db
      .insert(reservations)
      .values({ userId, status, duration, expiresAt, endedAt })
      .returning(this.reservationsColumns);

    return createdReservation;
  }

  async findOne(findOneReservationDto: FindOneReservationDtoType) {
    const { id } = findOneReservationDto;

    const [reservationFound] = await this.db
      .select(this.reservationsColumns)
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);

    if (!reservationFound) {
      return null;
    }

    return reservationFound;
  }

  async update(updateReservationDto: UpdateReservationDtoType) {
    const { id, ...setFields } = updateReservationDto;

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [returningReservation] = await this.db
      .update(reservations)
      .set({ ...setFields })
      .where(eq(reservations.id, id))
      .returning(this.reservationsColumns);

    if (!returningReservation) {
      throw new NotFoundException("Reservation not found");
    }

    return returningReservation;
  }

  async delete(deleteReservationDto: DeleteReservationDtoType) {
    const { id } = deleteReservationDto;

    const [deletedReservation] = await this.db
      .delete(reservations)
      .where(eq(reservations.id, id))
      .returning(this.reservationsColumns);

    if (!deletedReservation) {
      throw new NotFoundException("Reservation not found");
    }

    return deletedReservation;
  }
}
