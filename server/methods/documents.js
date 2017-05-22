////////////////////////////////////////////////////////////////////////////////////////////////////
// Meteor methods related to Documents view
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
import { _ } from 'meteor/underscore';
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
      Collections.Documents.update({ _id: mainDocId }, {
        $set: {
          selectedNode: mainDocId,
          isSelected: true
        }
      });

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
        Collections.Documents.softRemove({ _id: { $in: ids } });
      } else {
        Collections.Documents.softRemove({ _id: ids });
      }
    },

    'documents.remove'(ids) {
      check(ids, Match.OneOf(String, [ String ]));

      if (_.isArray(ids)) {
        Collections.Documents.remove({ _id: { $in: ids } });
        Collections.Nodes.remove({ mainDocId: { $in: ids }});
        Collections.Files.remove({ 'meta.docId': { $in: ids }});
      } else {
        Collections.Documents.remove({ _id: ids });
        Collections.Nodes.remove({ mainDocId: ids });
        Collections.Files.remove({ 'meta.docId': ids });
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
