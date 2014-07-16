/**
 * Server helper methods
 */

getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -- Permissions --------------------------------------------------------------

ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
}

userIsLoggedIn = function(userId) {
	if(userId) {
      return true;
    } else {
      return false;
    }
}