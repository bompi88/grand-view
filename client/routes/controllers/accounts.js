AccountsController = RouteController.extend({
  template: 'Index',
  resetThePassword: function () {
    var token = this.params.token;
    var passwordPrompt = {
      title: "Nytt passord",
      message: '<form role="form"><input name="password" id="passwordID" class="form-control" type="password" placeholder="Passord" required></form>',
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
  },
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
  }
});
