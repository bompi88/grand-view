Template.NodeDetail.helpers({
  node: function() {
    return Nodes.findOne({_id: Session.get('nodeInFocus')});
  }
});

Template.NodeDetail.events({
  'submit form': function (event, tmpl) {
    event.preventDefault && event.preventDefault();

    var title = tmpl.find('#referenceTitle').value.trim();
    var status = tmpl.find('#referenceStatus').value.trim();
    var summary = tmpl.find('#referenceSummary').value.trim();

    Nodes.update({
      _id: Session.get('nodeInFocus')
    },
    {
      $set: {
        title: title,
        status: status,
        summary: summary,
        lastChanged: new Date(),
      }
    }, function(error, sum) {
      if(error) {
        Notifications.error('Feil', 'Referansen ble ikke lagret');
      }
      else {
        Notifications.success('Suksess', 'Referansen ble oppdatert!');
      }
    });
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    var doc = Nodes.findOne({_id: Session.get('nodeInFocus') });

    $(tmpl.find('#referenceTitle')).val(doc.title);
    $(tmpl.find('#referenceStatus')).val(doc.status);
    $(tmpl.find('#referenceSummary')).val(doc.summary);
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
  'submit form': function (event, tmpl) {
    event.preventDefault && event.preventDefault();

    var title = tmpl.find('#referenceTitle').value.trim();
    var status = tmpl.find('#referenceStatus').value.trim();
    var summary = tmpl.find('#referenceSummary').value.trim();

    Documents.update({
      _id: this._id
    },
    {
      $set: {
        title: title,
        status: status,
        summary: summary,
        lastChanged: new Date(),
      }
    }, function(error, sum) {
      if(error) {
        Notifications.error('Feil', 'Dokumentet ble ikke lagret');
      }
      else {
        Notifications.success('Suksess', 'Dokumentet ble oppdatert!');
      }
    });
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    $(tmpl.find('#referenceTitle')).val(this.title);
    $(tmpl.find('#referenceStatus')).val(this.status);
    $(tmpl.find('#referenceSummary')).val(this.summary);
  }

});