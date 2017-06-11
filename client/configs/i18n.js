// //////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
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

/* eslint no-console: 0 */
/* globals _require */

import { Settings } from './../../lib/collections';
const { app } = _require('electron').remote;

const getUserLanguage = function () {
  const { language } = Settings.findOne({ _id: 'user' });
  return language;
};

export default function ({ Meteor, TAPi18n, Tracker, moment }) {
  // Set langugae based on system locale
  Meteor.call('setLocale', app.getLocale());

  Meteor.startup(() => {
    Tracker.autorun(() => {
      if (Meteor.subscribe('settings').ready()) {
        const lang = getUserLanguage();
        TAPi18n.setLanguage(lang)
        .done(() => {
          if (lang === 'no-NB') {
            moment.locale('nb');
          } else if (lang === 'en') {
            moment.locale('en');
          }
          console.log(`Language set as: ${TAPi18n.getLanguage()}`);
        })
        .fail((error) => {
          console.log(error);
        });
      }
    });
  });
}
