////////////////////////////////////////////////////////////////////////////////
// Template helpers
////////////////////////////////////////////////////////////////////////////////

var template_helpers = {
  'formatDateRelative': GV.helpers.formatDateRelative,
  'formatDateRegular': GV.helpers.formatDateRegular,
  'activeOnRoute': function(route, rValue) {
    var returnValue = 'active';

    if(arguments.length > 2) {
      returnValue = rValue;
    }

    var curRoute = Router.current();
      if (!curRoute || !curRoute.route) return '';

    return curRoute && ((route === curRoute.route.getName()) ? returnValue : '');
  }
};

// Register all helpers as UI helpers
_.each(template_helpers, function (helper, key) {
  UI.registerHelper(key, helper);
});
