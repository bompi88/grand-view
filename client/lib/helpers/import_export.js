////////////////////////////////////////////////////////////////////////////////
// Import and export helpers
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

/* eslint no-sync: 0 */
/* eslint no-console: 0 */
/* global _require */

import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import {Notifications} from 'meteor/gfk:notifications';

import Globals from '/lib/globals';
import {Documents, Nodes, Files} from '/lib/collections';
import {LocalState} from './../../configs/context';

const remote = _require('electron').remote;
const fs = _require('fs');
const path = _require('path');
const async = _require('async');
const archiver = _require('archiver');
const tar = _require('tar-stream');

export default {

  deepCopyImport(docs, nodes, fileDocs, srcPath) {

    Meteor.call('import', docs, nodes, fileDocs, srcPath, (err) => {
      if (err) {
        Notifications.error('Feilmelding', err.message);
      } else {

        this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));

        Notifications.success(
          'Importering lyktes',
          'Rapportstrukturen ble importert i systemet og kan finnes på dashbordet.'
        );

        LocalState.set('WORKING', false);
      }
    });
  },

  deleteFolderRecursive(p) {
    var files = [];
    if (fs.existsSync(p)) {
      files = fs.readdirSync(p);
      files.forEach((file) => {
        var curPath = p + '/' + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  },

  copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on('error', (err) => {
      done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on('error', (err) => {
      done(err);
    });
    wr.on('close', () => {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cbCalled = true;
        return cb(err);
      }
    }
  },

  mkdirSync(p) {
    try {
      fs.mkdirSync(p);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
  },

  importDocument(isTemplate) {

    var extension = isTemplate ? 'gvt' : 'gvd';

    // show open dialog for GrandView files (.gvf)
    remote.require('dialog').showOpenDialog({
      title: 'Importer rapportstruktur',
      filters: [
        {
          name: isTemplate ? 'Grand View Template' : 'Grand View Document',
          extensions: [ extension ]
        }
      ],
      properties: [ 'openFile' ]
    }, (filePathAndName) => {
      if (filePathAndName) {
        LocalState.set('WORKING', true);
        LocalState.set('WORKING_TEXT', 'Importerer fil... vennligst vent...');

        var originalPath = filePathAndName[0];
        var newPath = path.join(Globals.basePath, 'tmp', 'import');

        // create a sandbox
        this.mkdirSync(Globals.basePath);
        this.mkdirSync(path.join(Globals.basePath, 'tmp'));
        this.mkdirSync(newPath);

        // copy over to sandbox
        this.copyFile(originalPath, newPath + '/import.' + extension, (err) => {
          if (err) {
            console.log(err);

            this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
            return;
          }

          fs.rename(newPath + '/import.' + extension, newPath + '/import.tar', (error) => {
            if (error) {
              console.log(error);
              this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
              return;
            }

            var extract = tar.extract();

            var tarball = newPath + '/import.tar';
            var dest = path.join(Globals.basePath, 'tmp', 'import');

            extract.on('entry', (header, stream, callback) => {

              var isDir = header.type === 'Directory';
              var fullpath = path.join(dest, header.path || header.name);
              var directory = isDir ? fullpath : path.dirname(fullpath);

              this.mkdirSync(directory);

              if (header.type === 'file') {
                stream.pipe(fs.createWriteStream(fullpath));

              } else {
                return callback();
              }

              stream.on('end', () => {
                callback(); // ready for next entry
              });

              stream.on('error', (e) => {
                callback(e);
              });
            })
            .on('error', (e) => {
              console.log(e);
              this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
            });


            fs.createReadStream(tarball).pipe(extract).on('finish', () => {
              Meteor.setTimeout(() => {
                var nodeImp = fs.readFileSync(dest + '/nodes.json', 'utf8');
                var docImp = fs.readFileSync(dest + '/docs.json', 'utf8');
                var fileImp = fs.readFileSync(dest + '/files.json', 'utf8');

                // import document to db
                var docs = (docImp === '') ? [] : JSON.parse(docImp);
                var nodes = (nodeImp === '') ? [] : JSON.parse(nodeImp);
                var fileDocs = (fileImp === '') ? [] : JSON.parse(fileImp);

                this.deepCopyImport(
                  docs,
                  nodes,
                  fileDocs,
                  path.join(Globals.basePath, 'tmp', 'import', 'files')
                );
              }, 1000);
            });
          });
        });
      }
    });
  },

  exportDocument(docIds, isTemplate) {

    var extension = isTemplate ? 'gvt' : 'gvd';

    LocalState.set('WORKING', true);
    LocalState.set('WORKING_TEXT', 'Pakker fil... vennligst vent...');

    // create all directories
    this.mkdirSync(Globals.basePath);
    this.mkdirSync(path.join(Globals.basePath, 'tmp'));
    this.mkdirSync(path.join(Globals.basePath, 'tmp', 'files'));

    // Gather document in one file, and nodes in another and put the them inside
    // the new folder

    // Subscribe to all files first
    // TODO: Convert to flowrouter?
    Meteor.subscribe('allByDocs', docIds, () => {

      const ids = docIds.isArray() ? docIds : [ docIds ];

      // Just in case the data is outdated in client
      var docs = Documents.find({
        _id: { $in: ids }
      }).fetch();

      var children = [];

      docs.forEach((doc) => {
        if (doc.children) {
          children = children.concat(doc.children);
        }
      });

      var nodes = Nodes.find({
        _id: {
          $in: children
        }
      }).fetch();


      // find all files linked to nodes and copy the files into the new folder
      var fileIds = _.filter(_.pluck(nodes, 'fileId'), (node) => {
        return node;
      });
      var files = Files.find({
        _id: {
          $in: fileIds || []
        }
      }).fetch();

      // write the data
      fs.writeFileSync(Globals.basePath + 'tmp/docs.json', JSON.stringify(docs, null, 4), 'utf8');
      fs.writeFileSync(Globals.basePath + 'tmp/nodes.json', JSON.stringify(nodes, null, 4), 'utf8');
      fs.writeFileSync(Globals.basePath + 'tmp/files.json', JSON.stringify(files, null, 4), 'utf8');


      async.forEach(files, (file, callback) => {

        var fileName = file && file.copies && file.copies.filesStore && file.copies.filesStore.key;

        var from = Globals.basePath + 'files/' + fileName;
        var to = Globals.basePath + 'tmp/files/' + fileName;

        this.copyFile(from, to, callback);

      }, (err) => {

        if (err) {
          console.log(err);
          this.deleteFolderRecursive(Globals.basePath + 'tmp');
          return;
        }

        // zip all contents inside this folder and retrieve the path of the zip file
        var output = fs.createWriteStream(Globals.basePath + 'output.tar');
        var archive = archiver('tar');

        // Set up a write stream
        output.on('close', () => {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');

          LocalState.set('WORKING', false);

          // rewrite to a GrandView file (.gvf)
          remote.require('dialog').showSaveDialog({
            title: 'Eksporter rapportstrukturen',
            filters: [
              {
                name: isTemplate ? 'Grand View Template' : 'Grand View Document',
                extensions: [ extension ]
              }
            ]
          }, (filePathAndName) => {
            if (filePathAndName) {
              fs.rename(Globals.basePath + 'output.tar', filePathAndName, (error) => {
                if (error) {
                  console.log(error);
                } else {
                  Notifications.success(
                    'Eksportering fullført',
                    'Filen ble lagret her: ' + filePathAndName
                  );
                }

                this.deleteFolderRecursive(Globals.basePath + 'tmp');
              });
            } else {
              this.deleteFolderRecursive(Globals.basePath + 'tmp');
            }
          });
        });

        archive.on('error', (error) => {
          this.deleteFolderRecursive(Globals.basePath + 'tmp');

          throw error;
        });

        archive.pipe(output);

        archive.bulk([
          {
            expand: true,
            cwd: Globals.basePath + 'tmp',
            src: [ '*.json' ]
          }, {
            expand: true,
            cwd: Globals.basePath + 'tmp/files',
            src: [ '**' ],
            dest: 'files'
          }
        ]);

        archive.finalize();

      });
    });
  }
};
