////////////////////////////////////////////////////////////////////////////////
// General helpers
////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////////////////////

/* globals _require */

import {$} from 'meteor/jquery';
import {moment} from 'meteor/momentjs:moment';

import * as Collections from '/lib/collections';

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
