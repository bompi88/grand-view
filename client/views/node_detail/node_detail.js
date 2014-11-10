Template.NodeDetail.keywords = ["test1","test2"];

Template.NodeDetail.events({
  'submit form': function (evt, tmpl) {
    evt.preventDefault();
    var title = tmpl.find('#referenceTitle').value.trim();
    var status = tmpl.find('#referenceStatus').value.trim();
    var summary = tmpl.find('#referenceSummary').value.trim();

    Documents.update({
      _id: this._id
    },
    {
      $set: {
        title: title,
        status: status,
        summary: summary,
        lastChanged: new Date(),
      }
    });
  }
});
