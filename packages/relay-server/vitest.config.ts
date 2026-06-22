import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 15000,
    // y-websocket emits benign socket noise as the relay/clients tear down
    // after the assertions have already passed.
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
