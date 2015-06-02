////////////////////////////////////////////////////////////////////////////////
// Autoform hooks for the Documents collection
////////////////////////////////////////////////////////////////////////////////


AutoForm.hooks({

  // Autoform hooks for the register new user form
  "update-document-form": {

    formToDoc: function(doc) {
      doc.lastChanged = new Date();
      doc.userId = GV.helpers.userId(Meteor.userId());

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Dokumentet ble ikke lagret');
      console.log(error);
    },

    onSuccess: function() {
      Notifications.success('Suksess', 'Dokumentet ble oppdatert!');
    }

  }

});
