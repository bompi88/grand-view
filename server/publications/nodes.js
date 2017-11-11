//--------------------------------------------------------------------------------------------------
// Publications for Nodes collection
//--------------------------------------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Nodes } from './../../lib/collections';

export default function () {
  /**
   * Publish all nodes that are being used by a document with a particular id.
   */
  Meteor.publish('nodes.byParent', function (parent) {
    check(parent, String);

    return Nodes.find({ parent });
  });

  Meteor.publish('nodes.mediaNodeCount', function (parent) {
    check(parent, String);

    const collectionName = 'counts';
    const countId = `mediaNodeCount${parent}`;
    const cursor = Nodes.find({ parent, nodeType: 'media' });

    const count = cursor.count();

    this.added(collectionName, countId, { count });

    const intervalID = Meteor.setInterval(
      () => this.changed(
        collectionName,
        countId,
        { count: cursor.count() || 0 },
      ),
      500,
    );

    this.onStop(() => {
      if (intervalID) {
        Meteor.clearInterval(intervalID);
      }
    });

    return this.ready();
  });

  /**
   * Publish a particular node by id
   */
  Meteor.publish('nodes.byId', function (_id) {
    check(_id, String);

    return Nodes.find({ _id });
  });

  Meteor.publish('nodes.byTag', function (docId, tag) {
    check(docId, String);
    check(tag, String);

    if (tag === 'undefined') {
      return Nodes.find({
        mainDocId: docId,
        $or: [
          {
            tags: { $exists: false },
          },
          {
            tags: { $size: 0 },
          },
        ],
        nodeType: 'media',
      });
    }

    return Nodes.find({ mainDocId: docId, 'tags.label': tag });
  });

  Meteor.publish('nodes.byReference', function (docId, reference) {
    check(docId, String);
    check(reference, String);

    if (reference === 'undefined') {
      return Nodes.find({
        mainDocId: docId,
        $or: [
          {
            references: { $exists: false },
          },
          {
            references: { $size: 0 },
          },
        ],
        nodeType: 'media',
      });
    }

    return Nodes.find({ mainDocId: docId, 'references.label': reference });
  });

  Meteor.publish('nodes.byDoc', function (mainDocId, nodeType) {
    check(mainDocId, String);
    check(nodeType, String);

    return Nodes.find({
      mainDocId,
      nodeType,
    });
  });
}
