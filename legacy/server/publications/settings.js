//--------------------------------------------------------------------------------------------------
// Publications for Settings
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';

import { Settings } from './../../lib/collections';

export default function () {
  Meteor.publish('settings', function () {
    return Settings.find({ _id: 'user' });
  });
}
