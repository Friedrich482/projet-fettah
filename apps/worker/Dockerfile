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
RUN ls ./apps/worker/src/images/assets/kali-ssh
RUN pnpm run -r build

RUN pnpm --filter=worker --prod deploy /prod/worker

FROM node:24.13.0-alpine AS runner
WORKDIR /app/worker

COPY --from=builder /prod/worker .

USER node

CMD ["node", "./dist/src/main.js"]