// //////////////////////////////////////////////////////////////////////////////
// Global settings for the app (Both client and server)
// //////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// //////////////////////////////////////////////////////////////////////////////

/* globals _require */

import { TAPi18n } from 'meteor/tap:i18n';
import { Meteor } from 'meteor/meteor';

let basePath;
let path;

if (Meteor.isServer) {
  basePath = require('os').homedir();
  path = require('path');
} else {
  basePath = _require('os').homedir();
  path = _require('path');
}

const Globals = {
  supportedLangs: TAPi18n._getProjectLanguages(),
  defaultLanguage: 'no-NB',
  timeout: 5000,
  basePath: path.join(basePath, 'GrandView'),
};

export default Globals;
