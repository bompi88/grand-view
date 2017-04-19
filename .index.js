////////////////////////////////////////////////////////////////////////////////
// The Main App file
////////////////////////////////////////////////////////////////////////////////

/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

const BrowserWindow = require('electron').BrowserWindow;
const childProcess = require('child_process');
const pjson = require('./package.json');
const app = require('electron').app;
const path = require('path');
const net = require('net');
const os = require('os');
const fs = require('fs');


// Set in package.json
const appName = pjson.name;
const dirname = __dirname;
const env = process.env;

// -- Some mongo and node variables --------------------------------------------

const rootURL = 'http://localhost';
const bindIP = '127.0.0.1';
const mongoRootUrl = 'mongodb://localhost:';
const dbName = 'meteor';

// -- Browser window setup -----------------------------------------------------

const width = 1200;
const height = 800;
const minWidth = 1000;
const minHeight = 800;

const resizeable = true;
const frame = true;

// -- Set up paths -------------------------------------------------------------

const resourcesDir = path.join(dirname, '../app.asar.unpacked', 'resources');
const nodeModulesDir = 'node_modules';
const meteorPath = path.join(dirname, 'bundle');

const platform = os.platform();

let appPath = '';

if (platform === 'darwin') {
  appPath = path.join(env.HOME, 'Library/Application Support/', appName, '/');
} else if (platform === 'win32') {
  appPath = path.join(env.HOMEPATH, 'AppData/Local/', appName, '/');
} else if (platform === 'linux') {
  appPath = path.join(env.HOME, '/.config/', appName, '/');
}
console.log('dir: ', dirname);

console.log('App path: ' + appPath);

const dataPath = path.join(appPath, 'data');

// -- Helpers ------------------------------------------------------------------

/**
 * Determine an occupied port
 */
function freePort(callback) {
  const server = net.createServer();
  let port = 0;

  server.on('listening', () => {
    port = server.address().port;
    server.close();
  });

  server.on('close', () => {
    callback(null, port);
  });

  server.listen(0, '127.0.0.1');
}

/**
 * Create a dir if it not exists
 */
function createDirSync(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
}

/**
 * Read file if exists
 */
function readFileSync(p) {
  if (fs.existsSync(p)) {
    return fs.readFileSync(path.join(p), 'utf8');
  }
  return '';
}

/**
 * Start Node Child
 */
function startNode(options, mongoChild, callback) {

  console.log('Starting node child...');

  const nodePath = path.join(resourcesDir, (platform === 'win32') ? 'node.exe' : 'node');
  const nodeArgs = path.join(meteorPath, 'main.js');

  let opened = false;

  // Set environment variables
  env.ROOT_URL = rootURL;
  env.PORT = options.webPort;
  env.BIND_IP = bindIP;
  env.DB_PATH = dataPath;
  env.MONGO_URL = mongoRootUrl + options.mongoPort + '/' + dbName;
  env.METEOR_SETTINGS = readFileSync(path.join(appPath, 'settings.json'));
  env.DIR = dirname;
  env.NODE_ENV = 'production';
  env.NODE_PATH = nodeModulesDir;
  env.ELECTRON_RUN_AS_NODE = 0;

  const nodeChild = childProcess.spawn(nodePath, [ nodeArgs ], { env });

  // listen for errors
  nodeChild.stderr.setEncoding('utf8');
  nodeChild.stderr.on('data', (nodeData) => {
    console.log('stderr: ', nodeData);
  });

  // Listen on meteor events
  nodeChild.stdout.setEncoding('utf8');
  nodeChild.stdout.on('data', (nodeData) => {

    console.log(nodeData);

    if (nodeData.indexOf('Meteor app started.' !== -1)) {
      if (!opened) {
        opened = true;
      } else {
        return;
      }

      setTimeout(() => {
        const fullURL = rootURL + ':' + options.webPort;
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
  const mongodPath = path.join(resourcesDir, 'mongod');
  let started = false;
  let mongodArgs;
  console.log('Starting mongo...');

  // Arguments passed to mongod
  if (platform === 'win32') {
    mongodArgs = [
      '--storageEngine',
      'mmapv1',
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
      '--storageEngine',
      'mmapv1',
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
  const mongoChild = childProcess.spawn(mongodPath, mongodArgs, {
    env: {
      PURPOSE: appName
    }
  });

  // Listen on mongod errors
  mongoChild.stderr.setEncoding('utf8');
  mongoChild.stderr.on('data', (data) => {
    console.log(data);
  });

  // Listen on mongo events
  mongoChild.stdout.setEncoding('utf8');
  mongoChild.stdout.on('data', (data) => {
    // console.log(data);
    const err = data.toLowerCase().indexOf('assertion');

    if (err !== -1) {
      throw new Error(data);
    }

    const mongoRunnning = data.indexOf(
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
      console.log('Mongo started...');
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
    return callback('http://localhost:3000');
  }

  process.stdout.write('Starting production server\n');

  // Create paths
  createDirSync(appPath);
  createDirSync(dataPath);

  // Detect unoccupied ports
  freePort((err, webPort) => {
    freePort((error, mongoPort) => {
      if (error) {
        throw error;
      }

      console.log('MongoPort: ', mongoPort);
      console.log('WebPort: ', webPort);

      // Delete the mongod and/or WiredTiger lock file
      fs.unlink(path.join(dataPath, 'mongod.lock'), () => {
        fs.unlink(path.join(dataPath, 'WiredTiger.lock'), () => {
          // Start mongo first
          startMongo({
            mongoPort,
            webPort
          }, callback);
        });
      });
    });
  });

}

// -- Setup the app ------------------------------------------------------------

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is garbage collected.

global.mainWindow = null;

// Emitted when the application is activated while there is no opened windows.
// It usually happens when a user has closed all of application's windows and
// then click on the application's dock icon.
app.on('activate-with-no-open-windows', () => {
  if (global.mainWindow) {
    global.mainWindow.show();
  }

  return false;
});

// Emitted when Electron has done all of the initialization.
app.on('ready', () => {

  const splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    resizeable: false,
    frame: false
  });

  splashScreen.focus();
  splashScreen.loadURL('file://' + app.getAppPath() + '/.splash.html');

  start((url, nodeChild, mongoChild) => {
    console.log('App occupying ', url);

    const cleanup = () => {
      app.quit();
    };

    // Create the browser window.
    const windowOptions = {
      width,
      height,
      'min-width': minWidth,
      'min-height': minHeight,
      resizeable,
      frame,
      webPreferences: {
        // Meteor overrides the require method, which do not find our electron
        // modules nor fs etc. We have to copy the require method. require()
        // should be used on the client to access node and electron modules.
        preload: require.resolve('./.preload')
      }
    };
    const mainWindow = new BrowserWindow(windowOptions);
    mainWindow.focus();
    splashScreen.close();
    mainWindow.loadURL(url);
    global.mainWindow = mainWindow;

    process.on('uncaughtException', cleanup);

    // Emitted when all windows have been closed and the application will quit.
    // Calling event.preventDefault() will prevent the default behaviour, which
    // is terminating the application.
    app.on('will-quit', (event) => {
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

    app.on('window-all-closed', () => {
      cleanup();
    });
  });
});
