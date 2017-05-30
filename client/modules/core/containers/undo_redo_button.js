import UndoRedoButton from '../components/edit_view/undo_redo_button';

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context, clearState }, onData) => {
  const { TAPi18n } = context();

  const text = {
    undo: TAPi18n.__('edit_view.undoRedoButton.undo'),
    redo: TAPi18n.__('edit_view.undoRedoButton.redo')
  };

  onData(null, { text });

  return clearState;
};

export const depsMapper = (context, actions) => ({
  undo: actions.editView.undo,
  redo: actions.editView.redo,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(UndoRedoButton);
