Template.MoveStatus.events({

  'click .close-move-mode': function() {
    Session.set('isMoveMode', false);
    Session.set('showMovePopover', false);
  }

});
