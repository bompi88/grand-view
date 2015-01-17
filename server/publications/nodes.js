/**
 * Publish methods: Paragraphs
 */

Meteor.publish('nodesByDoc', function(id) {

	var doc = Documents.find({_id: id}).fetch();

	if (doc) {
		nodes = Nodes.find({_id: { $in : doc[0].children || []}});
		return nodes;
	}
	return this.ready();
});

Meteor.publish('nodeById', function(id) {

	return Nodes.find({_id: id});
});