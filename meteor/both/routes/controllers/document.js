WorkAreaController = AuthRouteController.extend({

  onAfterAction: function() {
    var docId = Session.get('mainDocument');

    if(docId) {
      Router.go('Document', { _id: docId });
    }
  }
});

DocumentController = AuthRouteController.extend({

  subscriptions: function() {
		return [ Meteor.subscribe('documentById', this.params._id), Meteor.subscribe('nodesByDoc', this.params._id), Meteor.subscribe('tags'), Meteor.subscribe('references')];
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
    Session.set("showMediaNodes", false);

    Meteor.defer(function() {
      $('li.node span').removeClass('selected');
      $("li.root > span").addClass('selected');
    });

  }

});

TemplateController = AuthRouteController.extend({

  subscriptions: function() {
    return [ Meteor.subscribe('documentById', this.params._id), Meteor.subscribe('nodesByDoc', this.params._id), Meteor.subscribe('tags'), Meteor.subscribe('references')];
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
      documents: GV.collections.Documents.find({ template: { $ne: true }}, { sort: _.defaults(Session.get("documentSort") || {}, { lastChanged: -1 }) })
    }
  },

  onAfterAction: function() {
    GV.selectedCtrl.resetAll();
  }

});

TemplatesController = AuthRouteController.extend({

  subscriptions: function() {
    return Meteor.subscribe('documents');
  },

  data: function() {
    return {
      templates: GV.collections.Documents.find({ template: true }, { sort: _.defaults(Session.get("templateSort") || {}, { lastChanged: -1 }) })
    }
  },

  onAfterAction: function() {
    GV.selectedCtrl.resetAll();
  }

});

TrashController = AuthRouteController.extend({

  subscriptions: function() {
    return Meteor.subscribe('documents');
  },

  data: function() {
    return {
      trash: GV.collections.Documents.find({ removed: true }, { sort: _.defaults(Session.get("templateSort") || {}, { removedAt: -1 }) })
    }
  },

  onAfterAction: function() {
    GV.selectedCtrl.resetAll();
  }

});
