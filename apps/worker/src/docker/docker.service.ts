import Dockerode from "dockerode";

import { Inject, Injectable, Logger } from "@nestjs/common";

import {
  BUILD_TIMEOUT_MS,
  BYTES_PER_MEGABYTE,
  DOCKER_CLIENT,
  EXEC_POLL_INTERVAL_MS,
  EXEC_TIMEOUT_MS,
  HTTP_NOT_MODIFIED,
  NANOCPUS_PER_MILLICPU,
} from "./constants";
import {
  BuildImageDtoType,
  CreateAndStartContainerDtoType,
  DestroyContainerDtoType,
  EnsureNetworkDtoType,
  ProvisionContainerDtoType,
  SetContainerPasswordDtoType,
  StartContainerDtoType,
  StopContainerDtoType,
} from "./docker.dto";

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name, {
    timestamp: true,
  });

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

  private async getImageDigest(repository: string) {
    const inspection = await this.client.getImage(repository).inspect();
    const digest = inspection.RepoDigests[0]?.split("@")[1] ?? inspection.Id;

    return digest.replace(/^sha256:/, "");
  }

  async buildImage(buildImageDto: BuildImageDtoType): Promise<string> {
    const { contextPath, dockerfile, name, tag } = buildImageDto;

    const repository = `${name}:${tag}`;
    this.logger.log(`Building image ${repository}...`);

    const buildStream = await this.client.buildImage(
      { context: contextPath, src: ["."] },
      {
        t: repository,
        dockerfile,
      },
    );

    await new Promise<void>((resolve, reject) => {
      const timeout = AbortSignal.timeout(BUILD_TIMEOUT_MS);

      timeout.addEventListener("abort", () => {
        reject(new Error(`Timed out building ${repository}`));
      });

      this.client.modem.followProgress(
        buildStream,
        (
          error,
          output: Array<{ errorDetail?: { message: string }; error: string }>,
        ) => {
          if (error) {
            return reject(error);
          }

          // followProgress resolves even when a layer failed, so the failure
          // has to be read out of the streamed build output.
          const failedStep = output.find(
            (entry) => entry.errorDetail ?? entry.error,
          );

          if (failedStep) {
            return reject(
              new Error(
                `Failed to build ${repository}: ${
                  failedStep.errorDetail?.message ?? failedStep.error
                }`,
              ),
            );
          }

          this.logger.log(`Built image ${repository}`);
          resolve();
        },
      );
    });

    return this.getImageDigest(repository);
  }

  async createAndStartContainer(
    createAndStartContainerDto: CreateAndStartContainerDtoType,
  ) {
    const { image, name, cpu, ram, network, exposedPort, hostIp, labels } =
      createAndStartContainerDto;

    const memory = ram * BYTES_PER_MEGABYTE;
    const containerPort = `${exposedPort}/tcp`;

    const container = await this.client.createContainer({
      name,
      Image: `${image.name}:${image.tag}`,
      ExposedPorts: { [containerPort]: {} },
      Labels: labels,
      HostConfig: {
        NanoCpus: cpu * NANOCPUS_PER_MILLICPU,
        Memory: memory,
        MemorySwap: memory,
        NetworkMode: network,
        PortBindings: { [containerPort]: [{ HostIp: hostIp, HostPort: "0" }] },
      },
    });

    try {
      await container.start();
    } catch (error) {
      await container.remove({ force: true, v: true });
      throw error;
    }

    const info = await container.inspect();
    const hostPort = info.NetworkSettings.Ports[containerPort]?.[0]?.HostPort;

    if (!hostPort) {
      await container.remove({ force: true, v: true });
      throw new Error(`Failed to resolve the bound host port for ${name}`);
    }

    return { containerId: container.id, hostPort: parseInt(hostPort, 10) };
  }

  async provisionContainer(provisionContainerDto: ProvisionContainerDtoType) {
    const { network } = provisionContainerDto;

    await this.ensureNetwork({ name: network });

    const container = await this.createAndStartContainer(provisionContainerDto);

    return container;
  }

  private async waitForExecToFinish({
    containerId,
    exec,
  }: {
    exec: Dockerode.Exec;
    containerId: string;
  }) {
    const deadline = Date.now() + EXEC_TIMEOUT_MS;

    for (;;) {
      const inspection = await exec.inspect();

      if (!inspection.Running) {
        return inspection;
      }

      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for the exec in ${containerId}`);
      }

      /* sleep for ${EXEC_POLL_INTERVAL_MS} secs */
      await new Promise((resolve) =>
        setTimeout(resolve, EXEC_POLL_INTERVAL_MS),
      );
    }
  }

  async setContainerPassword(
    setContainerPasswordDto: SetContainerPasswordDtoType,
  ) {
    const { containerId, username, password } = setContainerPasswordDto;

    const container = this.client.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ["sh", "-c", `echo '${username}:${password}' | chpasswd`],
    });

    const timeout = AbortSignal.timeout(EXEC_TIMEOUT_MS);

    await new Promise<void>((resolve, reject) => {
      timeout.addEventListener("abort", () => {
        reject(new Error(`Timed out setting the password of ${containerId}`));
      });

      exec.start({ hijack: false }, (error) => {
        if (error) {
          this.logger.log(error);
          return reject(new Error("An error occurred"));
        }

        resolve();
      });
    });

    const inspection = await this.waitForExecToFinish({ exec, containerId });

    if (inspection.ExitCode !== 0) {
      throw new Error(
        `Failed to set the ${username} password in ${containerId} (exit code ${inspection.ExitCode})`,
      );
    }
  }

  async destroyContainer(destroyContainerDto: DestroyContainerDtoType) {
    const { containerId } = destroyContainerDto;

    const container = this.client.getContainer(containerId);

    await container.remove({ force: true, v: true });
  }

  private isAlreadyInState(error: unknown) {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    if (!("statusCode" in error)) {
      return false;
    }

    return error.statusCode === HTTP_NOT_MODIFIED;
  }

  async startContainer(startContainerDto: StartContainerDtoType) {
    const { containerId } = startContainerDto;

    const container = this.client.getContainer(containerId);

    try {
      await container.start();
    } catch (error) {
      if (!this.isAlreadyInState(error)) {
        throw error;
      }

      this.logger.log(`The container ${containerId} was already started`);
    }

    const inspection = await container.inspect();

    if (!inspection.State.Running) {
      throw new Error(
        `The container ${containerId} is not running after being started`,
      );
    }

    const [exposedPort] = Object.keys(inspection.Config.ExposedPorts);
    const hostPort = exposedPort
      ? inspection.NetworkSettings.Ports[exposedPort]?.[0]?.HostPort
      : undefined;

    return { hostPort: hostPort ? parseInt(hostPort, 10) : null };
  }

  async stopContainer(stopContainerDto: StopContainerDtoType) {
    const { containerId } = stopContainerDto;

    const container = this.client.getContainer(containerId);

    try {
      await container.stop();
    } catch (error) {
      if (!this.isAlreadyInState(error)) {
        throw error;
      }

      this.logger.log(`The container ${containerId} was already stopped`);
    }

    const inspection = await container.inspect();

    if (inspection.State.Running) {
      throw new Error(
        `The container ${containerId} is still running after being stopped`,
      );
    }
  }
}
