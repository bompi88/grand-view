//--------------------------------------------------------------------------------------------------
// Import and export helpers
//--------------------------------------------------------------------------------------------------

/* eslint no-console: 0 */

import Globals from '/lib/globals';

const { remote } = _require('electron');
const { dialog } = remote;
const fs = _require('fs-extra');
const path = _require('path');
const async = _require('async');
const archiver = _require('archiver');
const tar = _require('tar-stream');

export default {

  deepCopyImport({ Meteor, NotificationManager, LocalState }, docs, nodes, fileDocs, srcPath) {
    Meteor.call('importResources', docs, nodes, fileDocs, srcPath, (err) => {
      if (err) {
        NotificationManager.error(err.message, 'Feilmelding');
      } else {
        this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));

        NotificationManager.success(
          'Rapportstrukturen ble importert i systemet og kan finnes i "Mine dokumenter".',
          'Importering lyktes',
        );

        LocalState.set('WORKING', false);
      }
    });
  },

  deleteFolderRecursive(p) {
    let files = [];
    if (fs.existsSync(p)) {
      files = fs.readdirSync(p);
      files.forEach((file) => {
        const curPath = `${p}/${file}`;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(p);
    }
  },

  copyFile(source, target, cb) {
    let cbCalled = false;

    function done(err) {
      if (!cbCalled) {
        cbCalled = true;
        return cb(err);
      }
      return false;
    }

    const rd = fs.createReadStream(source);
    rd.on('error', (err) => {
      done(err);
    });
    const wr = fs.createWriteStream(target);
    wr.on('error', (err) => {
      done(err);
    });
    wr.on('close', () => {
      done();
    });
    rd.pipe(wr);
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

  importDocuments({ Meteor, NotificationManager, LocalState }, isTemplate) {
    const extension = isTemplate ? 'gvt' : 'gvd';

    // show open dialog for GrandView files (.gvt  or .gvd)
    dialog.showOpenDialog({
      title: 'Importer rapportstruktur',
      filters: [
        {
          name: isTemplate ? 'Grand View Template' : 'Grand View Document',
          extensions: [extension],
        },
      ],
      properties: ['openFile'],
    }, (filePathAndName) => {
      if (filePathAndName) {
        LocalState.set('WORKING', true);
        LocalState.set('WORKING_TEXT', 'Importerer fil... vennligst vent...');

        const originalPath = filePathAndName[0];
        const newPath = path.join(Globals.basePath, 'tmp', 'import');

        // create a sandbox
        this.mkdirSync(Globals.basePath);
        this.mkdirSync(path.join(Globals.basePath, 'tmp'));
        this.mkdirSync(newPath);

        // copy over to sandbox
        this.copyFile(originalPath, path.join(newPath, `import.${extension}`), (err) => {
          if (err) {
            console.log(err);

            this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
            return;
          }

          fs.rename(`${newPath}/import.${extension}`, `${newPath}/import.tar`, (error) => {
            if (error) {
              console.log(error);
              this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
              return;
            }

            const extract = tar.extract();

            const tarball = path.join(newPath, 'import.tar');
            const dest = path.join(Globals.basePath, 'tmp', 'import');

            extract.on('entry', (header, stream, callback) => {
              const isDir = header.type === 'Directory';
              const fullpath = path.join(dest, header.path || header.name);
              const directory = isDir ? fullpath : path.dirname(fullpath);

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
                const nodeImp = fs.readFileSync(`${dest}/nodes.json`, 'utf8');
                const docImp = fs.readFileSync(`${dest}/docs.json`, 'utf8');
                const fileImp = fs.readFileSync(`${dest}/files.json`, 'utf8');

                // import document to db
                const docs = (docImp === '') ? [] : JSON.parse(docImp);
                const nodes = (nodeImp === '') ? [] : JSON.parse(nodeImp);
                const fileDocs = (fileImp === '') ? [] : JSON.parse(fileImp);

                this.deepCopyImport(
                  { Meteor, NotificationManager, LocalState },
                  docs,
                  nodes,
                  fileDocs,
                  path.join(Globals.basePath, 'tmp', 'import', 'files'),
                );
              }, 1000);
            });
          });
        });
      }
    });
  },

  exportDocument({ Meteor, LocalState, Collections, _, NotificationManager }, docIds, isTemplate) {
    const extension = isTemplate ? 'gvt' : 'gvd';

    LocalState.set('WORKING', true);
    LocalState.set('WORKING_TEXT', 'Pakker fil... vennligst vent...');

    // create all directories
    this.mkdirSync(Globals.basePath);
    this.mkdirSync(path.join(Globals.basePath, 'tmp'));
    this.mkdirSync(path.join(Globals.basePath, 'tmp', 'files'));

    // Gather document in one file, and nodes in another and put the them inside
    // the new folder
    const ids = _.isArray(docIds) ? docIds : [docIds];

    // Subscribe to all files first
    // TODO: Convert to flowrouter?
    Meteor.subscribe('documents.allByDocs', ids, () => {
      // Just in case the data is outdated in client
      const docs = Collections.Documents.find({
        _id: { $in: ids },
      }).fetch();

      const nodes = Collections.Nodes.find({
        mainDocId: {
          $in: ids,
        },
      }).fetch();

      const files = Collections.Files.find({
        'meta.docId': {
          $in: ids,
        },
      }).fetch();

      // write the data
      fs.writeFileSync(path.join(Globals.basePath, 'tmp', 'docs.json'), JSON.stringify(docs, null, 4), 'utf8');
      fs.writeFileSync(path.join(Globals.basePath, 'tmp', 'nodes.json'), JSON.stringify(nodes, null, 4), 'utf8');
      fs.writeFileSync(path.join(Globals.basePath, 'tmp', 'files.json'), JSON.stringify(files, null, 4), 'utf8');


      async.forEach(files, (file, callback) => {
        const from = file.path;
        const to = path.join(Globals.basePath, 'tmp', 'files', file._id);

        this.copyFile(from, to, callback);
      }, (err) => {
        if (err) {
          console.log(err);
          this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
          return;
        }

        // zip all contents inside this folder and retrieve the path of the zip file
        const output = fs.createWriteStream(path.join(Globals.basePath, 'output.tar'));
        const archive = archiver('tar');

        // Set up a write stream
        output.on('close', () => {
          console.log(`${archive.pointer()} total bytes`);
          console.log('archiver has been finalized and the output file descriptor has closed.');

          LocalState.set('WORKING', false);

          // rewrite to a GrandView file (.gvf)
          dialog.showSaveDialog({
            title: 'Eksporter rapportstrukturen',
            filters: [
              {
                name: isTemplate ? 'Grand View Template' : 'Grand View Document',
                extensions: [extension],
              },
            ],
          }, (filePathAndName) => {
            if (filePathAndName) {
              fs.copy(path.join(Globals.basePath, 'output.tar'), filePathAndName, { overwrite: true }, (error) => {
                if (error) {
                  console.log(error);
                } else {
                  NotificationManager.success(
                    `Filen ble lagret her: ${filePathAndName}`,
                    'Eksportering fullført',
                  );
                }
                this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
              });
            } else {
              this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));
            }
          });
        });

        archive.on('error', (error) => {
          this.deleteFolderRecursive(path.join(Globals.basePath, 'tmp'));

          throw error;
        });

        archive.pipe(output);

        archive.glob('**/*', {
          cwd: path.join(Globals.basePath, 'tmp'),
        });

        archive.finalize();
      });
    });
  },
};
