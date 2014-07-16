DocumentController = RouteController.extend({
	waitOn: function() {
		return [ Meteor.subscribe('documentById', this.params._id), Meteor.subscribe('paragraphsByDoc', this.params._id)];
	},
	data: function() {
		return Documents.findOne({ _id: this.params._id });
	}
});
