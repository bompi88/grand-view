Meteor.publish('tagsByQuery', function(query, sort) {
	return GV.collections.Tags.find(query);
});
