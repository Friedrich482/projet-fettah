import Dockerode from "dockerode";
import { once } from "node:events";

import { Inject, Injectable } from "@nestjs/common";

import {
  BYTES_PER_MEGABYTE,
  DOCKER_CLIENT,
  NANOCPUS_PER_MILLICPU,
  PULL_TIMEOUT_MS,
} from "./constants";
import {
  CreateAndStartContainerDtoType,
  DestroyContainerDtoType,
  EnsureNetworkDtoType,
  ProvisionContainerDtoType,
  PullImageDtoType,
} from "./docker.dto";

@Injectable()
export class DockerService {
  constructor(
    @Inject(DOCKER_CLIENT)
    private readonly client: Dockerode,
  ) {}

  async ensureNetwork(ensureNetworkDto: EnsureNetworkDtoType) {
    const { name } = ensureNetworkDto;

    const networks = await this.client.listNetworks({
      filters: { name: [name] },
    });

    const [existing] = networks;
    if (existing) {
      return;
    }

    await this.client.createNetwork({ Name: name });
  }

  async pullImage(pullImageDto: PullImageDtoType) {
    const { name, tag } = pullImageDto;

    const repository = `${name}:${tag}`;
    const stream = await this.client.pull(repository);

    await once(stream, "end", { signal: AbortSignal.timeout(PULL_TIMEOUT_MS) });
  }

  async createAndStartContainer(
    createAndStartContainerDto: CreateAndStartContainerDtoType,
  ) {
    const { image, name, cpu, ram, network, exposedPort, labels } =
      createAndStartContainerDto;

    const memory = ram * BYTES_PER_MEGABYTE;

    const container = await this.client.createContainer({
      name,
      Image: `${image.name}:${image.tag}`,
      ExposedPorts: { [`${exposedPort}/tcp`]: {} },
      Labels: labels ?? {},
      HostConfig: {
        NanoCpus: cpu * NANOCPUS_PER_MILLICPU,
        Memory: memory,
        MemorySwap: memory,
        NetworkMode: network,
      },
    });

    try {
      await container.start();
    } catch (error) {
      await container.remove({ force: true, v: true });
      throw error;
    }

    return container.id;
  }

  async provisionContainer(provisionContainerDto: ProvisionContainerDtoType) {
    const { image, network } = provisionContainerDto;

    await this.ensureNetwork({ name: network });
    await this.pullImage(image);

    return this.createAndStartContainer(provisionContainerDto);
  }

  async destroyContainer(destroyContainerDto: DestroyContainerDtoType) {
    const { containerId } = destroyContainerDto;

    const container = this.client.getContainer(containerId);

    await container.remove({ force: true, v: true });
  }
}
