import Templates from '../components/templates/templates';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearState}, onData) => {
  const {Meteor, Collections, TAPi18n, LocalState} = context();

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

  const props = {
    tableName,
    text,
    showTemplates: false,
    showEditOptions: true,
  };

  if (Meteor.subscribe('templates.all').ready()) {
    const documents = Collections.Documents.find({
      isTemplate: true
    }, { sort }).fetch();

    onData(null, {
      documents,
      ...props
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
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
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Templates);
