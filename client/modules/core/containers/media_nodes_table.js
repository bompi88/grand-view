import NodesTable from '../components/table/nodes_table';

import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearState, chapterNode}, onData) => {
  const { Meteor, Collections, TAPi18n, LocalState } = context();

  const { _id: parent } = chapterNode;
  const tableName = 'mediaNodes';
  const editNode = LocalState.get('EDIT_NODE');

  const text = {
    informationelement: TAPi18n.__('edit_view.informationelement'),
    isEmpty: TAPi18n.__('edit_view.empty'),
    header: TAPi18n.__('edit_view.tableHeader'),
    closeFormInfo: TAPi18n.__('edit_view.form.close_form_info'),
    references: TAPi18n.__('edit_view.references'),
    tags: TAPi18n.__('edit_view.tags'),
    attachments: TAPi18n.__('edit_view.attachments')
  };

  const props = {
    tableName,
    text,
    editNode
  };

  if (Meteor.subscribe('nodes.byParent', parent).ready()) {
    const nodes = Collections.Nodes.find({
      parent,
      nodeType: 'media'
    }).fetch();

    onData(null, {
      nodes,
      ...props
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
  addMediaNode: actions.editView.addMediaNode,
  toggleSelected: actions.templates.toggleSelected,
  isSelected: actions.templates.isSelected,
  selectAll: actions.templates.selectAll,
  deselectAll: actions.templates.deselectAll,
  hasAllSelected: actions.templates.hasAllSelected,
  setAsEditable: actions.editView.setAsEditable,
  clearState: actions.templates.clearState,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(NodesTable);
