
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