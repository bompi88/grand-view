/**
 * Publish all documents that a user owns or has access to
 */
Meteor.publish('documents', function() {

  var uid = GV.helpers.userId(this.userId);

	// return the documents that the current user owns
	return GV.collections.Documents.find({ userId: uid });

	return this.ready();
});

/**
 * Publish a particular document by its id, if the user owns it or
 * has access to it.
 */
Meteor.publish('documentById', function(id) {

  var uid = GV.helpers.userId(this.userId);
	return GV.collections.Documents.find({ $and: [ { _id: id }, { userId: uid }] });

	return this.ready();
});
