FROM ghcr.io/pnpm/pnpm:12.10.1 AS base
RUN pnpm runtime set node 22.14.0 -g

FROM base AS builder
WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile

RUN pnpm run -r build
RUN pnpm deploy --filter=api --legacy --prod /prod/api

FROM base AS runner
WORKDIR /app/api

COPY --from=builder /prod/api .

COPY --from=builder /app/packages/db/docker-entrypoint.sh .
COPY --from=builder /app/packages/db/drizzle.config.ts ./node_modules/@repo/db
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3040

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "./dist/main.js"]