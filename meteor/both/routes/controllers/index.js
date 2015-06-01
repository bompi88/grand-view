IndexController = RouteController.extend({
    onBeforeAction: _.partial(GV.helpers.redirectIfLoggedIn, 'Dashboard', 'Index')
});
