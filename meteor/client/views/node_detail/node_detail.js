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
      message: 'Er du sikker på at du vil slette referansen?',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {
              // Remove the node
              Nodes.remove({_id: Session.get('nodeInFocus')}, function(error) {
                
                // Remove the tab
                Tabs.removeTab(Session.get('nodeInFocus'));

                // Remove the reference from the document
                Documents.update({_id: Session.get('mainDocument')}, { $pull: { children: Session.get('nodeInFocus')} } , function(error) {
                  if(error) {
                    Notifications.warn('Feil', error.message);
                  } else {

                    // Set the main document in focus
                    Session.set('nodeInFocus', Session.get('mainDocument'));
                    // Notify the user
                    Notifications.success('Suksess', 'Referanse slettet');
                  }
                });
              });
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