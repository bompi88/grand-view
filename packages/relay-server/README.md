# @gv/relay-server

A self-hostable GrandView sync relay (Hocuspocus / Yjs WebSocket). Run it
yourself for always-on, cross-device, persistent collaboration — **you** host
nothing centrally, so it stays zero-cost at scale.

## Run locally

```bash
pnpm --filter @gv/relay-server build
PORT=1234 GV_RELAY_TOKEN=optional-secret pnpm --filter @gv/relay-server start
```

Point the app at it: `VITE_GV_RELAY=ws://localhost:1234` (and the token, if set).

## Deploy free

- **Docker** (any host): `docker build -f packages/relay-server/Dockerfile -t gv-relay . && docker run -p 1234:1234 gv-relay`
- **Fly.io** (free allowance): `fly launch` with the Dockerfile; expose port 1234 as 443/wss.
- **Render / Railway**: new Web Service from the Dockerfile, port 1234.
- **Oracle Cloud always-free VM / Raspberry Pi / NAS**: run the Docker image.

## Persistence

Documents are in-memory by default (peers re-sync from each other). For durable
storage add the `@hocuspocus/extension-sqlite` (single file) or
`@hocuspocus/extension-database` and pass it to `createRelay` via `extensions`.

## Auth

Set `GV_RELAY_TOKEN` to require a shared secret; clients pass it as the `token`
connection param. The room name is the document id, so a relay can host many
documents.
