/**
 * Publish methods: Documents
 */

Meteor.publish('documents', function() {
	// For now, just return all documents. Easier to be creative.
	// At a later time it should return documents to
	// a specific logged in user, if the user dont have administrator
	// rights.
	console.log("hhmamnsd")
	return Documents.find({});
});

Meteor.publish('documentById', function(id) {
	return Documents.find({_id: id});
});