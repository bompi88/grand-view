/**
 * Publish all nodes that are being used by a document with a particular id.
 */
Meteor.publish('nodesByDoc', function(id) {
	
	if(this.userId) {
		// get the document
		var doc = Documents.find({ $and: [{ _id: id }, { userId: this.userId }] }).fetch();

		// If there is a document, return all its nodes
		return doc && doc[0] ? Nodes.find({ $and: [{_id: { $in : doc[0].children || [] }}, { userId: this.userId }]}) : this.ready();		
	}

	return this.ready();
});

/**
 * Publish a particular node by id
 */
Meteor.publish('nodeById', function(id) {

	if(this.userId)
		return Nodes.find({ $and: [{ _id: id }, { userId: this.userId }] });

	return this.ready();
});