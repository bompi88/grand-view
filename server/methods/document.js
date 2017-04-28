import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import { Random } from 'meteor/random'

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
