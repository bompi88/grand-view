Tags = new Mongo.Collection('tags');

// only unique tags
if(Meteor.isServer) {
	Tags._ensureIndex('value', { unique: true });
}