////////////////////////////////////////////////////////////////////////////////
// Dashboard logic
////////////////////////////////////////////////////////////////////////////////


// -- Template events ----------------------------------------------------------


Template.Dashboard.events({

	'click #btn-newDoc': function(event, tmpl) {
		var doc = {
      title: 'Mitt nye dokument',
      lastChanged: new Date(),
      userId: GV.helpers.userId(Meteor.userId())
    };

    // create a new document
    var _id = GV.collections.Documents.insert(doc);

    GV.tabs.reset();
    // redirect to the new document
		Router.go(Router.path('Document', {_id: _id}));
	},

	'click .row-item' : function(event, tmpl) {
    GV.tabs.reset();
		Router.go(Router.path('Document', {_id: this._id}));
	},

  'click #btn-editDoc': function(event, tmpl) {
    GV.tabs.reset();
    Router.go(Router.path('Document', {_id: this._id}));
  },

  'click #btn-remove': function(event, tmpl) {
    var doc = GV.collections.Documents.findOne({_id: this._id});
    var children = doc && doc.children || [];

    var docId = this._id;

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette dokumentet?',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {
              // Remove the document
              GV.collections.Documents.remove({_id: docId}, function(error) {
                if(error) {
                  Notifications.warn('Feil', error.message);
                } else {
                  // Remove all the children nodes that rely on the document
                  Meteor.call('removeNodes', children);

                  // Notify the user
                  Notifications.success('Dokument slettet', 'Dokument slettet');
                }
              });
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  }

});
