import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import * as Collections from '/lib/collections';

export default function () {
  Migrations.add({
    version: 1,
    up() {
      // Update all tags
      Collections.Tags.find().forEach(({ value, text, label, _id, ...tag }) => {
        Collections.Tags.update({
          _id,
        }, {
          $set: {
            ...tag,
            value,
            text: text || label,
          },
          $unset: {
            label: '',
          },
        });
      });

      // Update all references
      Collections.References.find().forEach(({ value, text, label, _id, ...reference }) => {
        Collections.References.update({
          _id,
        }, {
          $set: {
            ...reference,
            value,
            text: text || label,
          },
          $unset: {
            label: '',
          },
        });
      });

      // Update all nodes
      Collections.Nodes.find().forEach(({ _id, tags = [], references = [] }) => {
        const newTags = tags.map(({ value, label, text }) => {
          return {
            value,
            text: text || label,
          };
        });

        const newReferences = references.map(({ value, label, text }) => {
          return {
            value,
            text: text || label,
          };
        });

        Collections.Nodes.update({
          _id,
        }, {
          $set: {
            tags: newTags,
            references: newReferences,
          },
        });
      });
    },
    down() {},
  });

  Meteor.startup(() => {
    Migrations.migrateTo('latest');
  });
}
