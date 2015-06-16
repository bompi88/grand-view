Meteor.publish('fileById', function(id) {
    // return the documents that the current user owns
    return GV.collections.Files.find({ _id: id });
});

Meteor.publish('fileByNode', function(id) {

    var nodes = GV.collections.Nodes.find({ parent: id}).fetch();
    var ids = _.pluck(nodes, "_id") || [];

    ids.push(id);

    // return the documents that the current user owns
    return GV.collections.Files.find({ nodeId: { $in: ids }});
});

Meteor.publish('filesByDocument', function(id) {
    // return the documents that the current user owns
    return GV.collections.Files.find({ docId: id });
});
