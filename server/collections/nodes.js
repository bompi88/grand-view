Nodes.allow({
  insert: userIsLoggedIn,
  
  update: ownsDocument,

  remove: ownsDocument
});