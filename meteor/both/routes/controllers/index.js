IndexController = RouteController.extend({

  subscriptions: function() {
    return [ Meteor.subscribe('templates')];
  }

});
