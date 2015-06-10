DocumentController = AuthRouteController.extend({

  subscriptions: function() {
		return [ Meteor.subscribe('documentById', this.params._id), Meteor.subscribe('nodesByDoc', this.params._id), Meteor.subscribe('tags')];
	},

  data: function() {
		return GV.collections.Documents.findOne({ _id: this.params._id });
	},

  onAfterAction: function() {
    GV.tabs.reset();
    GV.tags.reset();

    Session.set('mainDocument', this.params._id);
    Session.set('nodeInFocus', this.params._id);
    Session.set("file", null);
    Session.set("uploadStopped", false);
    Session.set("structureState", "tree");
  }

});

DocumentsController = AuthRouteController.extend({

  subscriptions: function() {
    return Meteor.subscribe('documents');
  },

  data: function() {
    return {
      documents: GV.collections.Documents.find({ template: { $ne: true }}, { sort: _.defaults(Session.get("documentSort") || {}, { lastChanged: -1 }) }),
      templates: GV.collections.Documents.find({ template: true }, { sort: _.defaults(Session.get("templateSort") || {}, { lastChanged: -1 }) })
    }
  },

  onAfterAction: function() {
    GV.dashboardCtrl.resetAll();
  }

});
