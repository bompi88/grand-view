import Index from '../components/index/index';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearStates}, onData) => {
  onData(null, {});

  return clearStates;
};

export const depsMapper = (context, actions) => ({
  openCreateModal: actions.index.openCreateModal,
  importFile: actions.index.importFile,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Index);
