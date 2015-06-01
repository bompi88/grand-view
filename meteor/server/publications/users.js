// publish all offline users
Meteor.publish(null, function() {
  return GV.collections.OfflineUsers.find();
});
