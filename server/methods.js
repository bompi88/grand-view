Meteor.methods({

	/**
	 * Verifies a google captcha solved by a user
	 * @data: parameter that contains the challengeid and the proposed captcha solution
	 * returns a json object with a boolean success variable and an error message
	 */
	verifyCaptcha: function(data) {

		var captchaData = {
			privatekey: '6LfUzPYSAAAAANuThaRsxvkV1TYhRMqxmBDoJNK4',
			remoteip: this.connection.clientAddress,
			challenge: data.captcha_challenge_id,
			response: data.captcha_solution
		};

		var serializedCaptchaData =
		'privatekey=' + captchaData.privatekey +
		'&remoteip=' + captchaData.remoteip +
		'&challenge=' + captchaData.challenge +
		'&response=' + captchaData.response;

		var captchaVerificationResult = null;
		
		// used to process response string
		var success, parts;

		//send a http post request to the recaptcha server, the answer contains the validation result
		try {
			captchaVerificationResult = HTTP.call("POST", "http://www.google.com/recaptcha/api/verify", {
				content: serializedCaptchaData.toString('utf8'),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': serializedCaptchaData.length
				}
			});
		} 
		catch(e) {
			console.log('google_service_not_accessible:' + e);
			return {
				'success': false,
				'error': 'google_service_not_accessible'
			};
		}
		//the success variable is on line zero
		parts = captchaVerificationResult.content.split('\n');
		success = parts[0];

		if (success !== 'true') {
			console.log('Captcha check failed! Responding with: ', captchaVerificationResult);
			return {
				'success': false,
				'error': 'captcha_verification_failed'
			};
		}

		return {
			'success': true
		};
	},

	/**
	 * Called from the client side to create user with automatic verification email sending
	 * @user: object with password and email variables
	 * @callback: (optional) callback on complete
	 * returns true after invokation
	 */
	registerUser: function(user, callback) {

		var userId = Accounts.createUser(user);

	    Accounts.sendVerificationEmail(userId, user.email);

	    if (typeof callback !== 'undefined') {
	    	callback();
	    }
	    return true;
	},

	/**
	 * Called from the client side to remove all nodes in the array ids
	 * @ids: Array of nodes ids
	 * @callback: (optional) callback on complete
	 * returns true after invokation
	 */
	removeNodes: function(ids, callback) {
		Nodes.remove({_id: { $in: ids || []}});

		if (typeof callback !== 'undefined') {
	    	callback();
	    }
	    return true;
	}

});



// This is global login validator that runs every time someone tries to login.
// In our case, we have implemented a filter that only allows users with verified email adresses to login.
Accounts.validateLoginAttempt(function(info) {
	if(info && info.user && info.user.emails){
		var emails = info.user.emails;
		for(var i = 0; i < emails.length; i++) {
			if(!emails[i].verified)
				return false;
		}
		return true;
	}
})


//override accounts.urls to play better with iron-router
Accounts.urls.verifyEmail = function (token) {
  return Meteor.absoluteUrl('verify-email/' + token);
};

//override accounts.urls to play better with iron-router
Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl('reset-password/' + token);
};

