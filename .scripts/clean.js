////////////////////////////////////////////////////////////////////////////////
// Clean a specific build
////////////////////////////////////////////////////////////////////////////////

/* eslint-env shelljs */
/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

require('shelljs/global');
require('colors');

const async = require('async');
const path = require('path');
const fs = require('fs-extra');

// Auto-exit on errors
config.fatal = true;

// -- Determine the platform and arch running ----------------------------------

const args = require('minimist')(process.argv.slice(2));

const arch = args.arch;
let platform = args.platform;

if (!platform) {
  throw new Error('Platform not specified...'.bold.red);
}

if (!arch) {
  throw new Error('Architecture not specified...'.bold.red);
}

echo('-----> Removing build...'.yellow + '(platform: ' + platform + ', arch: ' + arch + ')');

// -- Set up some paths --------------------------------------------------------

const dir = __dirname;
const base = path.normalize(path.join(dir, '..'));

// -- Remove build -------------------------------------------------------------

platform = (platform === 'darwin') ? 'osx' : platform;
platform = (platform === 'win32') ? 'windows' : platform;

const r = function (cb) {
  fs.remove(base + '/.dist/' + platform + '/' + arch, function (err) {
    if (err) {
      echo('Could not remove.. Trying again..');
    }
    cb(err, null);
  });
};

async.retry({
  times: 5,
  interval: 100
}, r, function (err) {
  if (err) {
    throw new Error(err);
  }
  echo('Build removed.');
});
