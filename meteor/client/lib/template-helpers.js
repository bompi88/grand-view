////////////////////////////////////////////////////////////////////////////////
// Template helpers
////////////////////////////////////////////////////////////////////////////////

var template_helpers = {
  'formatDateRelative': GV.helpers.formatDateRelative,
  'formatDateRegular': GV.helpers.formatDateRegular
};

// Register all helpers as UI helpers
_.each(template_helpers, function (helper, key) {
  UI.registerHelper(key, helper);
});
