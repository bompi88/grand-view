/**
 * AuthRouteController: A authorization route controller. Extend for basic
 * check of if an user is logged in or not. If no user, it redirects to the
 * index page.
 */
AuthRouteController = RouteController.extend({
    onBeforeAction: function() {
        if(!Meteor.userId()) {
            this.redirect('Index');
        }
        this.next();
    }
});
