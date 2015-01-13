Template.registerHelper('formatDate', function(date) {
  return moment(date).calendar();
  //format("dddd, MMMM Do YYYY, h:mm:ss a");
});
