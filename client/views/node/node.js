/**
 * NodeLevel: Helpers
 */

Template.NodeLevel.helpers({
  hasChildren: function() {
    return Nodes.find({parent: this._id}).count() > 0;
  },

  children: function() {
    return Nodes.find({parent: this._id});
  }
});

Template.NodeLevel.events({
  'click .add-node-level': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    Nodes.insert({ parent: this._id, title: "Ingen tittel", level: this.level + 1, userId: this.userId }, function(error, nodeId) {
      console.log(nodeId)
      if(!error) {
        Documents.update({_id: Session.get('mainDocument')}, { $addToSet: {children: nodeId} });
        Meteor.subscribe('nodeById', nodeId);
      }
    });
  }
});