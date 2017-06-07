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

// import { ActionCreators } from 'redux-undo';

export default (context) => {
  const remote = _require('electron').remote;
  const os = _require('os');
  const path = _require('path');
  const platform = os.platform();
  const Menu = remote.Menu;
  const { BrowserWindow } = _require('electron').remote;

  const {
    LocalState,
    // dispatch,
    Helpers,
    NotificationManager,
    TAPi18n,
    Tracker,
    Collections
  } = context;

  const resourcesRoot = _require('fs').realpathSync(remote.app.getAppPath());

  const CommandOrCtrl = () => {
    return (platform === 'darwin') ? 'Command' : 'Ctrl';
  };

  Tracker.autorun(function () {
    const currentDocument = LocalState.get('CURRENT_DOCUMENT');
    const { isTemplate } = Collections.Documents.findOne({ _id: currentDocument }) || {};
    const lang = TAPi18n.getLanguage();

    const template = [
      {
        label: TAPi18n.__('menu.grandview'),
        submenu: [
          {
            label: TAPi18n.__('menu.about_grandview'),
            click() {
              const file = (lang === 'no-NB') ? '.about-no-NB.html' : '.about-en.html';
              const aboutWindow = window.open(
                'file:' + path.join(resourcesRoot, file),
                TAPi18n.__('menu.about_grandview'),
                'width=300, ' +
                'height=450, ' +
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
            label: TAPi18n.__('menu.change_language'),
            click() {
              LocalState.set('LANGUAGE_MODAL_VISIBLE', true);
            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.hide_grandview'),
            accelerator: CommandOrCtrl() + '+H',
            click() {
              remote.getCurrentWindow().minimize();
            }
          },
          {
            label: TAPi18n.__('menu.show_grandview'),
            accelerator: CommandOrCtrl() + '+S',
            click() {
              remote.getCurrentWindow().show();
            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.close_grandview'),
            accelerator: CommandOrCtrl() + '+Q',
            click() {
              remote.getCurrentWindow().close();
            }
          },
        ]
      },
      {
        label: TAPi18n.__('menu.file'),
        submenu: [
          {
            label: TAPi18n.__('menu.new_document'),
            accelerator: CommandOrCtrl() + '+D',
            click() {
              LocalState.set('NEW_DOCUMENT_MODAL_VISIBLE', true);
            }
          },
          {
            label: TAPi18n.__('menu.new_template'),
            accelerator: CommandOrCtrl() + '+T',
            click() {
              LocalState.set('NEW_TEMPLATE_MODAL_VISIBLE', true);

            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.import_document'),
            accelerator: CommandOrCtrl() + '+I',
            click() {
              Helpers.importDocuments(context);
            }
          },
          {
            label: TAPi18n.__('menu.export_document'),
            accelerator: CommandOrCtrl() + '+E',
            enabled: Boolean(currentDocument) && !Boolean(isTemplate),
            click() {
              const doc = LocalState.get('CURRENT_DOCUMENT');

              if (doc) {
                Helpers.exportDocument(context, doc);
              } else {
                NotificationManager.warning(
                  TAPi18n.__('notifications.export_document_failed.message'),
                  TAPi18n.__('notifications.export_document_failed.title')
                );
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.import_template'),
            accelerator: CommandOrCtrl() + '+Shift+I',
            click() {
              Helpers.importDocuments(context, true);
            }
          },
          {
            label: TAPi18n.__('menu.export_template'),
            accelerator: CommandOrCtrl() + '+Shift+E',
            enabled: Boolean(isTemplate),
            click() {
              const doc = LocalState.get('CURRENT_DOCUMENT');

              if (doc) {
                Helpers.exportDocument(context, doc, true);
              } else {
                NotificationManager.warning(
                  TAPi18n.__('notifications.export_template_failed.message'),
                  TAPi18n.__('notifications.export_template_failed.title')
                );
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.generate_print'),
            accelerator: CommandOrCtrl() + '+G',
            enabled: Boolean(currentDocument) && !Boolean(isTemplate),
            click() {
              const doc = LocalState.get('CURRENT_DOCUMENT');

              if (doc) {
                LocalState.set('EXPORT_OFFICE_MODAL_VISIBLE', true);
              } else {
                NotificationManager.warning(
                  TAPi18n.__('notifications.generation_must_open_document.message'),
                  TAPi18n.__('notifications.generation_must_open_document.title')
                );
              }
            }
          }
        ]
      },
      {
        label: TAPi18n.__('menu.edit'),
        submenu: [
          {
            label: TAPi18n.__('menu.undo'),
            accelerator: CommandOrCtrl() + '+Z',
            click() {
              // dispatch(ActionCreators.undo());
              remote.getCurrentWindow().webContents.undo();
            }
          },
          {
            label: TAPi18n.__('menu.redo'),
            accelerator: 'Shift+' + CommandOrCtrl() + '+Z',
            click() {
              // dispatch(ActionCreators.redo());
              remote.getCurrentWindow().webContents.redo();
            }
          },
          {
            type: 'separator'
          },
          {
            label: TAPi18n.__('menu.cut'),
            accelerator: CommandOrCtrl() + '+X',
            click() {
              remote.getCurrentWindow().webContents.cut();
            }
          },
          {
            label: TAPi18n.__('menu.copy'),
            accelerator: CommandOrCtrl() + '+C',
            click() {
              remote.getCurrentWindow().webContents.copy();
            }
          },
          {
            label: TAPi18n.__('menu.paste'),
            accelerator: CommandOrCtrl() + '+V',
            click() {
              LocalState.set('PASTE_FILE', false);
              remote.getCurrentWindow().webContents.paste();
            }
          },
          {
            label: TAPi18n.__('menu.paste_as_file'),
            accelerator: CommandOrCtrl() + '+Shift+V',
            click() {
              LocalState.set('PASTE_FILE', true);
              remote.getCurrentWindow().webContents.paste();
            }
          },
          {
            label: TAPi18n.__('menu.select_all'),
            accelerator: CommandOrCtrl() + '+A',
            click() {
              remote.getCurrentWindow().webContents.selectAll();
            }
          }
        ]
      },
      {
        label: TAPi18n.__('menu.show'),
        submenu: [
          {
            label: TAPi18n.__('menu.refresh'),
            accelerator: CommandOrCtrl() + '+R',
            click() { remote.getCurrentWindow().reload(); }
          },
          {
            label: TAPi18n.__('menu.developer_tools'),
            accelerator: 'Alt+' + CommandOrCtrl() + '+I',
            click() { remote.getCurrentWindow().toggleDevTools(); }
          },
        ]
      },
      {
        label: TAPi18n.__('menu.help'),
        submenu: [
          {
            label: TAPi18n.__('menu.user_manual'),
            click() {
              let win = new BrowserWindow({width: 800, height: 600});
              win.on('closed', () => {
                win = null;
              });
              win.loadURL(location.origin + '/grandview-user-manual.pdf');
              win.setMenu(null);
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

  });
};
