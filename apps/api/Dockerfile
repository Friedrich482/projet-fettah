ARG PNPM_VERSION=12

FROM ghcr.io/pnpm/pnpm:${PNPM_VERSION} AS base
RUN pnpm runtime set node 22.14.0 -g

FROM base AS builder
WORKDIR /app

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/
COPY packages/db/package*.json ./packages/db/
COPY packages/orpc-contract/package*.json ./packages/orpc-contract/
COPY packages/eslint-config/package*.json ./packages/eslint-config/

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile

COPY . .

RUN pnpm -F=@repo/common build
RUN pnpm -F=@repo/db build
RUN pnpm -F=@repo/orpc-contract build
RUN pnpm -F=api build

FROM base AS dependencies

WORKDIR /app

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/
COPY packages/db/package*.json ./packages/db/
COPY packages/orpc-contract/package*.json ./packages/orpc-contract/

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --prod --frozen-lockfile

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/packages/db/src/drizzle ./packages/db/src/drizzle
COPY --from=builder /app/packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
COPY --from=builder /app/packages/db/docker-entrypoint.sh ./packages/db/docker-entrypoint.sh
RUN chmod +x ./packages/db/docker-entrypoint.sh

COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/orpc-contract/dist ./packages/orpc-contract/dist
COPY --from=builder /app/packages/orpc-contract/package.json ./packages/orpc-contract/package.json

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/package.json

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=dependencies /app/packages/orpc-contract/node_modules ./packages/orpc-contract/node_modules
COPY --from=dependencies /app/packages/common/node_modules ./packages/common/node_modules

# RUN useradd -u 1001 pnpm
# USER pnpm

EXPOSE 3040


ENTRYPOINT ["./packages/db/docker-entrypoint.sh"]
CMD ["node", "./apps/api/dist/main.js"]