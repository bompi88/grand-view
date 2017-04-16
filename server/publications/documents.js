////////////////////////////////////////////////////////////////////////////////
// Publications for Documents
////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////

import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Documents, Nodes, Files} from './../../lib/collections';

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
  Meteor.publish('documents.byId', function (_id) { return Documents.find({ _id }); });

  /**
   * Publish all resources linked to a doc;
   */
  Meteor.publish('documents.allByDocs', function (docIds) {

    const ids = _.isArray(docIds) ? docIds : [ docIds ];

    // get the document
    const docs = Documents.find({
      _id: { $in: ids }
    });

    const fetchedDocs = docs.fetch();

    let children = [];

    fetchedDocs.forEach((doc) => {
      if (doc.children) {
        children = children.concat(doc.children);
      }
    });

    var nodes = Nodes.find({
      _id: {
        $in: children
      }
    });

    var fetchedDocIds = _.pluck(fetchedDocs, '_id');

    var files = Files.find({
      docId: { $in: fetchedDocIds }
    }).cursor;

    return [ nodes, files, docs ];
  });

}
