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

const os = _require('os');
const cp = _require('child_process');

const platform = os.platform();
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
  let openCMD;

  if (platform === 'win32') {
    openCMD = '"' + filePath + '"';
  } else if (platform === 'darwin') {
    openCMD = 'open ' + filePath;
  } else {
    openCMD = 'xdg-open ' + filePath;
  }

  cp.exec(openCMD, callback);
};


const generationDocx = {
  renderMediaNode(node, par) {
    const {title, tags, references, fileId, description} = node;

    if (title || (tags && tags.length) ||
      (references && references.length) || fileId || description) {
      par.addLineBreak();
      par.addText('_______________________________________________________________');
      par.addLineBreak();
    }

    if (title) {
      par.addText(title || '', header3Text);
      par.addLineBreak();
    }

    if (tags) {
      par.addText(TAPi18n.__('tags') + ':', keywordHeaderText);
      par.addText(' ' + tags.join(', '), keywordText);
      par.addLineBreak();
    }

    if (references) {
      par.addText(TAPi18n.__('references') + ':', keywordHeaderText);
      par.addText(' ' + references.join(', '), keywordText);
      par.addLineBreak();
    }

    if (fileId) {
      const file = Files.findOne({
        _id: fileId
      });

      if (file && (file.copies.filesStore.type.split('/')[0] === 'image')) {
        par.addImage(Globals.basePath + 'files/' + file.copies.filesStore.key);
      } else if (file) {
        par.addText(TAPi18n.__('file_path') + ':', keywordHeaderText);
        par.addText(' \"' + Globals.basePath +
          'files/' + file.copies.filesStore.key +
          '\"', keywordText);
      }

      par.addLineBreak();
      par.addLineBreak();
    } else if (title || tags || references) {
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

  renderChapterNode(node, docx, posLabel) {
    const par = docx.createP();
    const {_id, title, nodeType, position} = node;
    let numbering;

    if (posLabel) {
      numbering = posLabel + '.' + (position + 1);
    } else {
      numbering = position;
    }
    console.log(node)
    par.addText(numbering + ' ' + (title || TAPi18n.__('no_chapter_title')), header2Text);

    const nodes = Nodes.find({
      parent: _id
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    nodes.forEach((elNode) => {
      if (nodeType === 'chapter') {
        this.renderChapterNode(elNode, docx, posLabel);
      } else {
        this.renderMediaNode(elNode, par, posLabel);
      }
    });
  },

  renderListFormat(doc, docx, format) {
    const undefinedPropertyLabel = 'kkkjasdjnajkcziow782392ujinydsdfs';

    const nodes = Nodes.find({
      _id: {
        $in: doc.children || []
      },
      nodeType: 'media'
    }).fetch();

    const tagsList = {};
    console.log(format)
    nodes.forEach((node) => {
      const elements = node[format] || [];

      if (elements.length > 0) {
        elements.forEach((element) => {
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

  renderDocument(doc, docx, mainPar, format) {

    if (format === 'chapters') {
      const nodes = Nodes.find({
        parent: doc._id
      }, {
        sort: {
          position: 1
        }
      }).fetch();

      console.log(nodes)

      nodes.forEach((node) => {
        const {nodeType} = node;
        if (nodeType === 'chapter') {
          this.renderChapterNode(node, docx, 0);
        } else {
          this.renderMediaNode(node, mainPar, 0);
        }
      });
    } else {
      this.renderListFormat(doc, docx, format);
    }
  },

  generateDOCX(_id, format, cb) {

    const fileName = _id + '_' + format + '.docx';

    const docx = officegen('docx');
    const doc = Documents.findOne({_id});
    const {title, description} = doc;

    docx.setDocTitle(title || TAPi18n.__('no_title'));
    docx.setDescription(description || '');

    // create main paragraph
    const mainParagraph = docx.createP();

    mainParagraph.addText(title || TAPi18n.__('no_title'), header1Text);

    Meteor.subscribe('files.byDocument', _id, () => {
      this.renderDocument(doc, docx, mainParagraph, format);

      const out = fs.createWriteStream(Globals.basePath + fileName);

      docx.generate(out, {
        finalize(written) {
          console.log('Finnished to write docx-file.\nBytes written: ' + written + '\n');

          const filePath = path.join(Globals.basePath, fileName);

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
    });
  }
};

export default generationDocx;
