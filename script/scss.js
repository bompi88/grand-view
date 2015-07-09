// Builds the scss dependencies hack
'use strict';

require('shelljs/global');
var child_process = require('child_process');
var path = require('path');

// Get the directory of the current script
var dir = __dirname;
var meteorPath = path.normalize(path.join(dir, '../meteor'));
var platform = process.platform;

cd(meteorPath);

var child;

if(platform === "win32") {
  child = child_process.exec("meteor.bat 2> nul");
} else {
  child = child_process.exec("meteor || true");
}

setTimeout(function() {
  child.kill("SIGINT");
  process.exit(0);
}, 100000);
