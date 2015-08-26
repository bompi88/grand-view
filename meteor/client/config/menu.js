"use strict";

Meteor.startup(function() {
  var remote = require('remote');
  var Menu = remote.require('menu');
  var resources_root = require('fs').realpathSync( process.env.DIR || process.cwd() + '/../' );

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
              'width=300, height=280, resizable=no, scrollbars=no, status=no, menubar=no, toolbar=no'
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
          click: function() {
            remote.getCurrentWindow().minimize();
          }
        },
        {
          label: 'Vis GrandView',
          accelerator: CommandOrCtrl() + '+S',
          click: function() {
            remote.getCurrentWindow().show();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Lukk GrandView',
          accelerator: CommandOrCtrl() + '+Q',
          click: function() {
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
          click: function() {
            $('#template-modal').modal('show');
          }
        },
        {
          label: 'Ny mal',
          accelerator: CommandOrCtrl() + '+M',
          click: function() {
            GV.documentsCtrl.createNewTemplate();
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
          accelerator: CommandOrCtrl() + '+Shift+I',
          click: function() {
            GV.helpers.importDocument(true);
          }
        },
        {
          label: 'Eksporter mal',
          accelerator: CommandOrCtrl() + '+Shift+E',
          click: function() {
            var doc = Session.get('mainDocument');
            if(doc) {
              GV.helpers.exportDocument(doc, true);
            } else {
              Notifications.error('Eksportering mislyktes', 'Du må ha åpnet en mal for å kunne eksportere den.');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Generer utskriftsdokument',
          accelerator: CommandOrCtrl() + '+G',
          click: function() {
            var doc = Session.get('mainDocument');
            if(doc) {
              $('#create-printout').modal('show');
            } else {
              Notifications.error('Generering mislyktes', 'Du må ha åpnet et dokument for å kunne generere utskrift.');
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
          click: function() {
            remote.getCurrentWindow().webContents.undo();
          }
        },
        {
          label: 'Gjenta',
          accelerator: 'Shift+'+ CommandOrCtrl() + '+Z',
          click: function() {
            remote.getCurrentWindow().webContents.redo();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Klipp ut',
          accelerator: CommandOrCtrl() + '+X',
          click: function() {
            remote.getCurrentWindow().webContents.cut();
          }
        },
        {
          label: 'Kopier',
          accelerator: CommandOrCtrl() + '+C',
          click: function() {
            remote.getCurrentWindow().webContents.copy();
          }
        },
        {
          label: 'Lim inn',
          accelerator: CommandOrCtrl() + '+V',
          click: function() {
            remote.getCurrentWindow().webContents.paste();
          }
        },
        {
          label: 'Merk Alt',
          accelerator: CommandOrCtrl() + '+A',
          click: function() {
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
          click: function() { remote.getCurrentWindow().reload(); }
        },
        {
          label: 'Slå på/av utviklerverktøy',
          accelerator: 'Alt+' + CommandOrCtrl() + '+I',
          click: function() { remote.getCurrentWindow().toggleDevTools(); }
        },
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
});
