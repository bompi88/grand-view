// //////////////////////////////////////////////////////////////////////////////////////////////////
// Meteor methods operating on a single document
// //////////////////////////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////////////////////////

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';

import * as Collections from '/lib/collections';

export default function () {
  Meteor.methods({

    'document.setSelectedNode'(_id, nodeId) {
      check(_id, String);
      check(nodeId, String);

      Collections.Documents.update({
        _id,
      }, {
        $set: {
          selectedNode: nodeId,
        },
      });

      Collections.Nodes.update({
        mainDocId: _id,
      }, {
        $set: {
          isSelected: false,
        },
      }, {
        multi: true,
      });

      Collections.Documents.update({
        _id,
      }, {
        $set: {
          isSelected: false,
        },
      }, {
        multi: false,
      });

      if (_id === nodeId) {
        Collections.Documents.update({
          _id: nodeId,
        }, {
          $set: {
            isSelected: true,
          },
        });
      } else {
        Collections.Nodes.update({
          _id: nodeId,
        }, {
          $set: {
            isSelected: true,
          },
        });
      }
    },

    'document.removeNode'({ _id, mainDocId, files }) {
      check(_id, String);
      check(mainDocId, String);
      check(undefined, Match.Maybe([String]));

      const node2beRemoved = Collections.Nodes.findOne({ _id });

      const removeFile = (file) => {
        console.log('SHOULD REMOVE FILE', file);
      };

      const removeNode = (node) => {
        const children = Collections.Nodes.find({ parent: node._id, mainDocId });
        children.forEach((child) => {
          removeNode(child);
        });

        const docFiles = node.files;
        if (docFiles) {
          docFiles.forEach((file) => {
            removeFile(file);
          });
        }

        Collections.Nodes.remove({ _id: node._id, mainDocId });
      };


      Collections.Nodes.update({
        parent: node2beRemoved.parent,
        position: {
          $gt: node2beRemoved.position,
        },
        _id: { $ne: node2beRemoved._id },
      }, {
        $inc: {
          position: -1,
        },
      }, {
        multi: true,
        upsert: false,
      }, () => {
        removeNode({ _id, mainDocId, files });
      });
    },

    'document.makeTemplate'(_id) {
      const { _id: oldDocId, ...doc } = Collections.Documents.findOne({ _id });

      const mainDocId = Collections.Documents.insert({
        ...doc,
        isTemplate: true,
        lastChanged: new Date(),
        createdAt: new Date(),
      });

      const idHashMap = {};
      idHashMap[oldDocId] = mainDocId;

      const chapterNodes = Collections.Nodes.find({
        nodeType: 'chapter',
        mainDocId: oldDocId,
      }).fetch().map((node) => {
        node._parent = node.parent;
        delete node.parent;
        const nodeId = Random.id();
        idHashMap[node._id] = nodeId;
        return { ...node, _id: nodeId, mainDocId, lastChanged: new Date() };
      });

      chapterNodes.forEach((node) => {
        Collections.Nodes.insert(node);
      });

      Object.keys(idHashMap).forEach((oldParent) => {
        const newParent = idHashMap[oldParent];

        Collections.Nodes.update({
          _parent: oldParent,
        }, {
          $set: {
            parent: newParent,
          },
          $unset: {
            _parent: '',
          },
        }, {
          multi: true,
          upsert: false,
        });
      });

      return true;
    },
    'document.duplicateChapterNode'(docId, nodeId) {
      check(docId, String);
      check(nodeId, String);

      // Duplicate parent node and set position to be below the selected node
      const selectedNode = Collections.Nodes.findOne(nodeId);

      if (!selectedNode) {
        return;
      }

      const { position, parent, _id: selectedNodeId, ...dupNode } = selectedNode;

      // update positions for nodes with position > selected position => position + 1
      Collections.Nodes.update({
        parent,
        position: { $gt: position },
      }, {
        $inc: {
          position: 1,
        },
      }, {
        multi: true,
      });

      // insert new node at selected position + 1
      const ourParentNodeId = Collections.Nodes.insert({
        parent,
        position: position + 1,
        ...dupNode,
      });

      // map to store old parent to new parent values
      const parentMap = {
        [selectedNodeId]: ourParentNodeId,
      };

      const parentQueue = [selectedNodeId];

      while (parentQueue.length > 0) {
        const currentParent = parentQueue.shift();

        Collections.Nodes.find({
          parent: currentParent,
        }).forEach(function({ parent: ourParent, _id: willQueue, ...ourNode }) {
          const { nodeType } = ourNode;

          if (nodeType !== 'chapter') {
            return;
          }

          const newParentRef = parentMap[ourParent];
          const newNodeId = Collections.Nodes.insert({
            parent: newParentRef,
            ...ourNode,
          });
          parentQueue.push(willQueue);
          parentMap[willQueue] = newNodeId;
        });
      }

      // update last changed
      Collections.Documents.update({
        _id: docId,
      }, {
        $set: {
          lastChanged: new Date(),
        },
      });
    },
  });
}
