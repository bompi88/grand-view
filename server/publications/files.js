////////////////////////////////////////////////////////////////////////////////
// Publications for Files Collection
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

import {Nodes, Files} from './../../lib/collections';

export default function () {

  Meteor.publish('files.byId', function (_id) { return Files.find({ _id }).cursor; });

  Meteor.publish('files.byParent', function (id) {

    const nodes = Nodes.find({
      parent: id
    }).fetch();
    const ids = _.pluck(nodes, '_id') || [];

    ids.push(id);

    return Files.find({
      nodeId: {
        $in: ids
      }
    }).cursor;
  });

  Meteor.publish('files.byNode', function (id) {
    return Files.find({
      nodeId: id
    }).cursor;
  });

  Meteor.publish('files.byDocument', function (docId) { return Files.find({ docId }).cursor; });

  Meteor.publish('files.byArtificialNode', function (an) {

    var nodes = [];

    if (an.type === 'tag') {
      nodes = Nodes.find({
        tags: an.value
      }).fetch();
    } else if (an.type === 'reference') {
      nodes = Nodes.find({
        references: an.value
      }).fetch();
    } else {
      return this.ready();
    }

    var ids = _.pluck(nodes, '_id') || [];

    return Files.find({
      nodeId: {
        $in: ids
      }
    }).cursor;
  });
}
