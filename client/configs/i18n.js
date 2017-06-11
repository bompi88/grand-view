//--------------------------------------------------------------------------------------------------
// Notifications package configuration
//--------------------------------------------------------------------------------------------------

/* eslint no-console: 0 */

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
