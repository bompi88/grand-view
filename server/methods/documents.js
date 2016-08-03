import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import {_} from 'meteor/underscore';

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

      if (hasTemplate.length && hasTemplate !== 'none') {
        doc.hasTemplate = hasTemplate;
      }

      return Collections.Documents.insert(doc);
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
      check(ids, [ String ]);

      Collections.Documents.remove({ _id: { $in: ids }});
    },

    'documents.restore'(ids) {
      check(ids, [ String ]);

      ids.forEach((id) => {
        Collections.Documents.restore(id);
      });
    },

    'documents.emptyTrash'() {
      const removedDocs = Collections.Documents.find({ removed: true }).fetch();

      const ids = _.pluck(removedDocs, '_id');
      Collections.Documents.remove({ _id: { $in: ids }});
    }

  });
}
