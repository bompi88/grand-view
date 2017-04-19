////////////////////////////////////////////////////////////////////////////////
// Prepare the app for dist
////////////////////////////////////////////////////////////////////////////////

/* eslint-env shelljs */
/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

require('shelljs/global');
require('colors');

const path = require('path');
const fs = require('fs-extra');

// Auto-exit on errors
config.fatal = true; // eslint-disable-line

echo('-----> Preparing for build...'.yellow);

// -- Determine the platform and arch running ----------------------------------

const args = require('minimist')(process.argv.slice(2));

const currentPlatform = process.platform;
const platform = args.platform;
const arch = args.arch;

if (!platform) {
  throw new Error('Platform not specified...'.bold.red);
}

if (!arch) {
  throw new Error('Architecture not specified...'.bold.red);
}

const onWindows = currentPlatform === 'win32';

console.log('Target platform: '.bold.white, platform);
console.log('Target architecture: '.bold.white, arch);

// -- Set up some paths --------------------------------------------------------

const dir = __dirname;
const base = path.normalize(path.join(dir, '..'));

// -- Build the meteor app -----------------------------------------------------

echo('-----> Building bundle from Meteor app, this may take a few minutes...'.yellow);

cd(base);

const meteorCommand = (onWindows === true) ? 'meteor.bat' : 'meteor';
exec(meteorCommand + ' build --directory .bundle');

cd(base + '/.bundle/bundle');

// -- Install Meteor Npm package dependencies ----------------------------------

echo('-----> Installing bundle npm packages...'.yellow);
cd('./programs/server');
exec(meteorCommand + ' npm install');
echo('-----> Bundle created :)\n'.green);

cd(base);

// -- Copy all necessary stuff into ./app directory ----------------------------

fs.removeSync('./.app');

mkdir('./.app');

function copyMeteorBundle(os) {
  switch (os) {

    case 'win32':
    case 'linux':
    case 'darwin':
      mkdir('./.app/bundle');
      cp('-R', '.bundle/bundle/*', './.app/bundle');
      break;

    default:
      throw new Error('Unrecognized Operating System. Exiting...'.bold.red);
  }
}

function copyStartupFiles(os) {
  switch (os) {

    case 'win32':
    case 'linux':
    case 'darwin':
      cp('./.index.js', './.app/');
      cp('./.preload.js', './.app/');
      cp('./.about-en.html', './.app/');
      cp('./.about-no-NB.html', './.app/');
      cp('./.splash.html', './.app/');
      cp('./app-package.json', './.app/package.json');
      cp('./packager.json', './.app/packager.json');
      cp('-R', './node_modules', './.app/');
      break;

    default:
      throw new Error('Unrecognized Operating System. Exiting...'.bold.red);
  }
}

function copyBinaryFiles(os, architecture) {
  switch (os) {

    case 'win32':
    case 'linux':
    case 'darwin':
      mkdir('./.app/resources');
      const nodePostfix = (platform === 'win32') ? 'node.exe' : 'bin/node';
      const mongodbPostfix = (platform === 'win32') ? 'mongod.exe' : 'mongod';
      const np = './.cache/' + 'node-' + os + '-' + architecture + '/';
      const mp = './.cache/' + 'mongodb-' + os + '-' + architecture + '/';
      cp(np + nodePostfix, './.app/resources/');

      if (platform !== 'win32') {
        cp(np + 'LICENSE', './.app/resources/');
      }

      cp(mp + 'bin/' + mongodbPostfix, './.app/resources/');
      cp(mp + 'GNU-AGPL-3.0', './.app/resources/');
      break;

    default:
      throw new Error('Unrecognized Operating System. Exiting...'.bold.red);
  }
}

// Move necessary files

echo('-----> Copying Meteor bundle into ./.app ...'.yellow);
copyMeteorBundle(platform, arch);

echo('-----> Copying startup files into ./.app ...'.yellow);
copyStartupFiles(platform, arch);

echo('-----> Copying binary files into ./.app ...'.yellow);
copyBinaryFiles(platform, arch);
