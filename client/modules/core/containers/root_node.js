import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { RootNode } from '../components/tree/root_node';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections, LocalState } = context();

  const showMediaNodes = LocalState.get('MEDIA_NODES_VISIBLE') || false;
  const parent = LocalState.get('CURRENT_DOCUMENT');

  if (Meteor.subscribe('nodes.byParent', parent).ready()) {
    const selector = {
      parent
    };

    const options = {};

    if (showMediaNodes) {
      options.sort = [
        [ 'nodeType', 'asc' ],
        [ 'position', 'asc' ]
      ];
      const nodes = Collections.Nodes.find(selector, options).fetch();

      return onData(null, {
        nodes
      });
    }

  }
  onData(null, {});
};

export const depsMapper = (context, actions) => ({
  handleClick: actions.node.handleClick,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(RootNode);
