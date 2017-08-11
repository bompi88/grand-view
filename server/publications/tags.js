//--------------------------------------------------------------------------------------------------
// Publications for Tags Collection
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';

import { Tags } from './../../lib/collections';

export default function () {
  /**
   * Publish tags by query and sort
   */
  Meteor.publish('searchTags', function (queryText = '') {
    return Tags.find({
      text: { $regex: queryText, $options: 'i' },
    });
  });

  Meteor.publish('tags', function () {
    return Tags.find({}, { sort: { count: -1 }, limit: 20 });
  });
}
