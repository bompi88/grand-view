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

import { FS } from 'meteor/cfs:base-package';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import path from 'path';
import { HTTP } from 'meteor/http';

import { Documents, Nodes, Files, References, Tags } from '/lib/collections';

const contentTypes = [
  'image/png',
  'image/gif',
  'image/tif',
  'application/pdf'
];

export default function () {

  Meteor.methods({

    loadImage(url, nodeId, docId) {
      check(url, String);
      check(nodeId, String);
      check(docId, String);

      HTTP.call('GET', url, {
        npmRequestOptions: {
          encoding: null
        },
        followRedirects: true
      }, (error, response) => {
        if (error) {
          console.log( error );

        // If the link is accessible
        } else if (response.statusCode === 200) {
          const contentType = response.headers['content-type'];
          console.log(response.headers);
          if (contentTypes.includes(contentType)) {
            Files.load(url, {
              fileName: 'Uten Navn',
              meta: {
                nodeId,
                docId
              }
            });
          }
        }
      });
    },

    collapseAll(mainDocId) {
      check(mainDocId, String);

      Nodes.update({
        mainDocId
      }, {
        $set: { isCollapsed: true }
      }, {
        multi: true
      });
    },

    expandAll(mainDocId) {
      check(mainDocId, String);

      Nodes.update({
        mainDocId,
        isCollapsed: true
      }, {
        $set: { isCollapsed: false }
      }, {
        multi: true
      });
    },

    importResources(docs = [], nodes = [], fileDocs = [], srcPath) {

      const idTableNodes = {};
      const idTableFiles = {};

      const importDocs = _.isArray(docs) ? docs : [ docs ];
      const importNodes = _.isArray(nodes) ? nodes : [ nodes ];
      const importFileDocs = _.isArray(fileDocs) ? fileDocs : [ fileDocs ];

      _.each(importDocs, (doc, key, obj) => {
        const {_id} = doc;
        const importDoc = _.omit(doc, [
          '_id',
          'restoredAt',
          'restoredBy',
          'restored'
        ]);

        idTableNodes[_id] = Documents.insert(importDoc);

        obj[key]._id = idTableNodes[_id];
      });

      // Import nodes
      _.each(importNodes, (node) => {
        const {_id, tags, references} = node;
        const newNode = _.omit(node, '_id');
        idTableNodes[_id] = Nodes.insert(newNode);

        if (tags && tags.length) {
          _.each(tags, (tag) => {
            Tags.update({
              value: tag.toLowerCase()
            }, {
              $setOnInsert: {
                text: tag
              }
            }, {
              upsert: true
            });
          });
        }

        if (references && references.length) {
          _.each(references, (reference) => {
            References.update({
              value: reference.toLowerCase()
            }, {
              $setOnInsert: {
                text: reference
              }
            }, {
              upsert: true
            });
          });
        }
      });

      // import files
      _.each(importFileDocs, ({
        _id,
        nodeId,
        docId,
        original: {name},
        copies: {filesStore: {key}}
      }) => {
        const filePath = path.resolve(srcPath + '/' + key);

        const file = new FS.File(filePath);
        file.name(name);

        idTableFiles[_id] = Files.insert(file, () => {

          Files.update({
            _id: idTableFiles[_id]._id
          }, {
            $set: {
              nodeId: idTableNodes[nodeId],
              docId: idTableNodes[docId]
            }
          });

          Nodes.update({
            _id
          }, {
            $set: {
              fileId: idTableFiles[_id]._id,
              'original.name': name,
              'copies.filesStore.name': name
            }
          }, {
            multi: true,
            upsert: false
          });
        });
      });


      // Update parent refs in children
      nodes.forEach(({_id: nodeId, parent}) => {
        Nodes.update({
          _id: idTableNodes[nodeId]
        }, {
          $set: {
            parent: idTableNodes[parent]
          }
        });
      });

      // Update the children in main document
      _.each(docs, (doc) => {
        doc.children = _.map(doc.children, (childId) => idTableNodes[childId]);

        Documents.update({
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
    removeNodes(ids, callback) {

      Nodes.find({
        _id: {
          $in: ids || []
        }
      }).forEach((node) => {

        // Remove the linked files
        Files.remove({
          _id: node.fileId
        });

        // last remove the nodes
        Nodes.remove({
          _id: node._id
        });
      });

      return callback && callback() || true;
    },

    /**
     * Updates a neewly created document with the data from the template
     */
    deepCopyTemplate({_id: docId}, {_id: templateId, children: nodeIds = []}) {

      // Get all children
      const nodes = Nodes.find({
        _id: {
          $in: nodeIds
        }
      }).fetch();

      const nodeIdTable = {};

      // add The main document to id table
      nodeIdTable[templateId] = docId;

      const newChildren = [];

      // Create new children
      nodes.forEach((node) => {
        const nodeId = node._id;
        const newNode = _.omit(node, '_id');
        nodeIdTable[nodeId] = Nodes.insert(newNode);
        newChildren.push(nodeIdTable[nodeId]);
      });

      // Update the document with new children
      Documents.update({ _id: docId }, {
        $set: {
          children: newChildren
        }
      });

      // Update parent refs in children
      nodes.forEach(({_id, parent}) => {
        Nodes.update({
          _id: nodeIdTable[_id]
        }, {
          $set: {
            parent: nodeIdTable[parent]
          }
        });
      });
    },

    removeTag(value) {
      check(value, String);
      Tags.remove({ value });
    },

    insertTags(tags) {
      tags.forEach((tag) => {
        if (!Tags.findOne({ value: tag.value })) {
          Tags.insert({
            value: tag.value,
            label: tag.label
          });
        }
      });
    },

    removeReference(value) {
      check(value, String);
      References.remove({ value });
    },

    insertReferences(references) {
      references.forEach((reference) => {
        if (!References.findOne({ value: reference.value })) {
          References.insert({
            value: reference.value,
            label: reference.label
          });
        }
      });
    },

    updateNodePosition({fromPos, toPos, _id, fromParent, toParent}) {
      console.log(fromPos, toPos, _id, fromParent, toParent)
      Nodes.update({
        parent: fromParent,
        position: {
          $gt: fromPos
        }
      }, {
        $inc: {
          position: -1
        }
      }, {
        multi: true,
        upsert: false
      }, () => {
        Nodes.update({
          parent: toParent,
          position: {
            $gte: toPos
          }
        }, {
          $inc: {
            position: 1
          }
        }, {
          multi: true,
          upsert: false
        }, () => {
          Nodes.update({
            _id
          }, {
            $set: {
              parent: toParent,
              position: toPos
            }
          }, {
            upsert: false
          });
        });
      });
    },

    putIntoChapterNode({ parent, _id }) {

      const position = Nodes.find({ parent }).count() || 1;

      Nodes.update({
        _id
      }, {
        $set: {
          parent,
          position
        }
      }, {
        upsert: false
      });
    }
  });
}
