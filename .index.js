////////////////////////////////////////////////////////////////////////////////////////////////////
// The Main App file
////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2017 Bjørn Bråthen, Concept NTNU
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////////////////////////////////////////

/* eslint no-sync: 0 */
/* eslint no-console: 0 */

'use strict';

const { app, BrowserWindow, protocol, ipcMain }= require('electron');
const { autoUpdater } = require('electron-updater');
const childProcess = require('child_process');
const pjson = require('./package.json');
const log = require('electron-log');
const path = require('path');
const net = require('net');
const os = require('os');
const fs = require('fs');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Set in package.json
const appName = pjson.name;
const env = process.env;

// -- Some mongo and node variables --------------------------------------------

const domain = 'http://localhost';
const mongoRootUrl = 'mongodb://localhost:';
const dbName = 'meteor';

// -- Browser window setup -----------------------------------------------------

const width = 1200;
const height = 800;
const minWidth = 1000;
const minHeight = 700;

const resizeable = true;
const frame = true;

// -- Set up paths -------------------------------------------------------------

const resourcesDir = path.join(__dirname, '..', 'app.asar.unpacked', 'resources');
const meteorServerPath = path.join(__dirname, 'bundle', 'programs', 'server');
const mongodPath = path.join(resourcesDir, 'mongod');

const platform = os.platform();

let appPath = '';

if (platform === 'darwin') {
  appPath = path.join(env.HOME, 'Library', 'Application Support', appName);
} else if (platform === 'win32') {
  appPath = path.join(env.HOMEPATH, 'AppData', 'Local', appName);
} else if (platform === 'linux') {
  appPath = path.join(env.HOME, '.config', appName);
}

const dataPath = path.join(appPath, 'data');

console.log('Root dir:', __dirname);
console.log('App directory path:', appPath);
console.log('DB path:', dataPath);
console.log('Mongod path:', mongodPath);

// -- Helper functions -----------------------------------------------------------------------------

/**
 * Determine an unoccupied port
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
}

/**
 * Start Node Child
 */
function startNode(options, mongoChild, callback) {

  console.log('Starting meteor instance...');

  const nodeArgs = path.join(meteorServerPath, 'boot.js');
  const rootUrl = `${domain}:${options.webPort}/`;
  let opened = false;

  const nodeEnv = {
    ROOT_URL: rootUrl,
    PORT: options.webPort,
    DB_PATH: dataPath,
    MONGO_URL: `${mongoRootUrl}${options.mongoPort}/${dbName}`,
    METEOR_SETTINGS: readFileSync(path.join(__dirname, 'settings.json')),
    NODE_ENV: 'production',
    ELECTRON_RUN_AS_NODE: 1
  };

  const nodeChild = childProcess.fork(nodeArgs,
    [
      path.join(meteorServerPath, 'program.json')
    ], {
      env: nodeEnv,
      silent: true // to be able to listen to stdout and stderr
    }
  );

  // listen for errors
  nodeChild.stderr.setEncoding('utf8');
  nodeChild.stderr.on('data', (nodeData) => {
    console.log('stderr: ', nodeData);
  });

  // Listen on stdout from our meteor instance
  nodeChild.stdout.setEncoding('utf8');
  nodeChild.stdout.on('data', (nodeData) => {

    console.log(nodeData);

    // If meteor tells it's ready
    if (nodeData.indexOf('Meteor app started.') !== -1) {
      if (!opened) {
        opened = true;
      } else {
        return;
      }

      setTimeout(() => callback(rootUrl, nodeChild, mongoChild), 100);
    }
  });
}

/**
 * Starts mongo on specified port and trigger start of meteor instance on finish
 */
function startMongo(options, callback) {

  console.log('Starting mongodb...');

  let started = false;

  const mongodArgs = [
    '--storageEngine',
    'mmapv1',
    '--bind_ip',
    '127.0.0.1',
    '--dbpath',
    dataPath,
    '--port',
    options.mongoPort,
    '--smallfiles',
    '--journal'
  ];

  // Arguments passed to mongod
  if (platform !== 'win32') {
    mongodArgs.push('--unixSocketPrefix');
    mongodArgs.push(dataPath);
  }

  // Start the Mongo process.
  const mongoChild = childProcess.spawn(mongodPath, mongodArgs, {
    env: {
      PURPOSE: appName
    }
  });

  // Listen on mongod errors
  mongoChild.stderr.setEncoding('utf8');
  mongoChild.stderr.on('data', (data) => console.log(data));

  // Listen on mongod stdout
  mongoChild.stdout.setEncoding('utf8');
  mongoChild.stdout.on('data', (data) => {
    const err = data.toLowerCase().indexOf('assertion');

    if (err !== -1) {
      throw new Error(data);
    }

    const mongoRunnning = data.indexOf(`waiting for connections on port ${options.mongoPort}`);

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

let mainWindow;

const shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

// Emitted when Electron has done all of the initialization.
function createWindow() {
  let splashScreen;

  const testBuild = process.argv[1] && process.argv[1] === 'test-build';

  if (!testBuild) {
    splashScreen = new BrowserWindow({
      width: 400,
      height: 300,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      fullscreenable: false,
      center: true,
      frame: false
    });

    splashScreen.focus();
    splashScreen.loadURL('file://' + app.getAppPath() + '/.splash.html');
  }

  start((url, nodeChild, mongoChild) => {
    if (testBuild) {
      return;
    }
    console.log('App occupying ', url);

    const cleanup = () => {
      console.log('Cleaning up children.');

      if (nodeChild) {
        console.log('cleaning up node child');
        nodeChild.kill('SIGTERM');
      }

      if (mongoChild) {
        console.log('cleaning up mongo child');
        mongoChild.kill('SIGTERM');
      }

      app.quit();
    };

    // Create the browser window.
    const windowOptions = {
      width,
      height,
      minWidth,
      minHeight,
      resizeable,
      frame,
      webPreferences: {
        nodeIntegration: false,
        // Meteor overrides the require method, which do not find our electron
        // modules etc. We have to copy the require method. _require()
        // should be used on the client to access node and electron modules.
        preload: require.resolve('./.preload')
      }
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.focus();
    splashScreen.close();

    mainWindow.loadURL(url);
    global.mainWindow = mainWindow;

    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }

    process.on('uncaughtException', cleanup);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.once('did-finish-load', (e) => {
      console.log(e);
      console.log('finished loading.');
    });

    mainWindow.once('ready-to-show', (e) => {
      console.log(e);
      console.log('ready to show.');
    });

    app.on('will-quit', () => {
      cleanup();
    });

    app.on('window-all-closed', () => {
      cleanup();
    });

  });
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  // sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  // sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater.');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  // setTimeout(function() {
  //   autoUpdater.quitAndInstall();
  // }, 5000);
})

app.on('ready', function() {
  setTimeout(function() {
    autoUpdater.checkForUpdates();
  }, 10000);
});

app.on('ready', createWindow);

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
