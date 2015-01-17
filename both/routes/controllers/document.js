DocumentController = AuthRouteController.extend({
	subscriptions: function() {
		return [ Meteor.subscribe('documentById', this.params._id), Meteor.subscribe('nodesByDoc', this.params._id)];
	},
	data: function() {
		return Documents.findOne({ _id: this.params._id });
	},
  onAfterAction: function() {
    Session.set('mainDocument', this.params._id);
  }
});

DocumentsController = AuthRouteController.extend({
  subscriptions: function() {
    return Meteor.subscribe('documents');
  },
  data: function() {
    return {
      documents: Documents.find({})
    }
  }
});
