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

### Desktop (Tauri 2 — macOS / Windows / Linux)

Requires Rust (`rustup`). On Linux also the WebKitGTK dev packages
(see `.github/workflows/desktop-release.yml`).

```bash
pnpm --filter @gv/app tauri dev      # run the desktop app against the Vite dev server
pnpm --filter @gv/app tauri build    # produce a desktop bundle
```

### Mobile (Capacitor — iOS / Android)

The same web app, wrapped in a native webview. Generating/building the native
projects requires platform toolchains **not** needed for web/desktop:
iOS → Xcode + CocoaPods; Android → JDK + Android SDK.

```bash
pnpm --filter @gv/app build
pnpm --filter @gv/app exec cap add ios       # one-time (macOS + Xcode + CocoaPods)
pnpm --filter @gv/app exec cap add android   # one-time (JDK + Android SDK)
pnpm --filter @gv/app cap:sync               # after each web build
pnpm --filter @gv/app exec cap open ios      # open in Xcode / Android Studio to run
```

## Status

**Phase 0 (scaffolding) — done.** Monorepo, package skeletons, the
`SyncProvider`/`PlatformAdapter` seams, the `@gv/core` Yjs document model with
fractional-indexed ordering (the legacy drag-persistence bug #91 is fixed
structurally and covered by convergence tests), and a working web app with
IndexedDB persistence — all verified (unit tests + a headless-browser smoke
test).

**Shells:** Tauri 2 desktop shell added and verified (compiles + launches on
macOS). Capacitor iOS/Android config + scripts added; native projects build
on a machine with the mobile toolchains (see above).

**Phase 1 (single-user feature parity) — mostly done.** Verified end-to-end in
a headless browser:

- **Document library** — multiple Grand Views: create / open / list / soft-delete
  / restore / delete-forever, each document a separate IndexedDB-persisted Y.Doc.
- **WorkArea** — dnd-kit drag-drop tree (reparenting, keyboard-accessible),
  per-user Yjs undo/redo (origin-scoped), TipTap collaborative editor bound to
  each note's `Y.XmlFragment`, tags/references editing, Trash panel.
- **File attachments** — drag-drop / file-picker / paste-from-clipboard upload,
  image thumbnails, open / download / delete, via the platform blob store.
- All state persists to IndexedDB across reloads and close/reopen.

**Phase 2 (real-time collaboration) — started.** Verified with two browser
tabs: a `P2pProvider` (y-webrtc) layered on the local persistence base gives
live multi-client editing + **presence avatars**. Same-origin tabs sync over
**BroadcastChannel with zero infrastructure / no signaling**; setting
`VITE_GV_SIGNALING` to a self-hosted signaling URL upgrades it to cross-device
collaboration at no hosting cost.

**Next:** templates and the global tag/reference registry; more sync providers
(self-hosted relay, file-sync via iCloud/Dropbox); collaborative TipTap cursors;
then Phase 3 (DOCX, `.gvd`/`.gvt`, code signing, auto-update).

## License

MIT
