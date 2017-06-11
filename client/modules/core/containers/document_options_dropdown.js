import OptionsDropdown from '../components/options_dropdown/options_dropdown';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context, isTemplate }, onData) => {
  const { TAPi18n } = context();

  let items;

  if (isTemplate) {
    items = [
      {
        icon: 'glyphicon glyphicon-plus',
        label: TAPi18n.__('dropdowns.document_options.create_chapter'),
        func: 'createNewChapter',
      },
      {
        divider: true,
      },
      {
        icon: 'glyphicon glyphicon-resize-full',
        label: TAPi18n.__('dropdowns.document_options.expand_nodes'),
        func: 'expandNodes',
      },
      {
        icon: 'glyphicon glyphicon-resize-small',
        label: TAPi18n.__('dropdowns.document_options.collapse_nodes'),
        func: 'collapseNodes',
      },
      {
        divider: true,
      },
      {
        icon: 'glyphicon glyphicon-export',
        label: TAPi18n.__('dropdowns.document_options.export_to_template_file'),
        func: 'exportToTemplateFile',
      },
    ];
  } else {
    items = [
      {
        icon: 'glyphicon glyphicon-plus',
        label: TAPi18n.__('dropdowns.document_options.create_chapter'),
        func: 'createNewChapter',
      },
      {
        divider: true,
      },
      {
        icon: 'glyphicon glyphicon-resize-full',
        label: TAPi18n.__('dropdowns.document_options.expand_nodes'),
        func: 'expandNodes',
      },
      {
        icon: 'glyphicon glyphicon-resize-small',
        label: TAPi18n.__('dropdowns.document_options.collapse_nodes'),
        func: 'collapseNodes',
      },
      {
        divider: true,
      },
      {
        icon: 'glyphicon glyphicon-print',
        label: TAPi18n.__('dropdowns.document_options.generate_docx'),
        func: 'generateDOCX',
      },
      {
        icon: 'glyphicon glyphicon-export',
        label: TAPi18n.__('dropdowns.document_options.export_to_file'),
        func: 'exportToFile',
      },
      {
        divider: true,
      },
      {
        icon: 'glyphicon glyphicon-duplicate',
        label: TAPi18n.__('dropdowns.document_options.make_template'),
        func: 'makeTemplate',
      },
    ];
  }

  onData(null, { items });
};

export const depsMapper = (context, actions) => ({
  createNewChapter: actions.optionsDropdown.createNewChapter,
  expandNodes: actions.optionsDropdown.expandNodes,
  collapseNodes: actions.optionsDropdown.collapseNodes,
  generateDOCX: actions.optionsDropdown.generateDOCX,
  exportToFile: actions.optionsDropdown.exportToFile,
  exportToTemplateFile: actions.optionsDropdown.exportToTemplateFile,
  openHelpModal: actions.optionsDropdown.openHelpModal,
  makeTemplate: actions.optionsDropdown.makeTemplate,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(OptionsDropdown);
