////////////////////////////////////////////////////////////////////////////////
// Setup the environment
////////////////////////////////////////////////////////////////////////////////

'use strict';

require('shelljs/global');
require('colors');

var path = require('path'),
    AdmZip = require('adm-zip'),
    pjson = require('../package.json');

// Auto-exit on errors
config.fatal = true;

// Get the directory of the current script
var dir = __dirname;
var base = path.normalize(path.join(dir, '..'));

var electronVersion = pjson.electron_version;

// -- Platform and arch detection ----------------------------------------------

var platform = process.platform;
var arch = process.arch;
var onWindows = (platform === 'win32') ? true : false;

console.log('Detected platform: '.bold.white, platform);
console.log('Detected architecture: '.bold.white, arch);

// -- Download Electron into cache folder --------------------------------------

var electronFile =  'electron-v' + electronVersion + '-' + platform +
                    '-' + arch + '.zip';

cd(base);

if (!test('-d', 'cache')) {
  mkdir('cache');
}

cd('cache');

if (!test('-f', electronFile)) {
  echo('-----> Downloading Electron...'.yellow + ' (version: ' + electronVersion + ')');

  var electronCurl =  'curl --insecure -L -o ' +
                      electronFile +
                      ' http://github.com/atom/electron/releases/download/v' +
                      electronVersion + '/' + electronFile;
  exec(electronCurl);

  echo('-----> Extracting Electron archive...'.yellow);

  if (onWindows) {
    var electronZip = new AdmZip(electronFile);
    electronZip.extractAllTo('electron', true);
  } else {
    mkdir('electron');
    exec('unzip -d electron ' + electronFile);
  }
} else {
  echo('Electron v' + electronVersion + ' already installed.');
}

echo('Finished!'.green);
