# GrandView 2.0

Local-first, collaborative tool for structuring large bodies of information
(reports, theses, research) into a hierarchical tree of chapters and notes.

A ground-up, open-source rebuild of the original Meteor/Electron desktop app
(preserved under [`legacy/`](./legacy)). Designed to run on **iOS, Android,
macOS, Linux, and Windows** from a single UI codebase, with real-time
multi-user collaboration and **zero maintainer hosting cost**.

> Full strategy and roadmap: `~/.claude/plans/this-is-a-legacy-snuggly-swan.md`

## Stack

- **UI:** React 18 + TypeScript + Vite (one codebase)
- **Desktop:** Tauri 2 · **Mobile:** Capacitor (same web app)
- **Data:** Yjs CRDT — offline-first + conflict-free real-time merge
- **Sync:** pluggable providers (local · file-sync · P2P · self-hosted relay · BYO cloud)
- **Editor:** TipTap + y-prosemirror · **DnD:** dnd-kit · **DOCX:** `docx` · **i18n:** i18next

## Monorepo layout

```
packages/
  shared/            @gv/shared            pure TS types & ids
  core/              @gv/core              Yjs schema + node operations (no React, no platform)
  ui/                @gv/ui                React components & hooks (platform-headless)
  sync-providers/    @gv/sync-providers    SyncProvider interface + implementations
  platform-adapters/ @gv/platform-adapters PlatformAdapter interface + adapter-web (+ tauri/capacitor)
apps/
  app/               @gv/app               the single Vite React app (web/desktop/mobile shells)
locales/             en, no-NB             i18next resources
```

Architecture boundaries (who may import whom) are enforced by
`eslint-plugin-boundaries`; `core` and `ui` can never import a concrete
platform API. See `eslint.config.js`.

## Develop

```bash
pnpm install
pnpm dev          # run the web app (Vite) at http://localhost:5173
pnpm test         # vitest across packages
pnpm typecheck    # tsc across packages
pnpm lint         # eslint incl. architecture boundary checks
pnpm build        # build all packages + the web app
```

## Status

**Phase 0 (scaffolding) — done.** Monorepo, package skeletons, the
`SyncProvider`/`PlatformAdapter` seams, the `@gv/core` Yjs document model with
fractional-indexed ordering (the legacy drag-persistence bug #91 is fixed
structurally and covered by convergence tests), and a working web app with
IndexedDB persistence — all verified (unit tests + a headless-browser smoke
test).

**Next — Phase 1 (single-user feature parity):** dnd-kit tree, TipTap node
bodies, tags/references, attachments, templates, trash UI, plus the Tauri
(desktop) and Capacitor (mobile) shells.

## License

MIT
