Template.Document.events({
  'click .back-to-dashboard': function () {
    Router.go('Dashboard');
  }
});

Template.Document.helpers({
	focusOnMainDoc: function() {
		return Session.get('nodeInFocus') == Session.get('mainDocument');
	}
});