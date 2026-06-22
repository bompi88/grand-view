import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the SAME built web app (apps/app/dist) for iOS & Android.
 * Native projects are generated with `pnpm --filter @gv/app exec cap add ios`
 * / `cap add android` (requires Xcode+CocoaPods / JDK+Android SDK), then
 * `pnpm --filter @gv/app cap:sync` after each web build.
 */
const config: CapacitorConfig = {
  appId: 'com.grandview.app',
  appName: 'GrandView',
  webDir: 'dist',
  ios: { contentInset: 'always' },
};

export default config;
