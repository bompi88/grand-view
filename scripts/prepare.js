////////////////////////////////////////////////////////////////////////////////
// Prepare the app for dist
////////////////////////////////////////////////////////////////////////////////

'use strict';

require('shelljs/global');
require('colors');

var path = require('path'),
    fs = require('fs-extra');

// Auto-exit on errors
config.fatal = true;

echo('-----> Preparing for build...'.yellow);

// -- Determine the platform and arch running ----------------------------------

var args = require('minimist')(process.argv.slice(2));

var currentPlatform = process.platform;
var platform = args.platform;
var arch = args.arch;

if (!platform) {
  throw new Error('Platform not specified...'.bold.red);
}

if (!arch) {
  throw new Error('Architecture not specified...'.bold.red);
}

var onWindows = (currentPlatform === 'win32') ? true : false;

console.log('Target platform: '.bold.white, platform);
console.log('Target architecture: '.bold.white, arch);

// -- Set up some paths --------------------------------------------------------

var dir = __dirname;
var base = path.normalize(path.join(dir, '..'));

// -- Build the meteor app -----------------------------------------------------

echo('-----> Building bundle from Meteor app, this may take a few minutes...'.yellow);

cd(base + '/meteor');

var meteorCommand = (onWindows === true) ? 'meteor.bat' : 'meteor';
exec(meteorCommand + ' build --directory ../.');

cd(base + '/bundle');

// -- Install Meteor Npm package dependencies ----------------------------------

echo('-----> Installing bundle npm packages...'.yellow);
cd('./programs/server');
exec('npm install');
echo('-----> Bundle created :)\n'.green);

cd(base);

// -- Copy all necessary stuff into ./app directory ----------------------------

fs.removeSync('./app');

mkdir('./app');

function copyMeteorBundle(os) {
  switch (os) {

    case 'win32':
    case 'linux':
    case 'darwin':
      mkdir('./app/bundle');
      cp('-R', 'bundle/*', './app/bundle');
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
      cp('./index.js', './app/');
      cp('./about.html', './app/');
      cp('./package.json', './app/');
      cp('-R', './node_modules', './app/');
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
      mkdir('./app/resources');
      var nodePostfix = (platform === 'win32') ? 'node.exe' : 'bin/node';
      var mongodbPostfix = (platform === 'win32') ? 'mongod.exe' : 'mongod';
      var np = './cache/' + 'node-' + os + '-' + architecture + '/';
      var mp = './cache/' + 'mongodb-' + os + '-' + architecture + '/';
      cp(np + nodePostfix, './app/resources/');
      cp(np + 'LICENSE', './app/resources/');
      cp(mp + 'bin/' + mongodbPostfix, './app/resources/');
      cp(mp + 'GNU-AGPL-3.0', './app/resources/');
      break;

    default:
      throw new Error('Unrecognized Operating System. Exiting...'.bold.red);
  }
}

// Move necessary files

echo('-----> Copying Meteor bundle into ./app ...'.yellow);
copyMeteorBundle(platform, arch);

echo('-----> Copying startup files into ./app ...'.yellow);
copyStartupFiles(platform, arch);

echo('-----> Copying binary files into ./app ...'.yellow);
copyBinaryFiles(platform, arch);
