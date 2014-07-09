Meteor.publish('tagsById', function(ids) {
	return Tags.find({_id: { $in: ids}});
});