GV.collections.Documents.allow({
  insert: userIsLoggedIn,

  update: ownsDocument,

  remove: ownsDocument
});
