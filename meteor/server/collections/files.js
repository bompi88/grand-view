GV.collections.Files.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  download: function () {
    return true;
  },
  fetch: null
});
