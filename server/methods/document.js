////////////////////////////////////////////////////////////////////////////////////////////////////
// Meteor methods operating on a single document
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
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';

import * as Collections from '/lib/collections';

export default function () {

  Meteor.methods({

    'document.setSelectedNode'(_id, nodeId) {
      check(_id, String);
      check(nodeId, String);

      Collections.Documents.update({
        _id
      }, {
        $set: {
          selectedNode: nodeId
        }
      });

      Collections.Nodes.update({
        mainDocId: _id
      }, {
        $set: {
          isSelected: false
        }
      }, {
        multi: true
      });

      Collections.Documents.update({
        _id
      }, {
        $set: {
          isSelected: false
        }
      }, {
        multi: false
      });

      if (_id === nodeId) {
        Collections.Documents.update({
          _id: nodeId
        }, {
          $set: {
            isSelected: true
          }
        });
      } else {
        Collections.Nodes.update({
          _id: nodeId
        }, {
          $set: {
            isSelected: true
          }
        });
      }
    },

    'document.removeNode'({_id, mainDocId, files}) {
      check(_id, String);
      check(mainDocId, String);
      check(undefined, Match.Maybe([ String ]));

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

      removeNode({ _id, mainDocId, files });
    },

    'document.makeTemplate'(_id) {
      const { _id: oldDocId, ...doc } = Collections.Documents.findOne({ _id });

      const mainDocId = Collections.Documents.insert({
        ...doc,
        isTemplate: true,
        lastChanged: new Date(),
        createdAt: new Date()
      });

      const idHashMap = {};
      idHashMap[oldDocId] = mainDocId;

      const chapterNodes = Collections.Nodes.find({
        nodeType: 'chapter',
        mainDocId: oldDocId
      }).fetch().map(node => {
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
          _parent: oldParent
        }, {
          $set: {
            parent: newParent
          },
          $unset: {
            _parent: ''
          }
        }, {
          multi: true,
          upsert: false
        });
      });

      return true;
    }
  });
}
