import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
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

    'documents.softRemove'(_id) {
      check(_id, String);

      Collections.Documents.softRemove({_id});
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
