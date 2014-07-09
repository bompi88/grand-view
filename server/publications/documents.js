Meteor.publish('documents', function() {
	// For now, just return all documents. Easier to be creative.
	// At a later time it should return documents to
	// a specific logged in user, if the user dont have administrator
	// rights.
	return Documents.find({});
});