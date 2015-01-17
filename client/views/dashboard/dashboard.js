Template.Dashboard.events({
	'click #btn-newDoc': function(event, tmpl) {
		var doc = {title: 'Mitt nye dokument', lastChanged: new Date(), userId: Meteor.userId()};
		var _id = Documents.insert(doc);
		Router.go(Router.path('Document', {_id: _id}));

	},
	'click .row-item' : function(event, tmpl) {
		Router.go(Router.path('Document', {_id: this._id}));
	},
  'click #btn-editDoc': function(event, tmpl) {
    Router.go(Router.path('Document', {_id: this._id}));
  },
  'click #btn-remove': function(event, tmpl) {
    var doc = Documents.findOne({_id: this._id});
    var children = doc && doc.children || [];

    Documents.remove({_id: this._id}, function(error) {
      if(error) {
        Notifications.warn('Feil', error.message);
      }
      else {
        Meteor.call('removeNodes', children);
        Notifications.success('Dokument slettet', 'Dokument slettet');
      }
    });
  }
});
