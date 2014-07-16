/**
 * Publish methods: Paragraphs
 */

Meteor.publish('paragraphsByDoc', function(docId) {

	// var doc = Documents.findOne({_id: docId});

	// return Paragraphs.find({_id: { $in: doc.paragraphs }});
	return this.ready();
});