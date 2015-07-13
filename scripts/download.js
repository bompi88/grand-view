////////////////////////////////////////////////////////////////////////////////
// Download Resources for build
////////////////////////////////////////////////////////////////////////////////

'use strict';

require('shelljs/global');
require('colors');

var tar = require('tar'),
    path = require('path'),
    fs = require('fs-extra'),
    AdmZip = require('adm-zip'),
    gunzip = require('gunzip-maybe'),
    pjson = require('../package.json');

var nodeVersion = pjson.node_version;
var mongoVersion = pjson.mongo_version;

// Auto-exit on errors
config.fatal = true;

echo('-----> Download resources for build...'.yellow);

// -- Determine the platform and arch running ----------------------------------

var args = require('minimist')(process.argv.slice(2));

var platform = args.platform;
var arch = args.arch;

if(!platform) {
  throw new Error('Platform not specified...'.bold.red);
}

if(!arch) {
  throw new Error('Architecture not specified...'.bold.red);
}

console.log('Target platform: '.bold.white, platform);
console.log('Target architecture: '.bold.white, arch);

// -- Set up some paths --------------------------------------------------------

var dir = __dirname;
var base = path.normalize(path.join(dir, '..'));

// -- Helpers ------------------------------------------------------------------

var removeExtension = function (fileName) {
  var charsToSlice = 0;
  if (fileName.indexOf('.tar.gz') !== -1) {
    charsToSlice = 7;
  } else {
    // .tgz, .zip
    charsToSlice = 4;
  }

  return fileName.slice(0, -(charsToSlice));
};

var unzip = function(file, path, message, zip) {
  if(zip) {
    var z = new AdmZip(file);
    z.extractAllTo('./', true);
  } else {
    fs.createReadStream(base + '/cache/' + file)
    .pipe(gunzip())
    .pipe(tar.Extract({ path: path, strip: 1 }))
    .on('error', function(er) { echo(er); })
    .on("end", function() { echo(message); });
  }
};

// -- Determine the files to fetch ---------------------------------------------

var mongoFile = '';
var nodeFile = '';

if (platform === 'win32') {
  var archName = (arch === 'x86') ? '-i386-' : '-x86_64-2008plus-';

  mongoFile = 'mongodb-' + platform + archName + mongoVersion + '.zip';
  nodeFile = 'node.exe';
} else {
  var archName = (arch === 'x86') ? '-i686-' : '-x86_64-';

  mongoFile = 'mongodb-' + platform + archName + mongoVersion + '.tgz';
  nodeFile = 'node-v' + nodeVersion + '-' + platform + '-' + arch + '.tar.gz';

  if (platform === 'darwin') {
    mongoFile = 'mongodb-osx-x86_64-' + mongoVersion + '.tgz';
  }
}

// -- Create cache folder if it do not exists ----------------------------------

cd(base);

if (!test('-d', 'cache')) {
  mkdir('cache');
}

cd('cache');

// -- Download MongoDB ---------------------------------------------------------

if (!test('-f', mongoFile)) {

  echo('-----> Downloading MongoDB...'.yellow + ' (version: ' + mongoVersion + ')');

  var os = platform === 'darwin' ? 'osx' : platform;
  var mongoCurl =   'curl -L -o ' +
                    mongoFile +
                    ' https://fastdl.mongodb.org/' +
                    os + '/' +
                    mongoFile;

  exec(mongoCurl);
  echo('-----> Unzipping MongoDB...'.yellow);

  var p = 'mongodb-' + platform + '-' + arch;
  if(!test('-d', p)) {
    mkdir(p);
  }

  if(platform === 'win32') {
    unzip(mongoFile, p, 'MongoDB unzipped.'.green, true);
    var outDir = removeExtension(mongoFile);
    mv(base + '/cache/' + outDir + '/*', base + '/cache/' + p);
    fs.removeSync(base + '/cache/' + outDir);

  } else {
    unzip(mongoFile, p, 'MongoDB unzipped.'.green);
  }

} else {
  echo('MongoDB already downloaded.');
}

// -- Download Node ------------------------------------------------------------

if (!test('-f', nodeFile)) {
  echo('-----> Downloading Node...'.yellow + ' (version: ' + nodeVersion + ')');
  var nodeCurl =  'curl -L -o ' +
                  nodeFile +
                  ' http://nodejs.org/dist/' +
                  'v' + nodeVersion +
                  '/' + nodeFile;

  exec(nodeCurl);

  var p = 'node-' + platform + '-' + arch;
  if(!test('-d', p)) {
    mkdir(p);
  }

  if (platform === 'win32') {
    mv(base + '/cache/node.exe', base + '/cache/' + p + '/node.exe');
  } else {
    unzip(nodeFile, p, 'Node unzipped.'.green);
  }
} else {
  echo('Node already downloaded.');
}

echo('Finished downloading!'.green);
