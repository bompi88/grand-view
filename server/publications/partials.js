Meteor.publish('partialsById', function(ids) {
	return Partials.find({_id: { $in: ids}});
});