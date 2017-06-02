////////////////////////////////////////////////////////////////////////////////////////////////////
// Server Methods
////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2017 Bjørn Bråthen, Concept NTNU
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
////////////////////////////////////////////////////////////////////////////////////////////////////

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import path from 'path';
import { HTTP } from 'meteor/http';
import Globals from '/lib/globals';
import { Random } from 'meteor/random';
import fs from 'fs';

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

      const importDocs = _.isArray(docs) ? docs : [ docs ];
      const importNodes = _.isArray(nodes) ? nodes : [ nodes ];
      const importFileDocs = _.isArray(fileDocs) ? fileDocs : [ fileDocs ];

      _.each(importDocs, (doc, key, obj) => {
        const { _id } = doc;
        const importDoc = _.omit(doc, [
          '_id',
          'restoredAt',
          'restoredBy',
          'restored',
          'selectedNode',
          'isSelected'
        ]);

        idTableNodes[_id] = Documents.insert(importDoc);

        obj[key]._id = idTableNodes[_id];
      });

      // Import nodes
      _.each(importNodes, (node) => {
        const { _id, tags, references } = node;
        const newNode = _.omit(node, [ '_id', 'isSelected' ]);
        newNode.mainDocId = idTableNodes[newNode.mainDocId];

        idTableNodes[_id] = Nodes.insert(newNode);

        if (tags && tags.length) {
          _.each(tags, (tag) => {
            Tags.update({
              value: tag.value.toLowerCase()
            }, {
              $setOnInsert: {
                text: tag.label
              }
            }, {
              upsert: true
            });
          });
        }

        if (references && references.length) {
          _.each(references, (reference) => {
            References.update({
              value: reference.value.toLowerCase()
            }, {
              $setOnInsert: {
                text: reference.label
              }
            }, {
              upsert: true
            });
          });
        }
      });

      // import files
      _.each(importFileDocs, (fileObj) => {
        const {
          _id,
          meta: { nodeId, docId },
          name,
          type,
          size,
          ext
        } = fileObj;

        const oldPath = path.resolve(path.join(srcPath, _id));
        const fileId = Random.id();
        const newPath = path.resolve(Globals.basePath, 'files', fileId + '.' + ext);

        fs.rename(oldPath, newPath, () => {
          Files.addFile(newPath, {
            fileName: name,
            meta: {
              nodeId: idTableNodes[nodeId],
              docId: idTableNodes[docId]
            },
            type,
            size,
            fileId
          }, (error, fileRef) => {

            if (error) {
              return console.log(error);
            }

            Nodes.update({
              _id
            }, {
              $set: {
                fileId: fileRef._id
              }
            }, {
              multi: true,
              upsert: false
            });
          });
        });
      });


      // Update parent refs in children
      nodes.forEach(({ _id: nodeId, parent }) => {
        Nodes.update({
          _id: idTableNodes[nodeId]
        }, {
          $set: {
            parent: idTableNodes[parent]
          }
        });
      });

      return true;
    },

    removeTag(value) {
      check(value, String);
      Tags.remove({ value });
    },

    insertTags(tags) {
      tags.forEach(({ value, label }) => {
        if (!Tags.findOne({ value })) {
          Tags.insert({
            value,
            label
          });
        } else {
          Tags.update({
            value
          }, {
            $inc: { count: 1 }
          });
        }
      });
    },

    removeReference(value) {
      check(value, String);
      References.remove({ value });
    },

    insertReferences(references) {
      references.forEach(({ value, label }) => {
        if (!References.findOne({ value })) {
          References.insert({
            value,
            label
          });
        } else {
          References.update({
            value
          }, {
            $inc: { count: 1 }
          });
        }
      });
    },

    updateMediaNodePosition({ toPos, _id, toParent}) {

      let newParent;

      const node = Nodes.findOne({ _id });

      const {
        parent: oldParent,
        position: fromPos
      } = node;

      if (!toParent) {
        newParent = oldParent;
      }

      Nodes.update({
        parent: oldParent,
        position: {
          $gt: fromPos
        },
        nodeType: 'media',
        _id: { $ne: _id }
      }, {
        $inc: {
          position: -1
        }
      }, {
        multi: true,
        upsert: false
      }, () => {
        Nodes.update({
          parent: newParent,
          position: {
            $gte: toPos + 1
          },
          nodeType: 'media',
          _id: { $ne: _id }
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
              parent: newParent,
              position: toPos + 1
            }
          }, {
            upsert: false
          });
        });
      });
    },

    updateNodePosition({ fromPos, toPos, nodeAboveId, _id, fromParent, toParent }) {
      const newParent = Nodes.findOne({ _id: toParent });

      Nodes.update({
        parent: fromParent,
        position: {
          $gt: fromPos
        },
        nodeType: 'chapter',
        _id: { $ne: _id }
      }, {
        $inc: {
          position: -1
        }
      }, {
        multi: true,
        upsert: false
      }, () => {
        let toPosOriginal;
        if (nodeAboveId) {
          toPosOriginal = Nodes.findOne({ _id: nodeAboveId }).position;
        }

        Nodes.update({
          parent: toParent,
          position: {
            $gte: toPos || toPosOriginal + 1
          },
          nodeType: 'chapter',
          _id: { $ne: _id }
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
              position: toPos || toPosOriginal + 1,
              level: newParent && newParent.level + 1 || 1
            }
          }, {
            upsert: false
          });
        });
      });
    },

    putIntoChapterNode({ parent, _id }) {
      const droppedNode = Nodes.findOne({ _id });
      const parentNode = Nodes.findOne({ _id: parent });

      const nodeCount = Nodes.find({ parent, nodeType: 'chapter', _id: { $ne: _id } }).count();
      const position = nodeCount === 0 ? 1 : nodeCount + 1;

      Nodes.update({
        parent: droppedNode.parent,
        position: {
          $gt: droppedNode.position
        },
        nodeType: 'chapter',
        _id: { $ne: _id }
      }, {
        $inc: {
          position: -1
        }
      }, {
        multi: true,
        upsert: false
      }, () => {
        Nodes.update({
          _id
        }, {
          $set: {
            parent,
            position,
            level: parentNode.level + 1
          }
        }, {
          upsert: false
        });
      });
    }
  });
}
