if (Meteor.isClient) {
  Template.MoveStatus.events({

    'click .close-move-mode': function() {
      Session.set('isMoveMode', false);
      Session.set('showMovePopover', false);
    }

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log('Meteor app started.');
  });
}
