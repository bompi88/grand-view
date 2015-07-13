////////////////////////////////////////////////////////////////////////////////
// The Main App file
////////////////////////////////////////////////////////////////////////////////

/* jshint strict:false */
/* eslint strict:false */
/* global mainWindow:true */

var BrowserWindow = require('browser-window'),
  childProcess = require('child_process'),
  pjson = require('./package.json'),
  path = require('path'),
  net = require('net'),
  app = require('app'),
  os = require('os'),
  fs = require('fs');

// Set in package.json
var appName = pjson.name;
var dirname = __dirname;
var env = process.env;

// -- Some mongo and node variables --------------------------------------------

var rootURL = 'http://localhost';
var bindIP = '127.0.0.1';
var mongoRootUrl = 'mongodb://localhost:';
var dbName = 'meteor';

// -- Browser window setup -----------------------------------------------------

var width = 1200;
var height = 800;
var minWidth = 1000;
var minHeight = 800;

var resizeable = true;
var frame = true;

// -- Set up paths -------------------------------------------------------------

var resourcesDir = path.join(dirname, 'resources');
var nodeModulesDir = path.join(dirname, 'node_modules');
var meteorPath = path.join(dirname, 'bundle');

var appPath = '';

if (os.platform() === 'darwin') {
  appPath = path.join(env.HOME, 'Library/Application Support/', appName, '/');
} else if (os.platform() === 'win32') {
  appPath = path.join(env.HOMEPATH, 'AppData/Local/', appName, '/');
} else if (os.platform() === 'linux') {
  appPath = path.join(env.HOME, '/.config/', appName, '/');
}

console.log('App path: ' + appPath);

var dataPath = path.join(appPath, 'data');

// -- Helpers ------------------------------------------------------------------

/**
 * Determine an occupied port
 */
function freePort(callback) {
  var server = net.createServer();
  var port = 0;

  server.on('listening', function() {
    port = server.address().port;
    server.close();
  });

  server.on('close', function() {
    callback(null, port);
  });

  server.listen(0, '127.0.0.1');
}

/**
 * Create a dir if it not exists
 */
function createDirSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

/**
 * Read file if exists
 */
function readFileSync(path) {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path.join(path), 'utf8');
  }
  return '';
}

/**
 * Start Node Child
 */
function startNode(options, mongoChild, callback) {

  console.log('Starting node child...');

  var nodePath = path.join(resourcesDir, 'node');
  var nodeArgs = path.join(meteorPath, 'main.js');

  var opened = false;

  // Set environment variables
  env.ROOT_URL = rootURL;
  env.PORT = options.webPort;
  env.BIND_IP = bindIP;
  env.DB_PATH = dataPath;
  env.MONGO_URL = mongoRootUrl + options.mongoPort + "/" + dbName;
  env.METEOR_SETTINGS = readFileSync(path.join(appPath, 'settings.json'));
  env.DIR = dirname;
  env.NODE_ENV = 'production';
  env.NODE_PATH = nodeModulesDir;

  var nodeChild = childProcess.execFile(nodePath, [nodeArgs], {
    env: env
  });

  // listen for errors
  nodeChild.stderr.setEncoding('utf8');
  nodeChild.stderr.on('data', function(nodeData) {
    console.log('stderr: ', nodeData);
  });

  // Listen on meteor events
  nodeChild.stdout.setEncoding('utf8');
  nodeChild.stdout.on('data', function(nodeData) {
    if (nodeData.indexOf('Meteor app started.' !== -1)) {
      if (!opened) {
        opened = true;
      } else {
        return;
      }

      setTimeout(function() {
        var fullURL = rootURL + ':' + options.webPort;
        callback(fullURL, nodeChild, mongoChild);
      }, 100);
    }
  });
}

/**
 * Starts mongo on specified port and starts Node on finish
 */
function startMongo(options, callback) {
  // Path to mongod
  var mongodPath = path.join(resourcesDir, 'mongod');
  var started = false;
  var mongodArgs;

  // Arguments passed to mongod
  if (os.platform() === 'win32') {
    mongodArgs = [
      '--bind_ip',
      '127.0.0.1',
      '--dbpath',
      dataPath,
      '--port',
      options.mongoPort,
      '--smallfiles'
    ];
  } else {
    mongodArgs = [
      '--bind_ip',
      '127.0.0.1',
      '--dbpath',
      dataPath,
      '--port',
      options.mongoPort,
      '--unixSocketPrefix',
      dataPath,
      '--smallfiles'
    ];
  }

  // Start the Mongo process.
  var mongoChild = childProcess.spawn(mongodPath, mongodArgs, {
    env: {
      PURPOSE: appName
    }
  });

  // Listen on mongod errors
  mongoChild.stderr.setEncoding('utf8');
  mongoChild.stderr.on('data', function(data) {
    console.log(data);
  });

  // Listen on mongo events
  mongoChild.stdout.setEncoding('utf8');
  mongoChild.stdout.on('data', function(data) {
    var mongoRunnning = data.indexOf(
      'waiting for connections on port ' +
      options.mongoPort
    );

    // If mongo is up and running
    if (mongoRunnning !== -1) {

      if (!started) {
        started = true;
      } else {
        return;
      }

      // Start node child
      startNode({
        mongoPort: options.mongoPort,
        webPort: options.webPort
      }, mongoChild, callback);
    }
  });
}

/**
 * Trigger the boot process
 */
function start(callback) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in Dev mode.');
    callback('http://localhost:3000');
  } else {
    process.stdout.write('Starting production server\n');

    // Create paths
    createDirSync(appPath);
    createDirSync(dataPath);

    // Detect unoccupied ports
    freePort(function(err, webPort) {
      freePort(function(err, mongoPort) {
        console.log('MongoPort: ', mongoPort);
        console.log('WebPort: ', webPort);

        // Delete the mongod lock file
        fs.unlink(path.join(dataPath, 'mongod.lock'), function() {
          // Start mongo first
          startMongo({
            mongoPort: mongoPort,
            webPort: webPort
          }, callback);
        });
      });
    });
  }
}

// -- Setup the app ------------------------------------------------------------

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is garbage collected.

mainWindow = null;

// Emitted when the application is activated while there is no opened windows.
// It usually happens when a user has closed all of application's windows and
// then click on the application's dock icon.
app.on('activate-with-no-open-windows', function() {
  if (mainWindow) {
    mainWindow.show();
  }

  return false;
});

// Emitted when Electron has done all of the initialization.
app.on('ready', function() {
  start(function(url, nodeChild, mongoChild) {
    console.log('App occupying ', url);

    var cleanup = function() {
      app.quit();
    };

    // Create the browser window.
    var windowOptions = {
      width: width,
      height: height,
      "min-width": minWidth,
      "min-height": minHeight,
      resizeable: resizeable,
      frame: frame
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.focus();
    mainWindow.loadUrl(url);

    process.on('uncaughtException', cleanup);

    // Emitted when all windows have been closed and the application will quit.
    // Calling event.preventDefault() will prevent the default behaviour, which
    // is terminating the application.
    app.on('will-quit', function(event) {
      console.log(event);
      console.log('Cleaning up children.');

      if (nodeChild) {
        console.log('cleaning up node child');
        nodeChild.kill('SIGTERM');
      }

      if (mongoChild) {
        console.log('cleaning up mongo child');
        mongoChild.kill('SIGTERM');
      }

    });

    app.on('window-all-closed', function() {
      cleanup();
    });
  });
});
