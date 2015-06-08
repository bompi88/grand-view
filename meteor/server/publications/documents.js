////////////////////////////////////////////////////////////////////////////////
// Publications for Documents collection
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


"use strict";


/**
 * Publish all documents that a user owns or has access to
 */
Meteor.publish('documents', function() {

  var uid = GV.helpers.userId(this.userId);

	// return the documents that the current user owns
	return GV.collections.Documents.find({ userId: uid });
});

/**
 * Publish a particular document by its id, if the user owns it or
 * has access to it.
 */
Meteor.publish('documentById', function(id) {

  var uid = GV.helpers.userId(this.userId);
	return GV.collections.Documents.find({ $and: [ { _id: id }, { userId: uid }] });
});

/**
 * Publish all resources linked to a doc;
 */
Meteor.publish('allByDoc', function(id) {
  var uid = GV.helpers.userId(this.userId);

  // get the document
  var doc = GV.collections.Documents.find({ $and: [{ _id: id }, { userId: uid }] }).fetch();

  if(doc && doc[0]) {
    var nodes = GV.collections.Nodes.find({ $and: [{_id: { $in : doc[0].children || [] }}]});
    var files = GV.collections.Files.find({ docId: id });

    return [nodes, files];
  } else {
    return this.ready();
  }
});

