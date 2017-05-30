////////////////////////////////////////////////////////////////////////////////////////////////////
// Tags View Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, composeWithTracker} from 'mantra-core';
import CategoriesView from '../components/tree/categories_view';
import {_} from 'meteor/underscore';

const prepareName = (name, defaultValue) => {
  let newName = name ? name.trim() : defaultValue.trim();

  if (newName === '') {
    newName = defaultValue.trim();
  }

  return newName;
};

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections, TAPi18n } = context();
  const mainDocId = LocalState.get('CURRENT_DOCUMENT');

  const text = {
    noName: TAPi18n.__('no_title'),
    emptySet: TAPi18n.__('tree_view.no_tags'),
    header: TAPi18n.__('edit_view.tableHeaderTags'),
    uncategorized: TAPi18n.__('uncategorized')
  };

  if (Meteor.subscribe('nodes.byDoc', mainDocId, 'media').ready()) {
    const nodes = Collections.Nodes.find({
      mainDocId,
      nodeType: 'media'
    }, {
      sort: {
        name: 1
      }
    }).fetch()
    .sort((a, b) => {
      let nameA = prepareName(a.name, text.noName);
      let nameB = prepareName(b.name, text.noName);

      return nameA.toLowerCase().localeCompare(nameB.toLowerCase(), 'nb');
    });

    const tags = {};
    const emptyId = undefined;

    nodes.forEach((node) => {
      if (node.tags && node.tags.length) {
        node.tags.forEach((tag) => {
          if (!tags[tag.value]) {
            tags[tag.value] = [];
          }
          tags[tag.value].push(node);
        });
      } else {
        if (!tags[emptyId]) {
          tags[emptyId] = [];
        }
        tags[emptyId].push(node);
      }
    });

    const items = _.map(tags, (nds, category = 'undefined') => {
      return { category, nodes: nds, count: nds.length };
    }).sort((a, b) => {
      if (a.category === 'undefined') {
        return 1;
      }
      return a.category.toLowerCase().localeCompare(b.category.toLowerCase(), 'nb');
    });

    return onData(null, { items, text });
  }

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  setCurrentCategory: actions.editView.setCurrentTag,
  getCurrentCategory: actions.editView.getCurrentTag,
  context: () => context
});

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps(depsMapper)
)(CategoriesView);
