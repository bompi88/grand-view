import ContextMenu from '../components/context_menu/context_menu';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n, LocalState, NotificationManager} = context();

  const node = LocalState.get('SELECTED_NODE');
  const identifier = 'root';

  const menuItems = [
    {
      data: {node},
      id: 'add-chapter',
      label: TAPi18n.__('context_menus.add_chapter'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: (e, data) => {
        const {node} = data;
        // var elData = Blaze.getData(t);
        //
        // GV.nodeCtrl.insertNodeOfType(elData, 'chapter', t);
      }
    },
    {
      data: {node},
      id: 'remove-root',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: () => {
        NotificationManager.warning(
          TAPi18n.__('notifications.context_menu_root.message'),
          TAPi18n.__('notifications.context_menu_root.title')
        );
      }
    }
  ];

  onData(null, {menuItems, identifier});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(ContextMenu);
