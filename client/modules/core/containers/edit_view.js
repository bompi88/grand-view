////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, composeWithTracker} from 'mantra-core';
import EditView from '../components/edit_view/edit_view';

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections } = context();
  const nodeId = LocalState.get('CURRENT_NODE') || doc && doc.selectedNode;
  const docId = LocalState.get('CURRENT_DOCUMENT');

  // If the root node is selected
  if (!nodeId || nodeId === docId) {
    if (Meteor.subscribe('documents.byId', docId).ready()) {
      const node = Collections.Documents.findOne({ _id: docId });
      node.nodeType = 'root';

      return onData(null, { node, initialValues: node });
    }
  // If one of all children are selected
  } else if (Meteor.subscribe('nodes.byId', nodeId).ready()) {
    const node = Collections.Nodes.findOne({ _id: nodeId });

    return onData(null, { node, initialValues: node });
  }
  onData(null, {});
};

export const depsMapper = (context, actions) => ({
  unsetEditable: actions.editView.unsetEditable,
  context: () => context
});

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps(depsMapper)
)(EditView);
