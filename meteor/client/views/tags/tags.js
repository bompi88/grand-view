Template.Tags.helpers({
  tags: function() {
    console.log(this)
    var doc = GV.collections.Documents.findOne({ _id: this._id });

    var nodes = GV.collections.Nodes.find({ _id: { $in: doc.children || [] } }).fetch();

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
    // return GV.tags.
  },

  getNodes: function() {
    return GV.collections.Nodes.find({ tags: this.title });
  }

});
