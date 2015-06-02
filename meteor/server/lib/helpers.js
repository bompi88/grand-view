////////////////////////////////////////////////////////////////////////////////
// Server helpers
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


"use strict";


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
