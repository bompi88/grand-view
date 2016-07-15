import {createApp} from 'mantra-core';
import initContext from './configs/context';
import initMenu from './configs/menu';

// Modules
import coreModule from './modules/core';
import indexModule from './modules/index';
import modalsModule from './modules/modals';

// Init context
const context = initContext();

// Init the Electron Menu
initMenu(context);

// Create app
const app = createApp(context);
app.loadModule(coreModule);
app.loadModule(indexModule);
app.loadModule(modalsModule);

app.init();
