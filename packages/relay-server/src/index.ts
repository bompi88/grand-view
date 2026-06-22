import { createRelay } from './server.js';

const port = Number(process.env.PORT ?? 1234);
const token = process.env.GV_RELAY_TOKEN || undefined;

const relay = createRelay({ port, token });
void relay.listen();
// eslint-disable-next-line no-console
console.log(`GrandView relay listening on :${port}${token ? ' (token required)' : ''}`);

export { createRelay } from './server.js';
