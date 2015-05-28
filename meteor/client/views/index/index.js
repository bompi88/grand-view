Template.Index.events({

  'click .new-account': function(event, tmpl) {
    Session.set('formState', 'sign-up');
  }

});