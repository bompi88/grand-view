import ConfButton from '../components/edit_view/conf_button';

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context, clearState }, onData) => {
  const { TAPi18n, LocalState } = context();

  const mode = LocalState.get('SELECTED_MODE') || 'easy';

  const text = {
    collapsedMode: TAPi18n.__('edit_view.confButton.collapsedMode'),
    expandedMode: TAPi18n.__('edit_view.confButton.expandedMode')
  };

  onData(null, { text, mode });

  return clearState;
};

export const depsMapper = (context, actions) => ({
  changeMode: actions.editView.changeMode,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ConfButton);
