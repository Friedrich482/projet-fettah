import { ulid } from "ulid";

import { ImagesService as CrudImagesService } from "@/images/images.service";
import { MachinesService as CrudMachinesService } from "@/machines/machines.service";
import { QueuesService } from "@/queues/queues.service";
import { ReservationsService as CrudReservationsService } from "@/reservations/reservations.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "@repo/db/db";

import {
  CreateReservationDtoType,
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
    const { imageId, duration, userId } = createReservationDto;

    const image = await this.crudImagesService.findOne({
      type: "id",
      id: imageId,
    });

    if (!image) {
      throw new NotFoundException("Image not found");
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
          imageId,
          name: machineName,
          cpu: image.defaultCpu,
          ram: image.defaultRam,
          status: "pending",
          workerId: null,
          containerId: null,
          destroyedAt: null,
          lastError: null,
        },
        tx,
      );

      const { workerId, lastError, destroyedAt, containerId, ...rest } =
        createdMachine;

      return { reservation: createdReservation, machine: rest };
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

    return { machine, reservation };
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
}
