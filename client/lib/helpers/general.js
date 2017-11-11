//--------------------------------------------------------------------------------------------------
// General helpers
//--------------------------------------------------------------------------------------------------

import { $ } from 'jquery';
import { moment } from 'meteor/momentjs:moment';
import bootbox from 'bootbox';

export default {

  /**
   * Formats the date like "i går kl. 15.28"
   */
  formatDateRelative(date) {
    return moment && moment(date).calendar();
  },

  formatDateRegular(date) {
    return moment && moment(date).format('L');
  },

  showConfirmationPrompt(options, callbackYes, callbackNo) {
    const { title, message } = options;

    $('div.tooltip').hide();

    // A confirmation prompt before removing the document
    const confirmationPrompt = {
      title,
      message,
      buttons: {
        cancel: {
          label: 'Nei',
          callback: callbackNo,
        },
        confirm: {
          label: 'Ja',
          callback: callbackYes,
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },

  goto({ FlowRouter }, id, template = false) {
    const route = template ? 'Template' : 'Document';

    FlowRouter.go(FlowRouter.path(route, { _id: id }));
  },

  goToDocument(_, id) {
    this.goto(id);
  },

  goToTemplate(_, id) {
    this.goto(id, true);
  },
};
