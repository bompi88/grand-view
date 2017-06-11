//--------------------------------------------------------------------------------------------------
// Publications for Documents
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Documents, Nodes, Files } from './../../lib/collections';

export default function () {
  /**
   * Publish all documents that a user owns or has access to
   */
  Meteor.publish('documents.all', function () { return Documents.find({ isTemplate: false }); });

  /**
   * Publish all removed documents that a user owns or has access to
   */
  Meteor.publish('documents.removed', function () {
    return Documents.find({ isTemplate: false, removed: true });
  });

  /**
   * Publish a particular document by its id, if the user owns it or
   * has access to it.
   */
  Meteor.publish('documents.byId', function (_id) {
    return Documents.find({ _id });
  });

  /**
   * Publish all resources linked to a doc;
   */
  Meteor.publish('documents.allByDocs', function (docIds) {

    const ids = _.isArray(docIds) ? docIds : [ docIds ];

    // get the document
    const docs = Documents.find({
      _id: {
        $in: ids,
      },
    });

    const nodes = Nodes.find({
      mainDocId: {
        $in: ids,
      },
    });

    const files = Files.find({
      'meta.docId': {
        $in: ids,
      },
    }).cursor;

    return [ nodes, files, docs ];
  });
}
