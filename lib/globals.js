//--------------------------------------------------------------------------------------------------
// Global settings for the app (Both client and server)
//--------------------------------------------------------------------------------------------------

import { TAPi18n } from 'meteor/tap:i18n';
import { Meteor } from 'meteor/meteor';

const basePath = Meteor.isServer ? require('os').homedir() : _require('os').homedir();
const path = Meteor.isServer ? require('path') : _require('path');

const Globals = {
  supportedLangs: TAPi18n._getProjectLanguages(),
  defaultLanguage: 'no-NB',
  timeout: 5000,
  basePath: path.join(basePath, 'GrandView'),
};

export default Globals;
