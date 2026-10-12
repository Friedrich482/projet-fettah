import type { ImageDefinitionDtoType } from "./images.dto";

export const IMAGE_DEFINITIONS = [
  {
    name: "lab/debian-ssh",
    tag: "12",
    dir: "src/images/assets/debian-ssh",
    defaultCpu: 1000,
    defaultRam: 1024,
    exposedPort: 22,
  },
  {
    name: "lab/kali-ssh",
    tag: "latest",
    dir: "src/images/assets/kali-ssh",
    defaultCpu: 1000,
    defaultRam: 2048,
    exposedPort: 22,
  },
] satisfies Array<ImageDefinitionDtoType>;
