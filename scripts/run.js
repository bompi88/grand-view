////////////////////////////////////////////////////////////////////////////////
// Run ElectronMeteor App in development mode
////////////////////////////////////////////////////////////////////////////////

'use strict';

require('shelljs/global');
require('colors');

var spawn = require('child_process').spawn,
    path = require('path');

// Make sure we don't try to run in production
process.env.NODE_ENV = 'development';

// -- Set up some paths --------------------------------------------------------

var dir = __dirname;
var base = path.normalize(path.join(dir, '..'));
var npmPath = base + '/cache/node/bin/npm';
var nodePath = base + '/cache/node/bin/node';

if (onWindows) {
  npmPath = path.join(base, '/cache/nodejs/npm');
  nodePath = path.join(base, '/cache/nodejs/node.exe');
}

// -- Determine the platform and arch running ----------------------------------

var platform = process.platform;
var arch = process.arch;
var onWindows = (platform === 'win32') ? true : false;

console.log('Detected platform: '.bold.white, platform);
console.log('Detected architecture: '.bold.white, arch);

cd(base + '/meteor');

// -- Starting Meteor ----------------------------------------------------------

console.log('-----> Starting Meteor...'.yellow);

var meteorCommand = (onWindows === true) ? 'meteor.bat' : 'meteor';
var meteor = spawn(meteorCommand);

// -- Starting Electron --------------------------------------------------------

console.log('-----> Starting Electron...'.yellow);

var electronPath = '';
if (platform === 'darwin') {
  electronPath = '/cache/electron/electron.app/contents/MacOS/Electron';
} else {
  electronPath = '/cache/electron/electron';
}
var electron = exec(base + electronPath + ' ' + base, { async: true });

// -- Output Meteor and Electron messages to the console -----------------------

meteor.stdout.setEncoding('utf8');
meteor.stdout.on('data', function (data) {
  console.log(data);
});

meteor.stderr.setEncoding('utf8');
meteor.stderr.on('data', function (data) {
  console.log('stderr: ', data);
});

// electron.stdout.setEncoding('utf8');
electron.stdout.on('data', function(data) {
  if (!data === 'Cleaning up children.') {
    console.log(data);
  }
});

// -- Clean up -----------------------------------------------------------------

function killMeteor () {
  if (onWindows) {
    spawn('taskkill', ['/pid', meteor.pid, '/f', '/t']);
  } else {
    meteor.kill('SIGINT');
  }
}

function killElectron () {
  if (onWindows) {
    spawn('taskkill', ['/pid', electron.pid, '/f', '/t']);
  } else {
    electron.kill('SIGINT');
  }
}

meteor.stdout.on('close', function() {
  killElectron();
});

electron.stdout.on('close', function() {
  killMeteor();
});
