import Tree from '../components/tree/tree';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { Meteor, LocalState, Collections, TAPi18n } = context();

  const _id = LocalState.get('CURRENT_DOCUMENT');
  const currentView = LocalState.get('TREE_VIEW_STATE') || 'tree';

  const text = {
    tree: TAPi18n.__('tree_view.tree'),
    tags: TAPi18n.__('tree_view.tags'),
    references: TAPi18n.__('tree_view.references'),
  };

  const props = {
    text,
    currentView,
  };

  if (Meteor.subscribe('nodes.byParent', _id)) {
    const selector = {
      parent: _id,
      nodeType: 'chapter',
    };

    const options = {
      sort: { position: 1 },
    };

    const nodes = Collections.Nodes.find(selector, options).fetch();

    onData(null, {
      nodes,
      ...props,
    });
  } else {
    onData(null, props);
  }
};

export const depsMapper = context => ({
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(Tree);
