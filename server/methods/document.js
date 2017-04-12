import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';

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
    }
  });
}
