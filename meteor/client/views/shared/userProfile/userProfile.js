////////////////////////////////////////////////////////////////////////////////
// User profile logic
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


Session.setDefault('dropdownState', 'userButtons');


// -- Template events ----------------------------------------------------------


Template.UserProfile.events({
	'click #btn-logout' :function(event, tmpl) {
		Meteor.logout(function(){
			Router.go('Index');
		});
	},
	'click #btn-changePass': function(event, tmpl) {
		event.stopPropagation && event.stopPropagation();

		Session.set('dropdownState', 'changePassword');
		$('#oldPassword').focus();
	},
	'click .dropdown-menu' : function(event, tmpl) {
		event.stopPropagation && event.stopPropagation();
	}
});


Template.ChangePassword.events({

	'submit form.form-signup' : function(event, tmpl) {
		event.preventDefault && event.preventDefault();

	  	try {
	  		var oldPassword = tmpl.find('#oldPassword').value;
	  		var newPassword = tmpl.find('#newPassword').value;

	  		Accounts.changePassword(oldPassword, newPassword, function(error) {
	  			if(error)
	  				Notifications.error(error.message);
	  			else
	  				Notifications.info('You changed password!');
	  		});

	  		Session.set('dropdownState', 'userButtons');
	  	}
	  	catch(e) {
	  		Notifications.error(e.message);
	  	}

	},

	'click #cancel' : function(event, tmpl) {
		event.stopPropagation && event.stopPropagation();

		Session.set('dropdownState', 'userButtons');
	}

});
