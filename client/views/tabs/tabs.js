Template.Tabs.helpers({
    tabs: function() {
        return Tabs.getTabs();
    },
    isMainDocument: function() {
    	return Session.get('nodeInFocus') == Session.get('mainDocument');
    }
});

Template.Tabs.events({

	'click .tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', this.toString());
	},

	'click .general-info': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', Session.get('mainDocument'));
	},

	'click .delete-tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();
		event.stopPropagation && event.stopPropagation();

		Tabs.removeTab(this);
	}

});