//--------------------------------------------------------------------------------------------------
// Publications for Files Collection
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Files } from './../../lib/collections';

export default function () {
  Meteor.publish('files.byNode', function (nodeId) {
    check(nodeId, String);

    return Files.find({
      nodeId,
    }).cursor;
  });

  Meteor.publish('files.byDocument', function (docId) {
    check(docId, String);
    return Files.find({ 'meta.docId': docId }).cursor;
  });
}
