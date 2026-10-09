FROM ghcr.io/pnpm/pnpm:12.10.1 AS base
RUN pnpm runtime set node 24.13.0 -g

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile

COPY . .
RUN pnpm run -r build

RUN pnpm --filter=api --prod --legacy deploy /prod/api

FROM node:24.13.0-alpine AS runner
WORKDIR /app/api

COPY --from=builder /prod/api .

COPY --from=builder /app/packages/db/docker-entrypoint.sh .
RUN chmod +x ./docker-entrypoint.sh

USER node

EXPOSE 3040

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "./dist/main.js"]