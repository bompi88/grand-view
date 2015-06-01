/**
 * Publish all nodes that are being used by a document with a particular id.
 */
Meteor.publish('nodesByDoc', function(id) {

  var uid = GV.helpers.userId(this.userId);

	// get the document
	var doc = GV.collections.Documents.find({ $and: [{ _id: id }, { userId: uid }] }).fetch();

	// If there is a document, return all its nodes
	return doc && doc[0] ? GV.collections.Nodes.find({ $and: [{_id: { $in : doc[0].children || [] }}, { userId: uid }]}) : this.ready();

});

/**
 * Publish a particular node by id
 */
Meteor.publish('nodeById', function(id) {

  var uid = GV.helpers.userId(this.userId);

  return GV.collections.Nodes.find({ $and: [{ _id: id }, { userId: uid }] });
});
