// /**
//  * Fixtures: Inserts test documents
//  */

//  Meteor.startup(function() {

//  	// If no documents, insert a test document
//  	if (Documents.find().count() === 0) {

//  		// get current time
// 		var now = new Date().getTime();
// 		var days;

// 		// -- Create a user ----------------------------------------------------

//  		var admEmail = 'asd@gmail.com';
//  		var admPasswd = 'asd';

// 		// create a admin user if not allready present
// 		if(Meteor.users.find({ 'emails.address' : admEmail }).count() === 0) {
// 			Accounts.createUser({
// 				email : admEmail,
// 				password : admPasswd,
// 				profile  : {}
// 			});
// 		}

// 		// -- Create some tags -------------------------------------------------

//  		var tags = [];

//  		for(var i = 0; i < 20; i++) {
//  			days = getRandomInt(1, 45);

//  			tags.push(
//  				SimpleTags.insert({
//  					name: Fake.word(),
//  					created: now - ((days + getRandomInt(1, 30)) * 3600 * 1000),
//  					lastModified: now - (days * 3600 * 1000)
//  				})
//  			);
//  		}

//  		// -- Create some paragraphs -------------------------------------------

//  		var paragraphs = [];
//  		var selectedTags = [];

//  		for(var i = 0; i < 20; i++) {

//  			// create a new day for each paragraph
//  			days = getRandomInt(1, 45);

// 			// empty array on each iteration
// 			selectedTags.length = 0;

// 			// attach some random tags from our tag pool
// 			for (var j = 0; j < getRandomInt(0, 10); j++) {
// 				selectedTags.push(tags[getRandomInt(0,19)]);
// 			}

// 			// Create some paragraphs
// 			paragraphs.push(
// 				Paragraphs.insert({
// 					title: Fake.sentence(5),
// 					tags: selectedTags,
// 					created: now - ((days + getRandomInt(1, 30)) * 3600 * 1000),
// 					lastModified: now - (days * 3600 * 1000)
// 				})
// 			);
// 		}

// 		// -- Create a document ------------------------------------------------

//  		Documents.insert({
//  			name: Fake.sentence(5),
//  			created: now - 7 * 3600 * 1000,
//  			lastModified: now - 4 * 3600 * 1000,
//  			nodes: [
//  			{
//  				title: "tittel",
//  				_id: paragraphs[0],
//  				children: []
//  			}
//  			]
//  		});
//  	};
//  });
