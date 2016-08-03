import {createApp} from 'mantra-core';
import initContext from './configs/context';
import initMenu from './configs/menu';
import initi18n from './configs/i18n';
import initMoment from './configs/moment';

// Modules
import coreModule from './modules/core';
import indexModule from './modules/index';
import modalsModule from './modules/modals';

// Init context
const context = initContext();

// configurations
initMenu(context);
initi18n(context);
initMoment(context);

// Create app
const app = createApp(context);
app.loadModule(coreModule);
app.loadModule(indexModule);
app.loadModule(modalsModule);

app.init();