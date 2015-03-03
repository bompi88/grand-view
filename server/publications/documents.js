/**
 * Publish all documents that a user owns or has access to
 */
Meteor.publish('documents', function() {
	// return the documents that the current user owns
	if(this.userId)
		return Documents.find({ userId: this.userId });

	return this.ready();
});

/**
 * Publish a particular document by its id, if the user owns it or
 * has access to it.
 */
Meteor.publish('documentById', function(id) {

	if(this.userId)
		return Documents.find({ $and: [ { _id: id }, { userId: this.userId }] });

	return this.ready();
});