Meteor.publish('fileById', function(id) {
    // return the documents that the current user owns
    return GV.collections.Files.find({ _id: id });
});

Meteor.publish('fileByNode', function(id) {
    // return the documents that the current user owns
    return GV.collections.Files.find({ nodeId: id });
});
