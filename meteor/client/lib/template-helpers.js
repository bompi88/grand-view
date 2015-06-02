var template_helpers = {
  'formatDate': GV.helpers.formatDate
};

// Register all helpers as UI helpers
_.each(template_helpers, function (helper, key) {
  UI.registerHelper(key, helper);
});