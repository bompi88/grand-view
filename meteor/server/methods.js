////////////////////////////////////////////////////////////////////////////////
// Server Methods
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

Meteor.methods({

  import: function(doc, nodes, fileDocs) {

    // import main doc
    var docId = doc._id;
    doc = _.omit(doc, "_id");


    GV.collections.Documents.update({
      _id: docId
    }, {
      $set: doc
    }, {
      upsert: true
    });

    // Import nodes
    nodes.forEach(function(node) {
      var nodeId = node._id;
      node = _.omit(node, "_id");

      GV.collections.Nodes.update({
        _id: nodeId
      }, {
        $set: node
      }, {
        upsert: true
      });
    });

    // import files
    fileDocs.forEach(function(fileDoc) {
      var fileId = fileDoc._id;
      fileDoc = _.omit(fileDoc, "_id");
      fileDoc.copies.filesStore.updatedAt = new Date();

      GV.collections.Files.update({
        _id: fileId
      }, {
        $set: fileDoc
      }, {
        upsert: true
      });
    });

    return true;
  },

  existsDoc: function(id, callback) {
    return GV.collections.Documents.find({
      _id: id
    }).count() > 0;
  },

  /**
   * Called from the client side to remove all nodes in the array ids
   * @ids: Array of nodes ids
   * @callback: (optional) callback on complete
   * returns true after invokation
   */
  removeNodes: function(ids, callback) {

    GV.collections.Nodes.find({
      _id: {
        $in: ids || []
      }
    }).forEach(function(node) {

      // Remove the linked files
      GV.collections.Files.remove({
        _id: node.fileId
      });

      // last remove the nodes
      GV.collections.Nodes.remove({
        _id: node._id
      });
    });

    if (typeof callback !== 'undefined') {
      callback();
    }
    return true;
  }

});
