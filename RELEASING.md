# Releasing GrandView

Desktop builds are produced by `.github/workflows/desktop-release.yml` on a
`v*` tag (macOS / Windows / Linux via `tauri-action`). Code signing and
auto-update require keys/certificates you provide — the workflow already reads
them from repository secrets.

## Auto-update (Tauri updater)

1. Generate an update signing keypair:
   ```bash
   pnpm --filter @gv/app tauri signer generate -w ~/.gv-updater.key
   ```
2. Add secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
3. Enable the updater in `apps/app/src-tauri/tauri.conf.json` (add the public key
   the command printed):
   ```jsonc
   "bundle": { "createUpdaterArtifacts": true },
   "plugins": {
     "updater": {
       "pubkey": "<PUBLIC KEY FROM step 1>",
       "endpoints": ["https://github.com/<owner>/grand-view/releases/latest/download/latest.json"]
     }
   }
   ```
4. Add the updater plugin:
   ```bash
   pnpm --filter @gv/app add @tauri-apps/plugin-updater @tauri-apps/plugin-process
   ```
   and register it in `src-tauri` (`tauri_plugin_updater::Builder`). Tagged builds
   then publish `latest.json` + signed artifacts; installed apps self-update.

> Left disabled by default so the build works without keys. Addresses #89/#103.

## Code signing (addresses #64 — requires purchased certificates)

- **macOS:** a Developer ID Application certificate + an App Store Connect API
  key for notarization. Provide `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.
- **Windows:** an Authenticode (ideally EV) certificate; configure
  `bundle.windows.certificateThumbprint` / a signing command in `tauri.conf.json`.
- **Linux:** AppImage/deb are produced unsigned; distribute via the repo / a PPA.

## Mobile

- **iOS:** open `apps/app/ios` in Xcode, set the signing team, archive to the
  App Store / TestFlight.
- **Android:** build a signed AAB from `apps/app/android` (`./gradlew bundleRelease`
  with a keystore) for Play.
