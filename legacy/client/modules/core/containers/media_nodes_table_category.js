import NodesTable from '../components/table/nodes_table_category';

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({
  context,
  clearState,
  nodes,
  category,
  type,
  text: { tableHeader, isEmpty },
}, onData) => {
  const { TAPi18n, LocalState } = context();

  const tableName = `mediaNodes${type}${category}`;
  const editNode = LocalState.get('EDIT_NODE');
  const text = {
    informationelement: TAPi18n.__('edit_view.informationelement'),
    isEmpty,
    closeFormInfo: TAPi18n.__('edit_view.form.close_form_info'),
    references: TAPi18n.__('edit_view.references'),
    tags: TAPi18n.__('edit_view.tags'),
    attachments: TAPi18n.__('edit_view.attachments'),
    noName: TAPi18n.__('no_title'),
    chooseAction: TAPi18n.__('chooseAction'),
    removeSelected: TAPi18n.__('removeSelected'),
    tableHeader,
  };

  const props = {
    tableName,
    text,
    editNode,
  };

  if (nodes) {
    onData(null, {
      nodes,
      ...props,
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
  addMediaNode: actions.editView.addMediaNode,
  unsetNodeEditable: actions.editView.unsetNodeEditable,
  toggleSelected: actions.templates.toggleSelected,
  isSelected: actions.templates.isSelected,
  selectAll: actions.templates.selectAll,
  deselectAll: actions.templates.deselectAll,
  hasAllSelected: actions.templates.hasAllSelected,
  isDisabledOnNone: actions.templates.isDisabledOnNone,
  setNodeEditable: actions.editView.setNodeEditable,
  clearState: actions.templates.clearState,
  openLink: actions.editView.openLink,
  updateMediaNodePosition: actions.editView.updateMediaNodePosition,
  removeSelectedNodes: actions.contextMenus.removeSelectedNodes,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(NodesTable);
