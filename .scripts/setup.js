////////////////////////////////////////////////////////////////////////////////
// Setup the environment
////////////////////////////////////////////////////////////////////////////////

/* eslint-env shelljs */
/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

require('shelljs/global');
require('colors');

const path = require('path');
const AdmZip = require('adm-zip');
const pjson = require('../package.json');
const fs = require('fs-extra');

// Auto-exit on errors
config.fatal = true;

// Get the directory of the current script
const dir = __dirname;
const base = path.normalize(path.join(dir, '..'));

const electronVersion = pjson.electron_version;

// -- Platform and arch detection ----------------------------------------------

const platform = process.platform;
const arch = process.arch;
const onWindows = platform === 'win32';

console.log('Detected platform: '.bold.white, platform);
console.log('Detected architecture: '.bold.white, arch);

// -- Download Electron into cache folder --------------------------------------

const electronFile = 'electron-v' + electronVersion + '-' + platform +
  '-' + arch + '.zip';

cd(base);

if (!test('-d', '.cache')) {
  mkdir('.cache');
}

cd('.cache');

if (!test('-f', electronFile)) {
  echo('-----> Downloading Electron...'.yellow + ' (version: ' + electronVersion + ')');

  const electronCurl = 'curl --insecure -L -o ' +
    electronFile +
    ' http://github.com/atom/electron/releases/download/v' +
    electronVersion + '/' + electronFile;

  exec(electronCurl);
}

echo('-----> Extracting Electron archive...'.yellow);

fs.removeSync('electron/');

if (onWindows) {
  const electronZip = new AdmZip(electronFile);
  electronZip.extractAllTo('electron', true);
} else {
  if (!test('-d', 'electron')) {
    mkdir('electron');
  }
  exec('unzip -d electron ' + electronFile);
}
echo('Finished!'.green);
