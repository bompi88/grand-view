import Documents from '../components/documents/documents';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearState}, onData) => {
  const {Meteor, Collections, TAPi18n, LocalState} = context();

  const tableName = 'documents';
  const sort = LocalState.get('TABLE_SORT_DOCUMENTS') || { title: 1 };

  const text = {
    header: TAPi18n.__('documents.header'),
    title: TAPi18n.__('documents.title'),
    createdAt: TAPi18n.__('documents.created_at'),
    lastModified: TAPi18n.__('documents.last_modified'),
    isEmpty: TAPi18n.__('documents.is_empty'),
    remove: TAPi18n.__('documents.remove'),
    export: TAPi18n.__('documents.export'),
    by: TAPi18n.__('documents.by'),
    templateUsed: TAPi18n.__('documents.template_used')
  };

  const props = {
    tableName,
    text,
    showTemplates: true,
    showEditOptions: true
  };

  if (Meteor.subscribe('documents.all').ready() && Meteor.subscribe('templates.all').ready()) {
    const documents = Collections.Documents.find({
      isTemplate: false
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
  createNewDocument: actions.documents.createNewDocument,
  exportDocument: actions.documents.exportDocument,
  removeDocument: actions.documents.removeDocument,
  openDocument: actions.documents.openDocument,
  getTemplateTitle: actions.documents.getTemplateTitle,
  toggleSelected: actions.documents.toggleSelected,
  isSelected: actions.documents.isSelected,
  selectAll: actions.documents.selectAll,
  deselectAll: actions.documents.deselectAll,
  hasAllSelected: actions.documents.hasAllSelected,
  toggleSort: actions.documents.toggleSort,
  getSort: actions.documents.getSort,
  clearState: actions.documents.clearState,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Documents);
