import { ulid } from "ulid";

import { ImagesService as CrudImagesService } from "@/images/images.service";
import { MachinesService as CrudMachinesService } from "@/machines/machines.service";
import { QueuesService } from "@/queues/queues.service";
import { ReservationsService as CrudReservationsService } from "@/reservations/reservations.service";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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

      const { workerId, lastError, destroyedAt, containerId, ...restMachine } =
        createdMachine;

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
