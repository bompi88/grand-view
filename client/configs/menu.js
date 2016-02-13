////////////////////////////////////////////////////////////////////////////////
// Electron Menu configuration
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
/* eslint no-sync: 0 */

import {Meteor} from 'meteor/meteor';
import {$} from 'meteor/jquery';
import {Notifications} from 'meteor/gfk:notifications';

Meteor.startup(() => {
  const remote = _require('electron').remote;
  const Menu = remote.Menu;
  const resourcesRoot = _require('fs').realpathSync(process.env.DIR || process.cwd());

  const CommandOrCtrl = () => {
    return (process.platform === 'darwin') ? 'Command' : 'Ctrl';
  };

  const template = [
    {
      label: 'GrandView',
      submenu: [
        {
          label: 'Om GrandView',
          click() {
            const aboutWindow = window.open(
              'file:' + resourcesRoot + '/.about.html',
              'Om GrandView',
              'width=300, ' +
              'height=300, ' +
              'resizable=no, ' +
              'scrollbars=no, ' +
              'status=no, ' +
              'menubar=no, ' +
              'toolbar=no'
            );
            aboutWindow.focus();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Skjul GrandView',
          accelerator: CommandOrCtrl() + '+H',
          click() {
            remote.getCurrentWindow().minimize();
          }
        },
        {
          label: 'Vis GrandView',
          accelerator: CommandOrCtrl() + '+S',
          click() {
            remote.getCurrentWindow().show();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Lukk GrandView',
          accelerator: CommandOrCtrl() + '+Q',
          click() {
            remote.getCurrentWindow().close();
          }
        },
      ]
    },
    {
      label: 'Fil',
      submenu: [
        {
          label: 'Nytt dokument',
          accelerator: CommandOrCtrl() + '+D',
          click() {
            $('#template-modal').modal('show');
          }
        },
        {
          label: 'Ny mal',
          accelerator: CommandOrCtrl() + '+M',
          click() {
            GV.documentsCtrl.createNewTemplate();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Importer dokument',
          accelerator: CommandOrCtrl() + '+I',
          click() {
            GV.helpers.importDocument();
          }
        },
        {
          label: 'Eksporter dokument',
          accelerator: CommandOrCtrl() + '+E',
          click() {
            var doc = Session.get('mainDocument');
            if (doc) {
              GV.helpers.exportDocument(doc);
            } else {
              Notifications.error(
                'Eksportering mislyktes',
                'Du må ha åpnet et dokument for å kunne eksportere det.'
              );
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Importer mal',
          accelerator: CommandOrCtrl() + '+Shift+I',
          click() {
            GV.helpers.importDocument(true);
          }
        },
        {
          label: 'Eksporter mal',
          accelerator: CommandOrCtrl() + '+Shift+E',
          click() {
            var doc = Session.get('mainDocument');
            if (doc) {
              GV.helpers.exportDocument(doc, true);
            } else {
              Notifications.error(
                'Eksportering mislyktes',
                'Du må ha åpnet en mal for å kunne eksportere den.'
              );
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Generer utskriftsdokument',
          accelerator: CommandOrCtrl() + '+G',
          click() {
            var doc = Session.get('mainDocument');
            if (doc) {
              $('#create-printout').modal('show');
            } else {
              Notifications.error(
                'Generering mislyktes',
                'Du må ha åpnet et dokument for å kunne generere utskrift.'
              );
            }
          }
        }
      ]
    },
    {
      label: 'Rediger',
      submenu: [
        {
          label: 'Angre',
          accelerator: CommandOrCtrl() + '+Z',
          click() {
            remote.getCurrentWindow().webContents.undo();
          }
        },
        {
          label: 'Gjenta',
          accelerator: 'Shift+' + CommandOrCtrl() + '+Z',
          click() {
            remote.getCurrentWindow().webContents.redo();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Klipp ut',
          accelerator: CommandOrCtrl() + '+X',
          click() {
            remote.getCurrentWindow().webContents.cut();
          }
        },
        {
          label: 'Kopier',
          accelerator: CommandOrCtrl() + '+C',
          click() {
            remote.getCurrentWindow().webContents.copy();
          }
        },
        {
          label: 'Lim inn',
          accelerator: CommandOrCtrl() + '+V',
          click() {
            remote.getCurrentWindow().webContents.paste();
          }
        },
        {
          label: 'Merk Alt',
          accelerator: CommandOrCtrl() + '+A',
          click() {
            remote.getCurrentWindow().webContents.selectAll();
          }
        }
      ]
    },
    {
      label: 'Vis',
      submenu: [
        {
          label: 'Oppfrisk',
          accelerator: CommandOrCtrl() + '+R',
          click() { remote.getCurrentWindow().reload(); }
        },
        {
          label: 'Slå på/av utviklerverktøy',
          accelerator: 'Alt+' + CommandOrCtrl() + '+I',
          click() { remote.getCurrentWindow().toggleDevTools(); }
        },
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
});
