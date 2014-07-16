Template.Dashboard.events({
	'click #btn-newDoc': function(event, tmpl) {
		var doc = {title: 'Mitt nye dokument', lastChanged: new Date()};
		var _id = Documents.insert(doc);
		Router.go(Router.path('Document', {_id: _id}));

	},
	'click .row-item' : function(event, tmpl) {
		Router.go(Router.path('Document', {_id: this._id}));
	}
});
