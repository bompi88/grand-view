import ContextMenu from '../components/context_menu/context_menu';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, actions}, onData) => {
  const {TAPi18n, LocalState} = context();
  const a = actions();

  const node = LocalState.get('CURRENT_DOCUMENT');
  const identifier = 'root';

  const menuItems = [
    {
      data: {node},
      id: 'add-chapter',
      label: TAPi18n.__('context_menus.add_chapter'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: a.contextMenus.addChapter
    },
    {
      data: {node},
      id: 'remove-root',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: a.contextMenus.removeRootNode
    }
  ];

  onData(null, {menuItems, identifier});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(ContextMenu);
