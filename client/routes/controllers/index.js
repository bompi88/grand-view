IndexController = RouteController.extend({
    waitOn: function () {
        return Meteor.user();
    },
    onBeforeAction: function(pause) {
    // Redirects user if allready logged in
        if (Meteor.user()) {
            if (!Meteor.loggingIn()) {
                this.redirect(Router.path('Dashboard'));
            }
        }
    },
    action: function () {
    // if user is not logged in, render the login template
        if (!Meteor.user() && !Meteor.loggingIn()) {
            this.render();
        }
    }
});
