"use strict";

Tags.allow({
  insert: function (userId) {
    if(userId) {
      return true;
    } else {
      return false;
    }
  },

  update: function (userId) {
    if(userId) {
      return true;
    } else {
      return false;
    }
  },

  remove: function (userId) {
    if(userId) {
      return true;
    } else {
      return false;
    }
  }
});
