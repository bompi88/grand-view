////////////////////////////////////////////////////////////////////////////////
// Autoform hooks for the Nodes collection
////////////////////////////////////////////////////////////////////////////////


AutoForm.hooks({

  // Autoform hooks for update node form
  "update-node-form": {

    formToDoc: function(doc) {
      doc.lastChanged = new Date();
      doc.userId = GV.helpers.userId(Meteor.userId());

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Elementet ble ikke lagret');
      console.log(error);
    },

    onSuccess: function(result) {
      // set new lastChanged date on the root document
      var allDocs = GV.collections.Documents.find({ children: this.docId }).fetch();

      allDocs.forEach(function(doc) {
        GV.collections.Documents.update({
          _id: doc._id
        },
        {
          $set: {
            lastChanged: new Date()
          }
        });
      });
      Session.set("inlineEditNode", null);
      Notifications.success('Suksess', 'Elementet ble oppdatert!');
    }

  }

});
