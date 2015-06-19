showConfirmationPrompt = function(options, callbackYes, callbackNo) {
  $("div.tooltip").hide();

  // A confirmation prompt before removing the document
  var confirmationPrompt = {
    title: options.title,
    message: options.message,
    buttons: {
      cancel: {
        label: "Nei",
        callback: callbackNo
      },
      confirm: {
        label: "Ja",
        callback: callbackYes
      }
    }
  }
  bootbox.dialog(confirmationPrompt);
};
