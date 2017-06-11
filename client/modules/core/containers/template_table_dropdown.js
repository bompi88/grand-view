import DocumentTableDropdown from '../components/table_dropdown/table_dropdown';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { TAPi18n } = context();

  const items = [
    {
      func: 'createNewTemplate',
      icon: 'glyphicon glyphicon-plus',
      label: TAPi18n.__('dropdowns.template_table.create_template'),
    },
    {
      func: 'openSelectedTemplate',
      icon: 'glyphicon glyphicon-edit',
      label: TAPi18n.__('dropdowns.template_table.edit_template'),
      disabledOn: 'MANY_AND_NONE',
    },
    {
      divider: true,
    },
    {
      func: 'importTemplates',
      icon: 'glyphicon glyphicon-import',
      label: TAPi18n.__('dropdowns.template_table.import_template'),
    },
    {
      func: 'exportSelectedTemplates',
      icon: 'glyphicon glyphicon-export',
      label: TAPi18n.__('dropdowns.template_table.export_template'),
      disabledOn: 'NONE',
    },
    {
      divider: true,
    },
    {
      func: 'removeSelectedTemplates',
      icon: 'glyphicon glyphicon-trash',
      label: TAPi18n.__('dropdowns.template_table.remove_template'),
      disabledOn: 'NONE',
    },
  ];

  const text = {
    selectAction: TAPi18n.__('dropdowns.template_table.select_action'),
  };

  onData(null, { items, text });
};

export const depsMapper = (context, actions) => ({
  createNewTemplate: actions.templates.createNewTemplate,
  openTemplate: actions.templates.openTemplate,
  openSelectedTemplate: actions.templates.openSelectedTemplate,
  importTemplates: actions.templates.importTemplates,
  exportTemplate: actions.templates.exportTemplate,
  exportSelectedTemplates: actions.templates.exportSelectedTemplates,
  removeTemplate: actions.templates.removeTemplate,
  removeSelectedTemplates: actions.templates.removeSelectedTemplates,
  isDisabledOnManyAndNone: actions.templates.isDisabledOnManyAndNone,
  isDisabledOnNone: actions.templates.isDisabledOnNone,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(DocumentTableDropdown);
