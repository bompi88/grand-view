////////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
////////////////////////////////////////////////////////////////////////////////


// -- Template event -----------------------------------------------------------


Template.Document.events({

  'click .back-to-dashboard': function () {
    Router.go('Dashboard');
  }

});


// -- Template helpers ---------------------------------------------------------


Template.Document.helpers({

	focusOnMainDoc: function() {
		return Session.get('nodeInFocus') == Session.get('mainDocument');
	}

});
