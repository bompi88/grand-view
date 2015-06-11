Template.Tags.helpers({
  tags: function() {
    console.log(this)
    var doc = GV.collections.Documents.findOne({ _id: this._id });

    var nodes = GV.collections.Nodes.find({ _id: { $in: doc.children || [] }, nodeType: "media" }).fetch();

    var tags = [];

    nodes.forEach(function(node) {
      if(node.tags)
        tags = _.union(tags, node.tags);
    });

    tags = _.unique(tags);

    return tags;
  }
});


Template.Tag.helpers({

  isCollapsed: function() {
    return GV.tags.isCollapsed(this.title);
  },

  getNodes: function() {
    return GV.collections.Nodes.find({ tags: this.title });
  }

});


Template.Tag.events({
  'click .hide-node': function(event, tmpl) {
    GV.tags.collapse(this.title);
  },

  'click .show-node': function(event, tmpl) {
    GV.tags.uncollapse(this.title);
  },

  // Selects a node on regular mouse click
  'click li.node span.element': function(event, tmpl) {
    // "Unselect" all selected nodes
    $('li.node span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    var elData = UI.getData(event.currentTarget);

    if(elData && elData._id) {
      GV.tabs.setDummyTab(elData._id);
      Session.set('nodeInFocus', elData._id);
      Router.current().subscribe('fileByNode', elData._id);
      Session.set("file", null);
      Session.set("uploadStopped", false);

      // Reset the form because of no update on tags field on data change.
      Meteor.defer(function() {
        AutoForm.resetForm("update-node-form");
      });
    }
  }

});
