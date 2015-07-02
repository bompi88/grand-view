"use strict";

Meteor.startup(function() {
var remote = require('remote');
var Menu = remote.require('menu');
// var BrowserWindow = require('browser-window');
// var aboutWin = new BrowserWindow({ width: 300, height: 200, frame: false });
var resources_root = require('fs').realpathSync( process.env.DIR || process.cwd() + '/../' );

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
        accelerator: 'Command+H',
        selector: 'hide:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Lukk GrandView',
        accelerator: 'Command+Q',
        selector: 'terminate:'
      },
    ]
  },
  {
    label: 'Fil',
    submenu: [
      {
        label: 'Nytt dokument',
        accelerator: 'Command+N',
        click: function() {

        }
      },
      {
        label: 'Ny mal',
        accelerator: 'Command+M',
        click: function() {

        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Importer dokument',
        accelerator: 'Command+I',
        click: function() {

        }
      },
      {
        label: 'Eksporter dokument',
        accelerator: 'Command+E',
        click: function() {

        }
      }
    ]
  },
  {
    label: 'Rediger',
    submenu: [
      {
        label: 'Angre',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: 'Gjenta',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Klipp ut',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: 'Kopier',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: 'Lim inn',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: 'Merk Alt',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }
    ]
  },
  {
    label: 'Vis',
    submenu: [
      {
        label: 'Oppfrisk',
        accelerator: 'Command+R',
        click: function() { remote.getCurrentWindow().reload(); }
      },
      {
        label: 'Slå på utviklerverktøy',
        accelerator: 'Alt+Command+I',
        click: function() { remote.getCurrentWindow().toggleDevTools(); }
      },
    ]
  },
  {
    label: 'Vindu',
    submenu: [
      {
        label: 'Minimèr',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Lukk',
        accelerator: 'Command+W',
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
  },
  {
    label: 'Help',
    submenu: []
  }
];

var menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(menu);
});
