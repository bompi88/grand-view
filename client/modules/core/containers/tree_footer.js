import TreeFooter from '../components/tree/tree_footer';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n} = context();

  const items = [
    {
      state: 'tree',
      label: TAPi18n.__('tree_view.tree')
    },
    {
      state: 'tags',
      label: TAPi18n.__('tree_view.tags')
    },
    {
      state: 'references',
      label: TAPi18n.__('tree_view.references')
    }
  ];

  onData(null, {items});
};

export const depsMapper = (context, actions) => ({
  changeState: actions.treeView.changeState,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(TreeFooter);
