////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import EditViewTemplate from '../components/edit_view/edit_view_template';

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections, TAPi18n } = context();
  const nodeId = LocalState.get('CURRENT_NODE') || doc && doc.selectedNode;
  const docId = LocalState.get('CURRENT_DOCUMENT');

  const text = {
    header: TAPi18n.__('edit_view.chapterView')
  };


  // If the root node is selected
  if (!nodeId || nodeId === docId) {
    if (Meteor.subscribe('documents.byId', docId).ready()) {
      const node = Collections.Documents.findOne({ _id: docId });
      node.nodeType = 'root';

      return onData(null, { node, text, initialValues: node });
    }
  // If one of all children are selected
  } else if (Meteor.subscribe('nodes.byId', nodeId).ready()) {
    const node = Collections.Nodes.findOne({ _id: nodeId });

    return onData(null, { node, text, initialValues: node });
  }
  onData(null, { text });
};

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps()
)(EditViewTemplate);
