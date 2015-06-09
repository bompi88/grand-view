////////////////////////////////////////////////////////////////////////////////
// Autoform hooks for the Documents collection
////////////////////////////////////////////////////////////////////////////////


AutoForm.hooks({
  "insert-doc": {

    formToDoc: function(doc) {
      doc.lastChanged = new Date();
      doc.userId = GV.helpers.userId(Meteor.userId());
      doc.title = doc.title ? doc.title : "Mitt nye dokument";

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Dokumentet ble ikke lagret');
      console.log(error);
    },

    onSuccess: function(formType, result) {

      $('#template-modal').modal('hide');

      // reset the tabs
      GV.tabs.reset();

      // redirect to the new document
      Router.go(Router.path('Document', { _id: result }));

      Notifications.success('Suksess', 'Dokumentet ble opprettet og du kan redigere det umiddelbart!');
    }

  },

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
