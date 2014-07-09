Meteor.publish('paragraphsById', function(ids) {
	return Paragraphs.find({_id: { $in: ids}});
});