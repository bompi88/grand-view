Template.NodeDetail.keywords = ["test1","test2"];

Template.NodeDetail.events({
  'submit form': function (evt, tmpl) {
    evt.preventDefault();
    //evt.stopPropagation();
  }
});
