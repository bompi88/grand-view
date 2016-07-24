import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import * as Collections from '/lib/collections';

export default function () {

  Meteor.methods({
    'settings.changeLanguage'(language) {
      check(language, String);

      Collections.Settings.update({ _id: 'user' }, { language }, { upsert: true });
    }
  });
}
