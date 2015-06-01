GV.helpers = _.extend(GV.helpers, {
  parseURL: function(url) {
    var partials;

    if(url)
      partials = url.split('/')[2].split(':');

    return {
      ip: partials && partials[0] || null,
      port: partials && partials[1] || null
    };
  },

  /**
   * Returns Meteor user id if present, else the offline users id
   */
  userId: function(id) {
    var offlineUser = GV.collections.OfflineUsers.find({}).fetch()[0];
    var offlineUserId = offlineUser && offlineUser._id;

    return id || _.defaults({ _id: offlineUserId }, { _id: "offlineuser" })._id;
  },

  // TODO: fix this

  /**
   * Renders a page if logged in, else rendering another page
   * @param {String} page - the page to render if logged in
   * @param {String} elsePage - the page to render if not logged in
   */
  redirectIfLoggedIn: function(page, elsePage) {

    var parsedURL = GV.helpers.parseURL(Router.current().router.url(page));
    var constructedURL = "http://" + parsedURL.ip + ":" + parsedURL.port + "/";

    if(constructedURL === "http://localhost:3000/") {
      console.log("Local mode...");
      this.render(page);
    } else {
      console.log("Remote mode...");
      if(Meteor.user()) {
        this.render(page);
      } else {
        this.render(elsePage);
      }
    }
  },

  /**
   * Redirects to a page if not logged in
   * @param {String} page - the page to redirect to
   */
  redirectIfNotLoggedIn: function(page) {
    var parsedURL = GV.helpers.parseURL(Router.current().router.url(page));
    var constructedURL = "http://" + parsedURL.ip + ":" + parsedURL.port + "/";

    if(constructedURL === "http://localhost:3000/") {
      this.render();
    } else {
      if(!Meteor.user()) {
        this.render(page);
      } else {
        this.render();
      }
    }
  }

});
