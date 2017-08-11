//--------------------------------------------------------------------------------------------------
// Publications for References Collection
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';

import { References } from './../../lib/collections';

export default function () {
  /**
   * Publish references by query and sort
   */
  Meteor.publish('searchReferences', function (queryText = '') {
    return References.find({
      text: { $regex: queryText, $options: 'i' },
    });
  });

  Meteor.publish('references', function () {
    return References.find({}, { sort: { count: -1 }, limit: 20 });
  });
}
