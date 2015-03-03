IndexController = RouteController.extend({
    onBeforeAction: function() {
    // Redirects user if allready logged in
        if (Meteor.userId()) {
          this.redirect('Dashboard');
        }
        this.next();
    }
});
