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

"use strict";

Meteor.publish('fileById', function(id) {
  // return the documents that the current user owns
  return GV.collections.Files.find({
    _id: id
  });
});

Meteor.publish('fileByNode', function(id) {

  var nodes = GV.collections.Nodes.find({
    parent: id
  }).fetch();
  var ids = _.pluck(nodes, "_id") || [];

  ids.push(id);

  // return the documents that the current user owns
  return GV.collections.Files.find({
    nodeId: {
      $in: ids
    }
  });
});

Meteor.publish('filesByDocument', function(id) {
  // return the documents that the current user owns
  return GV.collections.Files.find({
    docId: id
  });
});

Meteor.publish('filesByArtificialNode', function(an) {

  var nodes = [];

  if(an.type === 'tag') {
    nodes = GV.collections.Nodes.find({
      tags: an.value
    }).fetch();
  } else if(an.type === 'reference') {
    nodes = GV.collections.Nodes.find({
      references: an.value
    }).fetch();
  } else {
    return this.ready();
  }

  var ids = _.pluck(nodes, "_id") || [];

  // return the documents that the current user owns
  return GV.collections.Files.find({
    nodeId: {
      $in: ids
    }
  });
});
