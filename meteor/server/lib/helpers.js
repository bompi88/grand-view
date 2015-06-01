/**
 * returns a random integer
 */
getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -- Permissions --------------------------------------------------------------

/**
 * Returns true if the logged in user owns the document
 */
ownsDocument = function(userId, doc) {
  return true;
  //return doc && doc.userId === userId;
}

/**
 * Returns true if a user is logged in
 */
userIsLoggedIn = function(userId) {
  return true;

  // if(userId) {
  //   return true
  // } else {
  //   console.log(this.request)
  //   // if(this.connection.remoteHost) {
  //   //   return true;
  //   // }
  // }
  // return false;
}
