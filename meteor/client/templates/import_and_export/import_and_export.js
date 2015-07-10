////////////////////////////////////////////////////////////////////////////////
// Import And Export Logic
////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
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
////////////////////////////////////////////////////////////////////////////////

"use strict";

var fs = require('fs');
var remote = require('remote');
var archiver = require('archiver');
var path = require('path');
var async = require('async');
var tar = require('tar-stream');


// -- Helpers ------------------------------------------------------------------


function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

function deleteFolderRecursive(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

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

function deepCopyImport(docs, nodes, fileDocs, srcPath) {

  Meteor.call('import', docs, nodes, fileDocs, srcPath, function(err, res) {
    if (err) {
      Notifications.error("Feilmelding", err.message);
    } else {

      deleteFolderRecursive(path.join(GV.basePath, "tmp"));

      Notifications.success(
        "Importering lyktes",
        "Rapportstrukturen ble importert i systemet og kan finnes på dashbordet."
      );

      Session.set("working", false);
    }
  });
}

GV.helpers = _.extend(GV.helpers, {

  importDocument: function(isTemplate) {

    var extension = isTemplate ? 'gvt' : 'gvd';

    // show open dialog for GrandView files (.gvf)
    remote.require('dialog').showOpenDialog({
      title: 'Importer rapportstruktur',
      filters: [{
        name: 'GrandViewFile',
        extensions: [extension]
      }],
      properties: ['openFile']
    }, function(filePathAndName) {
      if (filePathAndName) {
        Session.set("working", true);
        Session.set("workingText", "Importerer fil... vennligst vent...");

        var originalPath = filePathAndName[0];
        var newPath = path.join(GV.basePath, "tmp", "import");

        // create a sandbox
        mkdirSync(GV.basePath);
        mkdirSync(path.join(GV.basePath, "tmp"));
        mkdirSync(newPath);

        // copy over to sandbox
        copyFile(originalPath, newPath + "/import." + extension, function(err) {
          if (err) {
            console.log(err);

            deleteFolderRecursive(path.join(GV.basePath, "tmp"));
            return;
          }

          fs.rename(newPath + '/import.' + extension, newPath + '/import.tar', function(err) {
            if (err) {
              console.log(err);
              deleteFolderRecursive(path.join(GV.basePath, "tmp"));
              return;
            }

            var extract = tar.extract();

            var tarball = newPath + "/import.tar";
            var dest = path.join(GV.basePath, "tmp", "import");

            extract.on('entry', function(header, stream, callback) {

                var isDir = 'Directory' === header.type;
                var fullpath = path.join(dest, header.path || header.name);
                var directory = isDir ? fullpath : path.dirname(fullpath);

                mkdirSync(directory);

                if ('file' === header.type) {
                  stream.pipe(fs.createWriteStream(fullpath));

                } else {
                  callback();
                }

                stream.on('end', function() {
                  callback(); // ready for next entry
                });

                stream.on('error', function(err) {
                  callback(err);
                });
              })
              .on('error', function(err) {
                console.log(err);
                deleteFolderRecursive(path.join(GV.basePath, "tmp"));
              });


            fs.createReadStream(tarball).pipe(extract).on('finish', function() {
              Meteor.setTimeout(function() {
                var nodeImp = fs.readFileSync(dest + "/nodes.json", "utf8");
                var docImp = fs.readFileSync(dest + "/docs.json", "utf8");
                var fileImp = fs.readFileSync(dest + "/files.json", "utf8");

                // import document to db
                var docs = (docImp === "") ? [] : JSON.parse(docImp);
                var nodes = (nodeImp === "") ? [] : JSON.parse(nodeImp);
                var fileDocs = (fileImp === "") ? [] : JSON.parse(fileImp);

                deepCopyImport(
                  docs,
                  nodes,
                  fileDocs,
                  path.join(GV.basePath, "tmp", "import", "files")
                );
              }, 1000);
            });
          });
        });
      }
    });
  },

  exportDocument: function(id, isTemplate) {

    var extension = isTemplate ? 'gvt' : 'gvd';

    Session.set("working", true);
    Session.set("workingText", "Pakker fil... vennligst vent...");

    // create all directories
    mkdirSync(GV.basePath);
    mkdirSync(path.join(GV.basePath, "tmp"));
    mkdirSync(path.join(GV.basePath, "tmp", "files"));

    // Gather document in one file, and nodes in another and put the them inside
    // the new folder

    // Subscribe to all files first
    Router.current().subscribe('allByDoc', id, function() {

      // Just in case the data is outdated in client
      var doc = GV.collections.Documents.findOne({
        _id: id
      });
      var nodes = GV.collections.Nodes.find({
        _id: {
          $in: doc.children || []
        }
      }).fetch();


      // find all files linked to nodes and copy the files into the new folder
      var fileIds = _.filter(_.pluck(nodes, 'fileId'), function(node) {
        return node;
      });
      var files = GV.collections.Files.find({
        _id: {
          $in: fileIds || []
        }
      }).fetch();

      // write the data
      fs.writeFileSync(GV.basePath + "tmp/docs.json", JSON.stringify(doc, null, 4), "utf8");
      fs.writeFileSync(GV.basePath + "tmp/nodes.json", JSON.stringify(nodes, null, 4), "utf8");
      fs.writeFileSync(GV.basePath + "tmp/files.json", JSON.stringify(files, null, 4), "utf8");


      async.forEach(files, function(file, callback) {

        var fileName = file && file.copies && file.copies.filesStore && file.copies.filesStore.key;

        var from = GV.basePath + "files/" + fileName;
        var to = GV.basePath + 'tmp/files/' + fileName;

        copyFile(from, to, callback);

      }, function(err) {

        if (err) {
          console.log(err);
          deleteFolderRecursive(GV.basePath + "tmp");
          return;
        }

        // zip all contents inside this folder and retrieve the path of the zip file
        var output = fs.createWriteStream(GV.basePath + 'output.tar');
        var archive = archiver('tar');

        // Set up a write stream
        output.on('close', function() {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');

          Session.set("working", false);

          // rewrite to a GrandView file (.gvf)
          remote.require('dialog').showSaveDialog({
            title: 'Eksporter rapportstrukturen',
            filters: [{
              name: 'GrandViewFile',
              extensions: [extension]
            }, ]
          }, function(filePathAndName) {
            if (filePathAndName) {
              fs.rename(GV.basePath + 'output.tar', filePathAndName, function(err) {
                if (err) {
                  console.log(err);
                } else {
                  Notifications.success(
                    "Eksportering fullført",
                    "Filen ble lagret her: " + filePathAndName
                  );
                }

                deleteFolderRecursive(GV.basePath + "tmp");
              });
            } else {
              deleteFolderRecursive(GV.basePath + "tmp");
            }
          });
        });

        archive.on('error', function(err) {
          deleteFolderRecursive(GV.basePath + "tmp");

          throw err;
        });

        archive.pipe(output);

        archive.bulk([{
          expand: true,
          cwd: GV.basePath + 'tmp',
          src: ['*.json']
        }, {
          expand: true,
          cwd: GV.basePath + 'tmp/files',
          src: ['**'],
          dest: 'files'
        }]);

        archive.finalize();

      });
    });
  }

});

// -- Template event -----------------------------------------------------------


Template.ImportButton.events({

  'click .import': function() {
    GV.helpers.importDocument();
  }
});

Template.ExportButton.events({

  'click .export': function() {
    var currentDoc = this.currDoc;

    GV.helpers.exportDocument(currentDoc._id, currentDoc.template);
  }

});
