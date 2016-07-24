import ContextMenu from '../components/context_menu/context_menu';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n, LocalState, NotificationManager} = context();

  const node = LocalState.get('SELECTED_NODE');
  const identifier = 'node';

  const menuItems = [
    {
      data: {node},
      id: 'edit-node',
      label: TAPi18n.__('context_menus.edit'),
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
      id: 'remove-node',
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

  onData(null, {menuItems, identifier});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(ContextMenu);
