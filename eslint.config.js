// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

/**
 * Architecture boundary enforcement (see the rebuild plan):
 *   shared            -> (no internal deps)
 *   core              -> shared
 *   sync-providers    -> core, shared
 *   platform-interface-> core, shared
 *   platform-adapter  -> platform-interface, core, shared
 *   ui                -> core, shared, platform-interface, sync-providers (interfaces only)
 *   relay             -> core, shared
 *   app               -> everything (the only place concrete adapters/providers are wired)
 *
 * `ui` and `core` must NEVER import a concrete platform adapter or Tauri/Capacitor/Electron.
 */
export default tseslint.config(
  { ignores: ['legacy/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/src-tauri/target/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['packages/**/*', 'apps/**/*'],
      'boundaries/elements': [
        { type: 'shared', pattern: 'packages/shared/src/**' },
        { type: 'core', pattern: 'packages/core/src/**' },
        { type: 'sync-providers', pattern: 'packages/sync-providers/src/**' },
        { type: 'platform-interface', pattern: 'packages/platform-adapters/src/**' },
        { type: 'platform-adapter', pattern: 'packages/platform-adapters/adapter-*/src/**' },
        { type: 'ui', pattern: 'packages/ui/src/**' },
        { type: 'relay', pattern: 'packages/relay-server/src/**' },
        { type: 'app', pattern: 'apps/app/src/**' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'shared', allow: ['shared'] },
            { from: 'core', allow: ['shared', 'core'] },
            { from: 'sync-providers', allow: ['shared', 'core', 'sync-providers'] },
            { from: 'platform-interface', allow: ['shared', 'core', 'platform-interface'] },
            {
              from: 'platform-adapter',
              allow: ['shared', 'core', 'platform-interface', 'platform-adapter'],
            },
            {
              from: 'ui',
              allow: ['shared', 'core', 'platform-interface', 'sync-providers', 'ui'],
            },
            { from: 'relay', allow: ['shared', 'core', 'relay'] },
            {
              from: 'app',
              allow: [
                'shared',
                'core',
                'sync-providers',
                'platform-interface',
                'platform-adapter',
                'ui',
                'app',
              ],
            },
          ],
        },
      ],
      // core and ui must stay platform-agnostic.
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['packages/core/src/**/*.ts', 'packages/ui/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'electron', message: 'core/ui must be platform-agnostic.' },
            { name: '@tauri-apps/api', message: 'Use PlatformAdapter, not Tauri directly.' },
            { name: '@capacitor/core', message: 'Use PlatformAdapter, not Capacitor directly.' },
          ],
          patterns: [
            { group: ['@tauri-apps/*'], message: 'Use PlatformAdapter, not Tauri directly.' },
            { group: ['@capacitor/*'], message: 'Use PlatformAdapter, not Capacitor directly.' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: { 'boundaries/element-types': 'off' },
  },
);
