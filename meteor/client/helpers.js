Template.registerHelper('formatDate', function(date) {
  return moment && moment(date).calendar();
});
