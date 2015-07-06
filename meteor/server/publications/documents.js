////////////////////////////////////////////////////////////////////////////////
// Publications for Documents Collection
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

/**
 * Publish all documents that a user owns or has access to
 */
Meteor.publish('documents', function() {

  // return the documents that the current user owns
  return GV.collections.Documents.find();
});

/**
 * Publish all removed documents that a user owns or has access to
 */
Meteor.publish('removedDocuments', function() {

  // return the documents that the current user owns
  return GV.collections.Documents.find({
    removed: true
  });
});


/**
 * Publish all templates
 */
Meteor.publish('templates', function() {

  // return the documents that the current user owns
  return GV.collections.Documents.find({
    template: true
  });
});

/**
 * Publish all removed documents that a user owns or has access to
 */
Meteor.publish('removedTemplates', function() {

  // return the documents that the current user owns
  return GV.collections.Documents.find({
    template: true,
    removed: true
  });
});

/**
 * Publish a particular document by its id, if the user owns it or
 * has access to it.
 */
Meteor.publish('documentById', function(id) {

  return GV.collections.Documents.find({
    _id: id
  });
});

/**
 * Publish all resources linked to a doc;
 */
Meteor.publish('allByDoc', function(id) {

  // get the document
  var doc = GV.collections.Documents.find({
    _id: id
  }).fetch();

  if (doc && doc[0]) {
    var nodes = GV.collections.Nodes.find({
      _id: {
        $in: doc[0].children || []
      }
    });

    var files = GV.collections.Files.find({
      docId: id
    });

    return [nodes, files];
  } else {
    return this.ready();
  }
});
