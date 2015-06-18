////////////////////////////////////////////////////////////////////////////////
// Basic event handlers for the dropzone
////////////////////////////////////////////////////////////////////////////////

Meteor.startup(function () {

  // Prevent drop outside of the droppable area
  window.addEventListener("dragover",function(e){
    e = e || event;
    e.preventDefault();
  },false);

  window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
  },false);

  // prevent deafult drop behaviour of dropsone
  $("html")
  .on("dragenter", ".dropzone", function(event) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    return true;
  }).on("dragover", ".dropzone", function(event) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    return true;
  }).on("drop", ".dropzone", function(event) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    return true;
  });

});
