# GrandView sync relay — build the workspace and run the relay server.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/relay-server packages/relay-server
RUN pnpm install --filter @gv/relay-server... --frozen-lockfile=false \
 && pnpm --filter @gv/relay-server build \
 && pnpm --filter @gv/relay-server deploy --prod /relay

FROM node:22-alpine
WORKDIR /relay
ENV PORT=1234
COPY --from=build /relay /relay
EXPOSE 1234
CMD ["node", "dist/index.js"]
