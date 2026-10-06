import Dockerode from "dockerode";

import { EnvService } from "@/env/env.service";

import { DOCKER_CLIENT } from "../constants";

export const dockerClientProvider = {
  provide: DOCKER_CLIENT,
  inject: [EnvService],
  useFactory: (env: EnvService) =>
    new Dockerode({ socketPath: env.get("DOCKER_SOCKET_PATH") }),
};
