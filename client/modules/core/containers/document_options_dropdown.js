import OptionsDropdown from '../components/options_dropdown/options_dropdown';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n, LocalState} = context();
  const showMediaNodes = LocalState.get('MEDIA_NODES_VISIBLE');

  const items = [
    {
      icon: showMediaNodes ? 'glyphicon glyphicon-eye-close' : 'glyphicon glyphicon-eye-open',
      label: showMediaNodes ? TAPi18n.__('dropdowns.document_options.hide_media_nodes') :
        TAPi18n.__('dropdowns.document_options.show_media_nodes'),
      func: 'toggleMediaNodes'
    },
    {
      divider: true
    },
    {
      icon: 'glyphicon glyphicon-plus',
      label: TAPi18n.__('dropdowns.document_options.create_chapter'),
      func: 'createNewChapter'
    },
    {
      divider: true
    },
    {
      icon: 'glyphicon glyphicon-resize-full',
      label: TAPi18n.__('dropdowns.document_options.expand_nodes'),
      func: 'expandNodes'
    },
    {
      icon: 'glyphicon glyphicon-resize-small',
      label: TAPi18n.__('dropdowns.document_options.collapse_nodes'),
      func: 'collapseNodes'
    },
    {
      divider: true
    },
    {
      icon: 'glyphicon glyphicon-print',
      label: TAPi18n.__('dropdowns.document_options.generate_docx'),
      func: 'generateDOCX'
    },
    {
      icon: 'glyphicon glyphicon-export',
      label: TAPi18n.__('dropdowns.document_options.export_to_file'),
      func: 'exportToFile'
    },
    {
      divider: true
    },
    {
      icon: 'glyphicon glyphicon-question-sign',
      label: TAPi18n.__('dropdowns.document_options.help'),
      func: 'openHelpModal'
    },
  ];

  onData(null, {items});
};

export const depsMapper = (context, actions) => ({
  toggleMediaNodes: actions.optionsDropdown.toggleMediaNodes,
  createNewChapter: actions.optionsDropdown.createNewChapter,
  expandNodes: actions.optionsDropdown.expandNodes,
  collapseNodes: actions.optionsDropdown.collapseNodes,
  generateDOCX: actions.optionsDropdown.generateDOCX,
  exportToFile: actions.optionsDropdown.exportToFile,
  openHelpModal: actions.optionsDropdown.openHelpModal,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(OptionsDropdown);