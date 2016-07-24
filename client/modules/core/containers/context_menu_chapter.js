import ContextMenu from '../components/context_menu/context_menu';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n, LocalState, NotificationManager} = context();

  const node = LocalState.get('SELECTED_NODE');
  const showNodes = LocalState.get('SHOW_NODES');
  const identifier = 'chapter';

  const menuItems = [
    {
      data: {node},
      id: 'add-subchapter',
      label: TAPi18n.__('context_menus.add_subchapter'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: (e, data) => {
        const {node} = data;
        // var elData = Blaze.getData(t);
        //
        // GV.nodeCtrl.insertNodeOfType(elData, "chapter", t.parentNode);
      }
    },
    {
      data: {node},
      id: 'rename-chapter',
      label: TAPi18n.__('context_menus.rename'),
      icon: 'glyphicon glyphicon-pencil',
      handleClick: (e, data) => {
        const {node} = data;
        // var elData = Blaze.getData(t);
        //
        // if (elData && elData._id) {
        //   GV.nodeCtrl.renameNode(elData._id);
        // }
      }
    },
    {
      data: {node},
      id: 'remove-chapter',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: (e, data) => {
        const {node} = data;
        // var elData = Blaze.getData(t);
        //
        // $("div.tooltip").hide();
        //
        // if (elData && elData._id) {
        //   var confirmationPrompt = {
        //     title: "Bekreftelse på slettingen",
        //     message:  'Er du sikker på at du vil slette kapittelelementet? NB: ' +
        //               'Vil slette alle underkapitler of informasjonselementer ' +
        //               'til dette kapittelet!',
        //     buttons: {
        //       cancel: {
        //         label: "Nei"
        //       },
        //       confirm: {
        //         label: "Ja",
        //         callback: function(result) {
        //           if (result) {
        //
        //             GV.nodeCtrl.deleteNode(elData, t.parentNode.parentNode.parentNode.parentNode);
        //
        //             // Set the main document in focus
        //             Session.set('nodeInFocus', Session.get('mainDocument'));
        //
        //             Notifications.success(
        //               'Sletting fullført',
        //               'Kapittelelementet ble slettet fra systemet.'
        //             );
        //           }
        //         }
        //       }
        //     }
        //   };
        //   bootbox.dialog(confirmationPrompt);
        // }
      }
    }
  ];

  if (showNodes) {
    menuItems.splice(1, 0, {
      data: {node},
      id: 'add-node',
      label: TAPi18n.__('context_menus.add_node'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: (e, data) => {
        const {node} = data;
        // var elData = Blaze.getData(t);
        //
        // GV.nodeCtrl.insertNodeOfType(elData, "media", t.parentNode);
      }
    });
  }

  onData(null, {menuItems, identifier});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(ContextMenu);
