////////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
////////////////////////////////////////////////////////////////////////////////

Meteor.startup(function () {
    _.extend(Notifications.defaultOptions, {
        timeout: GV.timeout
    });
});
