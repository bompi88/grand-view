import DocumentTableDropdown from '../components/table_dropdown/table_dropdown';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n} = context();

  const items = [
    {
      func: 'createNewDocument',
      icon: 'glyphicon glyphicon-plus',
      label: TAPi18n.__('dropdowns.document_table.create_document'),
    },
    {
      func: 'openSelectedDocument',
      icon: 'glyphicon glyphicon-edit',
      label: TAPi18n.__('dropdowns.document_table.edit_document'),
      disabledOn: 'MANY_AND_NONE'
    },
    {
      divider: true
    },
    {
      func: 'importDocuments',
      icon: 'glyphicon glyphicon-import',
      label: TAPi18n.__('dropdowns.document_table.import_document')
    },
    {
      func: 'exportSelectedDocuments',
      icon: 'glyphicon glyphicon-export',
      label: TAPi18n.__('dropdowns.document_table.export_document'),
      disabledOn: 'NONE'
    },
    {
      divider: true
    },
    {
      func: 'removeSelectedDocuments',
      icon: 'glyphicon glyphicon-trash',
      label: TAPi18n.__('dropdowns.document_table.remove_document'),
      disabledOn: 'NONE'
    }
  ];

  const text = {
    selectAction: TAPi18n.__('dropdowns.template_table.select_action')
  };

  onData(null, {items, text});
};

export const depsMapper = (context, actions) => ({
  createNewDocument: actions.documents.createNewDocument,
  openDocument: actions.documents.openDocument,
  openSelectedDocument: actions.documents.openSelectedDocument,
  importDocuments: actions.documents.importDocuments,
  exportDocument: actions.documents.exportDocument,
  exportSelectedDocuments: actions.documents.exportSelectedDocuments,
  removeDocument: actions.documents.removeDocument,
  removeSelectedDocuments: actions.documents.removeSelectedDocuments,
  isDisabledOnManyAndNone: actions.documents.isDisabledOnManyAndNone,
  isDisabledOnNone: actions.documents.isDisabledOnNone,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTableDropdown);
