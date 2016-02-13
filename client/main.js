import {createApp} from 'mantra-core';
import initContext from './configs/context';

// Modules
import coreModule from './modules/core';

// Init context
const context = initContext();

// Create app
const app = createApp(context);
app.loadModule(coreModule);
app.init();
