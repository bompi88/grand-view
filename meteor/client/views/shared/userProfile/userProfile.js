Session.setDefault('dropdownState', 'userButtons');

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
