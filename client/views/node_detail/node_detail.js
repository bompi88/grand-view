Template.NodeDetail.helpers({
  node: function() {
    return Nodes.findOne({_id: Session.get('nodeInFocus')});
  }
});

Template.NodeDetail.events({

  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    AutoForm.resetForm("update-node-form");
  },

  'click .delete-reference': function(event, tmpl) {
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette referansen? NB: Vil slette alle underkategorier til referansen!',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {

              deleteNode(Session.get('nodeInFocus'));
                
              // Set the main document in focus
              Session.set('nodeInFocus', Session.get('mainDocument'));

              Notifications.success('Sletting fullført', 'Referansen ble slettet fra systemet.');
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  }

});

Template.GeneralInfo.events({

'click .delete-document': function(event, tmpl) {
  var self = this;
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette <b><em>hele</em></b> dokumentet?',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {
              // Remove the document
              Documents.remove({_id: self._id}, function(error) {
                if(error) {
                  Notifications.warn('Feil', error.message);
                } else {
                  // Remove all the children nodes that rely on the document
                  Meteor.call('removeNodes', self.children);

                  // Notify the user
                  Notifications.success('Sletting fullført', 'Dokument sammen med alle referanser er nå slettet.');
                  Router.go('Dashboard');
                }
              });
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    AutoForm.resetForm("update-document-form");
  }

});