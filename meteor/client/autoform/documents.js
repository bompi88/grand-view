AutoForm.hooks({

  // Autoform hooks for the register new user form
  "update-node-form": {
    formToDoc: function(doc) {
      doc.lastChanged = new Date();
      doc.userId = GV.helpers.userId(Meteor.userId());

      return doc;
    },
    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Referansen ble ikke lagret');
      console.log(error);
    },
    onSuccess: function(result) {
      // set new lastChanged date on the root document
      var allDocs = GV.collections.Documents.find({children: this.docId}).fetch();
      allDocs.forEach(function(doc) {
        GV.collections.Documents.update({_id: doc._id}, {$set: {lastChanged: new Date()}});
      });

      console.log(result);
      Notifications.success('Suksess', 'Referansen ble oppdatert!');
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
