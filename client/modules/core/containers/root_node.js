import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { RootNode } from '../components/tree/root_node';

export const composer = ({ context }, onData) => {
  onData(null, {});
};

export const depsMapper = (context, actions) => ({
  handleClick: actions.node.handleClick,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(RootNode);
