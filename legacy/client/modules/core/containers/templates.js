import Templates from '../components/templates/templates';
import EditColumn from '../components/table/edit_column';

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context, clearState }, onData) => {
  const { Meteor, Collections, TAPi18n, LocalState } = context();

  const tableName = 'templates';

  const sort = LocalState.get('TABLE_SORT_TEMPLATES') || { title: 1 };

  const text = {
    header: TAPi18n.__('templates.header'),
    title: TAPi18n.__('templates.title'),
    createdAt: TAPi18n.__('templates.created_at'),
    lastModified: TAPi18n.__('templates.last_modified'),
    isEmpty: TAPi18n.__('templates.is_empty'),
    remove: TAPi18n.__('templates.remove'),
    export: TAPi18n.__('templates.export'),
  };

  const columns = [
    {
      label: TAPi18n.__('templates.title'),
      field: 'title',
      key: 'title',
      sortable: true,
    },
    {
      label: TAPi18n.__('templates.created_at'),
      field: 'createdAt',
      key: 'created-at',
      sortable: true,
      transform: 'formatDateRelative',
    },
    {
      label: TAPi18n.__('templates.last_modified'),
      field: 'lastModified',
      key: 'last-modified',
      sortable: true,
      transform: 'formatDateRelative',
    },
    {
      component: EditColumn,
      key: 'edit-column',
    },
  ];

  const props = {
    tableName,
    text,
    columns,
  };

  if (Meteor.subscribe('templates.all').ready() && Meteor.subscribe('templates.all').ready()) {
    const documents = Collections.Documents.find({
      isTemplate: true,
    }, { sort }).fetch();

    onData(null, {
      documents,
      ...props,
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
  formatDateRelative: actions.templates.formatDateRelative,
  createNewDocument: actions.templates.createNewTemplate,
  exportDocument: actions.templates.exportTemplate,
  removeDocument: actions.templates.removeTemplate,
  openDocument: actions.templates.openTemplate,
  toggleSelected: actions.templates.toggleSelected,
  isSelected: actions.templates.isSelected,
  selectAll: actions.templates.selectAll,
  deselectAll: actions.templates.deselectAll,
  hasAllSelected: actions.templates.hasAllSelected,
  toggleSort: actions.templates.toggleSort,
  getSort: actions.templates.getSort,
  clearState: actions.templates.clearState,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(Templates);
