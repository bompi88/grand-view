GV.helpers = _.extend(GV.helpers, {
  formatDate: function(date) {
    return moment && moment(date).calendar();
  }
});
