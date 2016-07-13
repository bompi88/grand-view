/* globals _require */

import {$} from 'meteor/jquery';
import {moment} from 'meteor/momentjs:moment';

import * as Collections from './../../lib/collections';

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
    window.bootbox.dialog(confirmationPrompt);
  },

  createNewDocument(promptTitle, docTitle, callback, template = false) {
    $('div.tooltip').hide();
    // TODO: use the helper?
    // A confirmation prompt before removing the document
    const confirmationPrompt = {
      title: promptTitle,
      buttons: {
        cancel: {
          label: 'Avbryt'
        },
        confirm: {
          label: 'Ok'
        }
      },
      callback(title) {
        if (title !== null) {
          const doc = {
            title: title || docTitle,
            lastChanged: new Date(),
            template
          };
          console.log(doc)
          // create a new document
          const id = Collections.Documents.insert(doc);

          return callback(id);
        }
      }
    };
    window.bootbox.prompt(confirmationPrompt);
  },

  goto({FlowRouter}, id, template = false) {
    const route = template ? 'Template' : 'Document';

    FlowRouter.go(FlowRouter.path(route, { _id: id }));
  },

  goToDocument({}, id) {
    this.goto(id);
  },

  goToTemplate({}, id) {
    this.goto(id, true);
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
