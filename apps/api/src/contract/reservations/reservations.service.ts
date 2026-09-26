import { ReservationsService as CrudReservationsService } from "@/reservations/reservations.service";
import { Injectable, NotFoundException } from "@nestjs/common";

import {
  FindAllReservationsDtoType,
  FindOneReservationDtoType,
} from "./reservations.dto";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly crudReservationsService: CrudReservationsService,
  ) {}

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
}
