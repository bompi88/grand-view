// //////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Container
// //////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import EditView from '../components/edit_view/edit_view';

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections, TAPi18n } = context();
  const nodeId = LocalState.get('CURRENT_NODE') || doc && doc.selectedNode;
  const docId = LocalState.get('CURRENT_DOCUMENT');
  const mode = LocalState.get('SELECTED_MODE') || 'easy';

  const text = {
    projectDescription: TAPi18n.__('edit_view.projectDescription'),
    mediaView: TAPi18n.__('edit_view.mediaView'),
    chapterView: TAPi18n.__('edit_view.chapterView'),
  };


  // If the root node is selected
  if (!nodeId || nodeId === docId) {
    if (Meteor.subscribe('documents.byId', docId).ready()) {
      const node = Collections.Documents.findOne({ _id: docId });
      node.nodeType = 'root';

      return onData(null, { node, mode, text, initialValues: node });
    }
  // If one of all children are selected
  } else if (Meteor.subscribe('nodes.byId', nodeId).ready()) {
    const node = Collections.Nodes.findOne({ _id: nodeId });

    return onData(null, { node, mode, text, initialValues: node });
  }
  onData(null, { text, mode });
};

export const depsMapper = (context, actions) => ({
  unsetEditable: actions.editView.unsetEditable,
  context: () => context,
});

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps(depsMapper),
)(EditView);
