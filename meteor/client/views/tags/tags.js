Template.Tags.helpers({
  tags: function() {

    var doc = GV.collections.Documents.findOne({ _id: this._id });

    var nodes = GV.collections.Nodes.find({ _id: { $in: doc.children || [] }, nodeType: "media" }).fetch();

    var tags = [];

    nodes.forEach(function(node) {
      if(node.tags)
        tags = _.union(tags, node.tags);
    });

    tags = _.unique(tags);

    Template.instance().tags = tags;

    return tags;
  }
});


Template.Tags.events({

  'click .expand-tags': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    GV.tags.reset();
  },

  'click .collapse-tags': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    GV.tags.collapseAll(Template.instance().tags);
  },

  'click .help-modal-button': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    $("div.tooltip").hide();

    var helpBox = {
      title: "<span class='glyphicon glyphicon-question-sign'></span> Hjelp til nøkkelordvisningen",
      message: UI.toHTML(Template.TagsHelp),
      buttons: {
        close: {
          label: "Lukk",
          className: "btn-default",
        }
      }
    }

    bootbox.dialog(helpBox);
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

    openNode(elData);
  }

});
