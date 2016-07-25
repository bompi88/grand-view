import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

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

      Collections.Documents.insert(doc);
    },

    'documents.remove'(_id) {
      check(_id, String);

      Collections.Documents.softRemove({_id});
    }

  });
}
