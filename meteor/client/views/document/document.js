////////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var fs = require('fs');
var remote = require('remote');
var childProcess = require('child_process');
var archiver = require('archiver');
var path  = require('path');
var async = require('async');


// -- Helpers ------------------------------------------------------------------


function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

// -- Template event -----------------------------------------------------------


Template.Document.events({

  'click .back-to-dashboard': function () {
    Router.go('Dashboard');
  },

  'click .export': function () {

    var basePath = process.env.HOME + "/GrandView";

    // create all directories
    mkdirSync(basePath);
    mkdirSync(path.join(basePath, "tmp"));
    mkdirSync(path.join(basePath, "tmp", "files"));

    // Gather document in one file, and nodes in another and put the them inside
    // the new folder
    var routeController = Router.current();
    var currentDoc = routeController && routeController.data && routeController.data();

    // Subscribe to all files first
    Router.current().subscribe('filesByDocument', currentDoc._id, function() {

      // Just in case the data is outdated in client
      var doc = GV.collections.Documents.findOne({ _id: currentDoc._id });
      var nodes = GV.collections.Nodes.find({ _id: { $in: doc.children || [] } }).fetch();

      // write the data
      fs.writeFileSync(basePath + "/tmp/doc.json", JSON.stringify(doc, null, 4), "utf-8");
      fs.writeFileSync(basePath + "/tmp/nodes.json", JSON.stringify(nodes, null, 4), "utf-8");

      // find all files linked to nodes and copy the files into the new folder
      var fileIds = _.filter(_.pluck(nodes, 'fileId'), function(node) { return node });
      var files = GV.collections.Files.find({ _id: { $in: fileIds || [] } }).fetch();

      async.forEach(files, function (file, callback){

        console.log(file);

        var fileName = file && file.copies && file.copies.filesStore && file.copies.filesStore.key;

        var from = basePath + "/files/" + fileName;
        var to = basePath + '/tmp/files/' + fileName;

        copyFile(from, to, callback);

      }, function(err) {

        if(err) {
          console.log(err)
          deleteFolderRecursive(basePath + "/tmp");
          return;
        }

        // zip all contents inside this folder and retrieve the path of the zip file
        var output = fs.createWriteStream(basePath + '/output.zip');
        var archive = archiver('zip');

        // Set up a write stream
        output.on('close', function() {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        archive.on('error', function(err) {
          deleteFolderRecursive(basePath + "/tmp");

          throw err;
        });

        archive.pipe(output);

        archive.bulk([
          { expand: true, cwd: basePath + '/tmp', src: ['*.json'] },
          { expand: true, cwd: basePath + '/tmp/files', src: ['**'], dest: 'files' }
        ]);

        archive.finalize();

        // rewrite to a GrandView file (.gvf)
        remote.require('dialog').showSaveDialog( {
          title:'Eksporter rapportstrukturen',
          filters: [
            { name: 'GrandViewFile', extensions: ['gvf'] },
          ]
        }, function(filePathAndName) {
          if(filePathAndName) {
            fs.rename(basePath + '/output.zip', filePathAndName, function (err) {
              if(err) {
                console.log(err);
              } else {
                Notifications.success("Eksportering fullført", "Filen ble lagret her: " + filePathAndName);
              }

              deleteFolderRecursive(basePath + "/tmp");
            });
          } else {
            deleteFolderRecursive(basePath + "/tmp");
          }
        });
      });
    });
  },

  'click .import': function () {


    // TODO: write import behaviour
  }

});


// -- Template helpers ---------------------------------------------------------


Template.Document.helpers({

	focusOnMainDoc: function() {
		return Session.get('nodeInFocus') == Session.get('mainDocument');
	}

});
