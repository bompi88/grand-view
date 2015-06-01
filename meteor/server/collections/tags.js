"use strict";

GV.collections.Tags.allow({
  insert: userIsLoggedIn,
  update: userIsLoggedIn,
  remove: userIsLoggedIn
});
