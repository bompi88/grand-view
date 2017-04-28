import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import {_} from 'meteor/underscore';
import { Random } from 'meteor/random';

import * as Collections from '/lib/collections';

export default function () {

  Meteor.methods({

    'documents.create'({title, isTemplate = false, hasTemplate = 'none'}) {
      check(title, String);
      check(isTemplate, Boolean);
      check(hasTemplate, String);

      const doc = {
        title,
        isTemplate,
        lastModified: new Date(),
        createdAt: new Date()
      };
      const updateWithTemplate = hasTemplate.length && hasTemplate !== 'none';

      if (updateWithTemplate) {
        doc.hasTemplate = hasTemplate;
      }

      const mainDocId = Collections.Documents.insert(doc);

      if (!updateWithTemplate) {
        return mainDocId;
      }

      // Update with nodes from template

      const idHashMap = {};
      idHashMap[hasTemplate] = mainDocId;

      const chapterNodes = Collections.Nodes.find({
        nodeType: 'chapter',
        mainDocId: hasTemplate
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

      return mainDocId;
    },

    'documents.softRemove'(ids) {
      check(ids, Match.OneOf(String, [ String ]));

      if (_.isArray(ids)) {
        Collections.Documents.softRemove({_id: { $in: ids }});
      } else {
        Collections.Documents.softRemove({_id: ids});
      }
    },

    'documents.remove'(ids) {
      check(ids, Match.OneOf(String, [ String ]));

      if (_.isArray(ids)) {
        Collections.Documents.remove({_id: { $in: ids }});
      } else {
        Collections.Documents.remove({_id: ids});
      }
    },

    'documents.restore'(ids) {
      check(ids, Match.OneOf(String, [ String ]));
      if (_.isArray(ids)) {
        ids.forEach((id) => {
          Collections.Documents.restore(id);
        });
      } else {
        Collections.Documents.restore(ids);
      }
    },

    'documents.emptyTrash'() {
      const removedDocs = Collections.Documents.find({ removed: true }).fetch();

      const ids = _.pluck(removedDocs, '_id');
      Collections.Documents.remove({ _id: { $in: ids }});
    }

  });
}
