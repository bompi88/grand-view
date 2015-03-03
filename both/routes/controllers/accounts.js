AccountsController = RouteController.extend({
  
  /**
   * Creates a modal for resetting the password, and redirects based on the result
   */
  resetThePassword: function () {
    var token = this.params.token;
    var passwordPrompt = {
      title: "Nytt passord",
      message: '<input name="password" id="passwordID" class="form-control" type="password" placeholder="Passord" required>',
      buttons: {
        confirm: {
          label: "Bekreft",
          callback: function() {
            var password = $("#passwordID").val();
            Accounts.resetPassword(token, password, function (error) {
              if(error) {
                Notifications.error(error.message);
                Router.go('Index');
              }
              else {
                Notifications.success('Password reset complete! You are logged in!');
                Router.go('Dashboard');
              }
            });
          }
        }
      }
    };
    bootbox.dialog(passwordPrompt);
    this.render("Index");
  },

  /**
   * Verifies an email and redirects based on the results
   */
  verifyEmail: function () {
    Accounts.verifyEmail(this.params.token, function (error) {
      if(error) {
        Notifications.warn(error.message);
        Router.go('Index');
      }
      else {
        Notifications.success('Email verified! You are logged in!');
        Router.go('Dashboard');
      }
    });
    this.render("Index");
  }

});
