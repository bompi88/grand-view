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

var path = Npm.require('path');

Meteor.methods({

  import: function(docs, nodes, fileDocs, srcPath) {

    var idTableNodes = {};
    var idTableFiles = {};

    if (!_.isArray(docs))
      docs = [docs];

    if (!_.isArray(nodes))
      nodes = [nodes];

    if (!_.isArray(fileDocs))
      fileDocs = [fileDocs];


    _.each(docs, function(doc, key, obj) {
      var docId = doc._id;
      doc = _.omit(doc, ["_id", "restoredAt", "restoredBy", "restored"]);
      idTableNodes[docId] = GV.collections.Documents.insert(doc);

      obj[key]._id = idTableNodes[docId];
    });

    // Import nodes
    _.each(nodes, function(node) {
      var nodeId = node._id;
      node = _.omit(node, "_id");
      idTableNodes[nodeId] = GV.collections.Nodes.insert(node);
    });

    // import files
    _.each(fileDocs, function(fileDoc) {
      var fileId = fileDoc._id;
      var filePath = path.resolve(srcPath + "/" + fileDoc.copies.filesStore.key);

      var file = new FS.File(filePath);
      file.name(fileDoc.original.name);

      idTableFiles[fileId] = GV.collections.Files.insert(file, function() {

        GV.collections.Files.update({
          _id: idTableFiles[fileId]._id
        }, {
          $set: {
            nodeId: idTableNodes[fileDoc.nodeId],
            docId: idTableNodes[fileDoc.docId]
          }
        });

        GV.collections.Nodes.update({
          fileId: fileId
        }, {
          $set: {
            fileId: idTableFiles[fileId]._id,
            "original.name": fileDoc.original.name,
            "copies.filesStore.name": fileDoc.original.name
          }
        }, {
          multi: true,
          upsert: false
        });
      });
    });


    var key;
    var val;

    // Update node references and doc reference
    for (key in idTableNodes) {
      if (idTableNodes.hasOwnProperty(key)) {
        val = idTableNodes[key];

        GV.collections.Nodes.update({
          parent: key.toString()
        }, {
          $set: {
            parent: val.toString()
          }
        }, {
          multi: true,
          upsert: false
        });
      }
    }

    // Update the children in main document
    _.each(docs, function(doc) {
      doc.children = _.map(doc.children, function(childId) {
        return idTableNodes[childId];
      });

      GV.collections.Documents.update({
        _id: doc._id
      }, {
        $set: {
          children: doc.children
        }
      });
    });


    return true;
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
