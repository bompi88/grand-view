"use strict";

Meteor.startup(function() {
  var remote = require('remote');
  var Menu = remote.require('menu');
  // var BrowserWindow = require('browser-window');
  // var aboutWin = new BrowserWindow({ width: 300, height: 200, frame: false });
  var resources_root = require('fs').realpathSync( process.env.DIR || process.cwd() + '/../' );

  var isWindows = function() {
    return process.platform === 'win32';
  };

  var CommandOrCtrl = function() {
    return (process.platform === 'darwin') ? 'Command' : 'Ctrl';
  };

  var template = [
    {
      label: 'GrandView',
      submenu: [
        {
          label: 'Om GrandView',
          click: function() {
            var aboutWindow = window.open(
              'file:' + resources_root + '/about.html',
              'Om GrandView',
              'width=300,height=280,resizable=0,scrollbars=0,status=0,Om GrandView'
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
          selector: 'hide:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Lukk GrandView',
          accelerator: CommandOrCtrl() + '+Q',
          selector: 'terminate:'
        },
      ]
    },
    {
      label: 'Fil',
      submenu: [
        {
          label: 'Nytt dokument',
          accelerator: CommandOrCtrl() + '+N',
          click: function() {
            $('#template-modal').modal('show');
          }
        },
        {
          label: 'Ny mal',
          accelerator: CommandOrCtrl() + '+T',
          click: function() {

          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Importer dokument',
          accelerator: CommandOrCtrl() + '+I',
          click: function() {
            GV.helpers.importDocument();
          }
        },
        {
          label: 'Eksporter dokument',
          accelerator: CommandOrCtrl() + '+E',
          click: function() {
            var doc = Session.get('mainDocument');
            if(doc) {
              GV.helpers.exportDocument(doc);
            } else {
              Notifications.error('Eksportering mislyktes', 'Du må ha åpnet et dokument for å kunne eksportere det.');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Importer mal',
          accelerator: CommandOrCtrl() + '+I',
          click: function() {
            GV.helpers.importDocument({
              template: true
            });
          }
        },
        {
          label: 'Eksporter mal',
          accelerator: CommandOrCtrl() + '+E',
          click: function() {
            var doc = Session.get('mainDocument');
            if(doc) {
              GV.helpers.exportDocument(doc, {
                template: true
              });
            } else {
              Notifications.error('Eksportering mislyktes', 'Du må ha åpnet en mal for å kunne eksportere den.');
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
          selector: 'undo:'
        },
        {
          label: 'Gjenta',
          accelerator: 'Shift+'+ CommandOrCtrl() + '+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Klipp ut',
          accelerator: CommandOrCtrl() + '+X',
          selector: 'cut:'
        },
        {
          label: 'Kopier',
          accelerator: CommandOrCtrl() + '+C',
          selector: 'copy:'
        },
        {
          label: 'Lim inn',
          accelerator: CommandOrCtrl() + '+V',
          selector: 'paste:'
        },
        {
          label: 'Merk Alt',
          accelerator: CommandOrCtrl() + '+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'Vis',
      submenu: [
        {
          label: 'Oppfrisk',
          accelerator: CommandOrCtrl() + '+R',
          click: function() { remote.getCurrentWindow().reload(); }
        },
        {
          label: 'Slå på utviklerverktøy',
          accelerator: 'Alt+' + CommandOrCtrl() + '+I',
          click: function() { remote.getCurrentWindow().toggleDevTools(); }
        },
      ]
    },
    {
      label: 'Vindu',
      submenu: [
        {
          label: 'Minimèr',
          accelerator: CommandOrCtrl() + '+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Lukk',
          accelerator: CommandOrCtrl() + '+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Vis alle vinduer',
          selector: 'arrangeInFront:'
        }
      ]
    }
  ];

  if(!isWindows()) {
    template.push({
      label: 'Help',
      submenu: []
    });
  }

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
});
