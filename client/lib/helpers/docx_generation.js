////////////////////////////////////////////////////////////////////////////////
// Office Word Document Generation
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

/* eslint camelcase: 0 */
/* eslint no-console: 0 */
/* globals _require */

import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import {TAPi18n} from 'meteor/tap:i18n';

import Globals from '/lib/globals';
import {Documents, Nodes, Files} from '/lib/collections';

const { shell, remote } = _require('electron');
const { dialog } = remote;
const imageSize = _require('fast-image-size');
const officegen = _require('officegen');
const path = _require('path');
const fs = _require('fs');

const header1Text = {
  color: '000088',
  font_face: 'Arial',
  font_size: 25
};

const header2Text = {
  color: '000088',
  font_face: 'Arial',
  font_size: 18
};

const header3Text = {
  color: '000000',
  font_face: 'Arial',
  font_size: 16
};

const descText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12
};

const keywordHeaderText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12,
  bold: true
};

const keywordText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12,
  italic: true
};

const openFile = (filePath, callback) => {
  shell.openItem(filePath);
  return callback();
};


const generationDocx = {
  renderMediaNode(node, par, compact = false) {
    const { _id, name, tags, references, description } = node;

    const files = Files.find({ 'meta.nodeId': _id }).fetch() || [];
    console.log(compact)
    if (compact === false && (name || (tags && tags.length) ||
      (references && references.length) || files.length || description)) {
      par.addLineBreak();
      par.addText('_______________________________________________________________');
    }

    if (name) {
      par.addLineBreak();
      par.addText(name || '', header3Text);
      par.addLineBreak();
    }

    if (compact === false && tags) {
      par.addText(TAPi18n.__('tags') + ':', keywordHeaderText);
      par.addText(' ' + tags.map(t => t.label).join(', '), keywordText);
      par.addLineBreak();
    }

    if (references) {
      par.addText(TAPi18n.__('references') + ':', keywordHeaderText);
      par.addText(' ' + references.map(r => r.label).join(', '), keywordText);
      par.addLineBreak();
    }

    if (files.length) {
      files.forEach((file) => {
        if (file && (file.isImage)) {
          const imgSize = imageSize(file.path);
          const cx = 580.0;
          const scale = cx / imgSize.width;
          par.addImage(file.path, {
            x: 'c',
            cx,
            cy: Math.floor(imgSize.height * scale)
          });
        } else if (file) {
          par.addText(TAPi18n.__('name') + ': ', keywordHeaderText);
          par.addText(file.meta && file.meta.name || file.name, keywordText);
          par.addLineBreak();

          par.addText(TAPi18n.__('file_path') + ': ', keywordHeaderText);
          par.addText('\"' + file.path +
            '\"', keywordText);
        }

        par.addLineBreak();
        par.addLineBreak();
      });
    } else if (name || tags || references) {
      par.addLineBreak();
    }

    const paragraphs = description ? description.split('\n') : [];

    paragraphs.forEach((paragraph) => {
      if (paragraph.length) {
        par.addText(paragraph, descText);
        par.addLineBreak();
        par.addLineBreak();
      }
    });
  },

  renderChapterNode(node, docx, posLabel, compact = false) {
    const par = docx.createP();
    const { _id, name, nodeType, position } = node;
    let numbering;

    if (posLabel) {
      numbering = posLabel + '.' + position;
    } else {
      numbering = position;
    }

    par.addText(numbering + ' ' + (name || TAPi18n.__('no_chapter_title')), header2Text);

    const nodes = Nodes.find({
      parent: _id
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    nodes.forEach((elNode) => {
      const { nodeType: type } = elNode;
      if (type === 'chapter') {
        this.renderChapterNode(elNode, docx, numbering, compact);
      } else {
        this.renderMediaNode(elNode, par, compact);
      }
    });
  },

  renderListFormat(doc, docx, format) {
    const undefinedPropertyLabel = 'kkkjasdjnajkcziow782392ujinydsdfs';

    const nodes = Nodes.find({
      mainDocId: doc._id,
      nodeType: 'media'
    }).fetch();

    const tagsList = {};

    nodes.forEach((node) => {
      const elements = node[format] || [];

      if (elements.length > 0) {
        elements.map(e => e.value).forEach((element) => {
          if (!_.isArray(tagsList[element])) {
            tagsList[element] = [];
          }

          tagsList[element].push(node);
        });
      } else {
        if (!_.isArray(tagsList[undefinedPropertyLabel])) {
          tagsList[undefinedPropertyLabel] = [];
        }
        tagsList[undefinedPropertyLabel].push(node);
      }
    });

    if (tagsList) {
      Object.keys(tagsList)
        .sort((a, b) => {
          const lccomp = a.toLowerCase().localeCompare(b.toLowerCase(), 'nb');
          return lccomp ? lccomp : a > b ? 1 : a < b ? -1 : 0;
        })
        .forEach((tag) => {
          if (tagsList.hasOwnProperty(tag) && (tag !== undefinedPropertyLabel)) {
            const ns = tagsList[tag];
            const par = docx.createP();

            par.addText(tag, header2Text);

            ns.forEach((n) => {
              this.renderMediaNode(n, par);
            });
          }
        });

      // Add the others without tags
      const notDefined = tagsList[undefinedPropertyLabel];

      if (notDefined && notDefined.length) {
        const notDefinedPar = docx.createP();

        const undefinedLabel = (format === 'tags') ?
          TAPi18n.__('without_tags') : TAPi18n.__('without_references');

        notDefinedPar.addText(undefinedLabel, header2Text);

        notDefined.forEach((n) => {
          this.renderMediaNode(n, notDefinedPar);
        });
      }
    }
  },

  renderDocument(doc, docx, mainPar, format, compact) {

    if (format === 'chapters') {
      const nodes = Nodes.find({
        parent: doc._id
      }, {
        sort: {
          position: 1
        }
      }).fetch();

      nodes.forEach((node) => {
        const {nodeType} = node;
        if (nodeType === 'chapter') {
          this.renderChapterNode(node, docx, 0, compact);
        } else {
          this.renderMediaNode(node, mainPar, 0, compact);
        }
      });
    } else {
      this.renderListFormat(doc, docx, format);
    }
  },

  generateDOCX(_id, format, compact, cb) {

    const fileName = _id + '_' + format + '.docx';

    const docx = officegen('docx');
    const doc = Documents.findOne({_id});
    const {title, description} = doc;

    docx.setDocTitle(title || TAPi18n.__('no_title'));
    docx.setDescription(description || '');

    // create main paragraph
    const mainParagraph = docx.createP();

    mainParagraph.addText(title || TAPi18n.__('no_title'), header1Text);

    if (description) {
      const paragraphs = description ? description.split('\n') : [];

      paragraphs.forEach((paragraph) => {
        if (paragraph.length) {
          docx.createP().addText(paragraph, descText);
        }
      });
    }

    Meteor.subscribe('files.byDocument', _id, () => {
      this.renderDocument(doc, docx, mainParagraph, format, compact);

      // rewrite to a GrandView file (.gvf)
      dialog.showSaveDialog({
        title: 'Lagre utskriftsdokument',
        filters: [
          {
            name: 'Microsoft Office (.docx)',
            extensions: [ 'docx' ]
          }
        ]
      }, (filePath) => {
        if (filePath) {
          console.log(filePath);
          const out = fs.createWriteStream(filePath);

          docx.generate(out, {
            finalize(written) {
              console.log('Finnished to write docx-file.\nBytes written: ' + written + '\n');

              openFile(filePath, (error) => {
                if (error) {
                  console.log(error);
                  return cb(true);
                }

                return cb(null);
              });
            },
            error(err) {
              console.log(err);
              return cb(true);
            }
          });
        }
      });


    });
  }
};

export default generationDocx;
