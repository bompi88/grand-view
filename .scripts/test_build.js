////////////////////////////////////////////////////////////////////////////////
// Test builds
////////////////////////////////////////////////////////////////////////////////

/* eslint-env shelljs */
/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

require('shelljs/global');
require('colors');
const path = require('path');

const childProcess = require('child_process');

// Auto-exit on errors
config.fatal = true; // eslint-disable-line

echo('-----> Testing build...'.yellow);

const build = process.argv[2];
const buildPath = path.resolve(build);

echo('Located at: '.bold.white + buildPath);

if (!build) {
  throw new Error('Please provide path to the build you want to test.');
}

const child = childProcess.spawn(buildPath, [
  'test-build'
]);

let mongoStarted = false;
let meteorStarted = false;

child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  echo(data);
  if (data.indexOf('Meteor app started') > -1) {
    meteorStarted = true;
  }
  if (data.indexOf('Mongo started') > -1) {
    mongoStarted = true;
  }

  if (data.toLowerCase().indexOf('error') > -1) {
    child.kill('SIGINT');
    process.exit(1);
  }

  if (mongoStarted && meteorStarted) {
    child.kill('SIGINT');
    process.exit(0);
  }
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (err) => {
  echo(err);
  child.kill('SIGINT');
  process.exit(1);
});
