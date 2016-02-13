/* globals _require */

import {$} from 'meteor/jquery';
import {moment} from 'meteor/momentjs:moment';
import {bootbox} from 'meteor/cwohlman:bootboxjs';

const os = _require('os');
const cp = _require('child_process');

const platform = os.platform();

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

    const {title, message} = options;

    $('div.tooltip').hide();

    // A confirmation prompt before removing the document
    const confirmationPrompt = {
      title,
      message,
      buttons: {
        cancel: {
          label: 'Nei',
          callback: callbackNo
        },
        confirm: {
          label: 'Ja',
          callback: callbackYes
        }
      }
    };
    bootbox.dialog(confirmationPrompt);
  },

  showEditWarning(callback) {
    // TODO: Session
    const dirty = Session.get('formDirty');

    if (dirty) {
      // TODO: React to html?
      this.showConfirmationPrompt({
        title: 'Lukking av tidligere redigering',
        message: Blaze.toHTML(Template.CloseEditViewModal)
      },
        callback
      );
    } else {
      return callback();
    }
  },

  openFile(filePath, callback) {
    let openCMD;

    if (platform === 'win32') {
      openCMD = '"' + filePath + '"';
    } else if (platform === 'darwin') {
      openCMD = 'open ' + filePath;
    } else {
      openCMD = 'xdg-open ' + filePath;
    }

    cp.exec(openCMD, callback);
  }
};
