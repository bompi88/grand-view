Meteor.publish('tagsByQuery', function(query, sort) {
	return Tags.find(query);
});