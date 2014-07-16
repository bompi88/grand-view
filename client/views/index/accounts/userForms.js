/**
 * userForms.js
 */


//keep track of state: login, sign-up and forgotton-password
Session.setDefault('formState', 'login');


// -- Rendered --------------------------------------------------------

Template.SignUp.rendered = function() {
	//insert google captcha into the template
	jQuery.getScript('http://www.google.com/recaptcha/api/js/recaptcha_ajax.js', function() {
		Recaptcha.create('6LfUzPYSAAAAAAEiGvFJswtWAAVJo4Om_rXaSEjD', 'rendered-captcha-container', {
			theme: 'white',
			callback: Recaptcha.focus_response_field
		});
	});
};

// -- Destroyed --------------------------------------------------------

Template.SignUp.destroyed = function() {
	Recaptcha.destroy();
};

// -- Helpers --------------------------------------------------------

Template.UserForms.formTitle = function() {
  var state = Session.get('formState');
  if(state === 'login')
    return 'Vennligst logg inn';
  else if(state === 'sign-up')
    return 'Vennligst registrer en bruker';
  else if(state === 'forgotton-password')
    return 'Du får en epost med bekreftelseslink for å tilbakestille passordet.';
}

// -- Events --------------------------------------------------------

Template.UserForms.events({
  'click #forgot-password': function(event,tmpl){
    Session.set('formState', 'forgotton-password');
  },

  'click .new-account': function(event, tmpl) {
    Session.set('formState', 'sign-up');
  },

  'click #cancel': function(event, tmpl){
    Session.set('formState', 'login');
  },

  // Submit event on forgotton password
  'submit form.form-password-lookup': function(event, tmpl) {
    event.preventDefault();

    try {
      var submitButton = tmpl.find('#submit');
      var email = tmpl.find('#email').value;

      // A basic call for a password reset
      Accounts.forgotPassword({email: email}, function(error){
        // create error notification on error
        if (error) {
          Notifications.error('Error', error.message);

        // or change state to logon page
        } else {
          Session.set('formState', 'login');
          Notifications.success('Info', 'Please click on the email verification link to reset password and the log in again.');
        }
      });
    } catch(error) {
        Notifications.error('Error', error.message);

    }
  },
  //submit event on signup
  'submit form.form-signup': function(event, tmpl) {
  	event.preventDefault();
  	try {
  		var email = tmpl.find('#email').value;
  		var password = tmpl.find('#password').value.toString();
  		var user = {email: email, password: password};
  		//get all the captcha data
  		var captchaData = {
            captcha_challenge_id: Recaptcha.get_challenge(),
            captcha_solution: Recaptcha.get_response()
        };

        //invoke a server side method to verify the google captcha
  		Meteor.call('verifyCaptcha', captchaData, function(error, result) {

  			//on success, invoke registerUser on the server to create the user and send confirmation email
  			if (result.success) {
  				Meteor.call('registerUser', user, function(error, result) {
  					if(result) {
  						Notifications.success('Info', 'You created a new user. Please verify your email before logging in by checking your mail inbox and click on the email verification link.');
  						Session.set('formState', 'login');

  					}
  					else {
  						Notifications.error('Error', error.message);

  					}
  				});
            }
            else {
            	//the user has to try the captcha again
            	Recaptcha.reload();
	            // alert error message according to received code
	            switch (result.error) {
	            	case 'captcha_verification_failed':
	            	Notifications.error('Captcha solution is wrong!');
	            	break;
	            	case 'google_service_not_accessible':
	            	Notifications.warn('Google Service not accessible');
	            	break;
	            	default:
	            	Notifications.warn('error');
	            }
        	}
    	});

  	}
  	catch(error) {
  		Notifications.error('Error', error.message);

  	}

  },

  // Submit event on login
  'submit form.form-signin': function(event,tmpl) {
    event.preventDefault();

    try {
      var email = tmpl.find('#email').value;
      var password = tmpl.find('#password').value;

      // log into app with email and password
      Meteor.loginWithPassword(email, password, function(error){

        if(error) {
          Notifications.error('Error', error.message);
        }
        else {
          Router.go('Dashboard');
        }
      });

    // Catch and display error
    }
    catch(error) {
      Notifications.error('Error', error.message);
    }
  }
});

