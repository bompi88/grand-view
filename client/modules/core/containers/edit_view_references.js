// //////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Container
// //////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import EditViewCategory from '../components/edit_view/edit_view_category';

const prepareName = (name, defaultValue) => {
  let newName = name ? name.trim() : defaultValue.trim();

  if (newName === '') {
    newName = defaultValue.trim();
  }

  return newName;
};

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections, TAPi18n } = context();
  const reference = LocalState.get('CURRENT_REFERENCE');
  const docId = LocalState.get('CURRENT_DOCUMENT');
  const mode = LocalState.get('SELECTED_MODE') || 'easy';

  const text = {
    noName: TAPi18n.__('no_title'),
    header: TAPi18n.__('edit_view.referenceHeader'),
    tableHeader: TAPi18n.__('edit_view.tableHeaderReferences'),
    isEmpty: TAPi18n.__('edit_view.isEmptyReferences'),
    selectToProceed: TAPi18n.__('edit_view.selectToProceedReferences'),
  };

  if (reference && Meteor.subscribe('nodes.byReference', docId, reference).ready()) {
    let fetchedNodes;

    if (reference === 'undefined') {
      fetchedNodes = Collections.Nodes.find({
        mainDocId: docId,
        $or: [{ references: { $exists: false } }, { references: { $size: 0 } }],
        nodeType: 'media',
      }, {
        sort: { name: 1 },
        reactive: false,
      }).fetch();
    } else {
      fetchedNodes = Collections.Nodes.find({
        mainDocId: docId,
        'references.label': reference,
        nodeType: 'media',
      }, {
        sort: { name: 1 },
        reactive: false,
      }).fetch();
    }

    const nodes = fetchedNodes.sort((a, b) => {
      const nameA = prepareName(a.name, text.noName);
      const nameB = prepareName(b.name, text.noName);

      return nameA.toLowerCase().localeCompare(nameB.toLowerCase(), 'nb');
    });

    return onData(null, { nodes, mode, text, category: reference, type: 'reference' });
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
)(EditViewCategory);
