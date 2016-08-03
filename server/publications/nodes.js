////////////////////////////////////////////////////////////////////////////////
// Publications for Nodes collection
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

import {Nodes, Documents} from './../../lib/collections';

export default function () {

  /**
   * Publish all nodes that are being used by a document with a particular id.
   */
  Meteor.publish('nodes.byDocument', function (_id) {

    // get the document
    var doc = Documents.findOne({ _id });

    if (!doc) {
      return this.ready();
    }

    // If there is a document, return all its nodes
    return Nodes.find({
      _id: {
        $in: doc.children || []
      }
    });
  });

  /**
   * Publish a particular node by id
   */
  Meteor.publish('nodes.byId', function (_id) { return Nodes.find({ _id }); });

}
