import { ReservationsService as CrudReservationsService } from "@/reservations/reservations.service";
import { Injectable } from "@nestjs/common";

import { FindAllReservationsDtoType } from "./reservations.dto";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly crudReservationsService: CrudReservationsService,
  ) {}

  async findAll(findAllReservationsDto: FindAllReservationsDtoType) {
    const { userId } = findAllReservationsDto;

    const userReservations = await this.crudReservationsService.findAll({
      userId,
    });

    return userReservations;
  }
}
