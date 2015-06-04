GV.collections = {
  Documents: new Meteor.Collection('documents'),
  Nodes: new Meteor.Collection('nodes'),
  Tags: new Mongo.Collection('tags'),
  OfflineUsers: new Mongo.Collection('offlineUsers')
}

if(Meteor.isServer) {

  // only unique tags
  GV.collections.Tags._ensureIndex('value', { unique: true });

  // Initialize a local offline user
  GV.collections.OfflineUsers.update({
    _id: "offlineuser"
  },
  {
    $set: {
      profile: {
        name: "Anonym bruker"
      }
    }
  },
  {
    upsert: true
  });

}


GV.collections.Files = new FS.Collection("files", {
  stores: [new FS.Store.FileSystem("filesStore", {path: "~/GrandView/files"})]
});
