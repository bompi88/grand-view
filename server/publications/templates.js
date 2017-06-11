//--------------------------------------------------------------------------------------------------
// Publications for Templates
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';

import { Documents } from './../../lib/collections';

export default function () {
  /**
   * Publish all templates
   */
  Meteor.publish('templates.all', function () { return Documents.find({ isTemplate: true }); });

  /**
   * Publish all removed documents that a user owns or has access to
   */
  Meteor.publish('templates.removed', function () {
    return Documents.find({ isTemplate: true, removed: true });
  });
}
