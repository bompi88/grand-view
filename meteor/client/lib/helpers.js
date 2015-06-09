////////////////////////////////////////////////////////////////////////////////
// Client helpers
////////////////////////////////////////////////////////////////////////////////

GV.helpers = _.extend(GV.helpers, {

  /**
   * Formats the date like "i går kl. 15.28"
   */
  formatDateRelative: function(date) {
    return moment && moment(date).calendar();
  },

  formatDateRegular: function(date) {
    return moment && moment(date).format('L');
  }

});
