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

"use strict";

var path = require('path');
var officegen = require('officegen');
var fs = require('fs');

var header1Text = {
  color: '000088',
  font_face: 'Arial',
  font_size: 25
};
var header2Text = {
  color: '000088',
  font_face: 'Arial',
  font_size: 18
};
var header3Text = {
  color: '000000',
  font_face: 'Arial',
  font_size: 16
};
var descText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12
};
var keywordHeaderText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12,
  bold: true
};
var keywordText = {
  color: '000000',
  font_face: 'Arial',
  font_size: 12,
  italic: true
};

var renderMediaNode = function(node, par, posLabel) {

  if (node.title || (node.tags && node.tags.length) ||
    (node.references && node.references.length) || node.fileId || node.description) {
    par.addLineBreak();
    par.addText("_______________________________________________________________");
    par.addLineBreak();
  }

  if (node.title) {
    par.addText(node.title || "", header3Text);
    par.addLineBreak();
  }

  if (node.tags) {
    par.addText("Nøkkelord:", keywordHeaderText);
    par.addText(" " + node.tags.join(", "), keywordText);
    par.addLineBreak();
  }

  if (node.references) {
    par.addText("Kilder:", keywordHeaderText);
    par.addText(" " + node.references.join(", "), keywordText);
    par.addLineBreak();
  }

  if (node.fileId) {
    var file = GV.collections.Files.findOne({
      _id: node.fileId
    });
    console.log(node.fileId);
    console.log(file);
    if (file && (file.copies.filesStore.type.split("/")[0] === "image")) {
      par.addImage(GV.basePath + "files/" + file.copies.filesStore.key);
    } else if (file) {
      par.addText("Filbane:", keywordHeaderText);
      par.addText(" \"" + GV.basePath +
        "files/" + file.copies.filesStore.key +
        "\"", keywordText);
    }

    par.addLineBreak();
    par.addLineBreak();
  } else {
    if (node.title || node.tags || node.references)
      par.addLineBreak();
  }

  var paragraphs = node.description ? node.description.split("\n") : [];

  paragraphs.forEach(function(paragraph) {
    if (paragraph.length) {
      par.addText(paragraph, descText);
      par.addLineBreak();
      par.addLineBreak();
    }
  });
};

var renderChapterNode = function(node, docx, posLabel) {
  var par = docx.createP();

  if (posLabel) {
    posLabel = posLabel + "." + (node.position + 1);
    par.addText(posLabel + " " + (node.title || "Ukjent kapitteltittel"), header2Text);
  } else {
    posLabel = node.position + 1;
    par.addText(posLabel + " " + (node.title || "Ukjent kapitteltittel"), header2Text);
  }

  var nodes = GV.collections.Nodes.find({
    parent: node._id
  }, {
    sort: {
      position: 1
    }
  }).fetch();

  nodes.forEach(function(node) {
    if (node.nodeType === "chapter") {
      renderChapterNode(node, docx, posLabel);
    } else {
      renderMediaNode(node, par, posLabel);
    }
  });
};

var renderListFormat = function(doc, docx, format) {
  var undefinedPropertyLabel = 'kkkjasdjnajkcziow782392ujinydsdfs';

  var nodes = GV.collections.Nodes.find({
    _id: {
      $in: doc.children || []
    },
    nodeType: 'media'
  }).fetch();

  var tagsList = {};

  nodes.forEach(function(node) {
    var elements = node[format] || [];

    if(elements.length > 0) {
      elements.forEach(function(element) {
        if(!_.isArray(tagsList[element])) {
          tagsList[element] = [];
        }

        tagsList[element].push(node);
      });
    } else {
      if(!_.isArray(tagsList[undefinedPropertyLabel])) {
        tagsList[undefinedPropertyLabel] = [];
      }
      tagsList[undefinedPropertyLabel].push(node);
    }
  });

  if(tagsList) {
    Object.keys(tagsList)
          .sort(function(a,b){
            var lccomp = a.toLowerCase().localeCompare(b.toLowerCase(), 'nb');
            return lccomp ? lccomp : a > b ? 1 : a < b ? -1 : 0;
          })
          .forEach(function(tag, i) {
            if (tagsList.hasOwnProperty(tag) && (tag !== undefinedPropertyLabel)) {
              var ns = tagsList[tag];
              var par = docx.createP();

              par.addText(tag, header2Text);

              ns.forEach(function(n) {
                renderMediaNode(n, par);
              });
            }
          });

    // Add the others without tags
    var notDefined = tagsList[undefinedPropertyLabel];

    if(notDefined && notDefined.length) {
      var notDefinedPar = docx.createP();

      var undefinedLabel = (format === 'tags') ? 'Uten nøkkelord' : 'Uten referanser';

      notDefinedPar.addText(undefinedLabel, header2Text);

      notDefined.forEach(function(n) {
        renderMediaNode(n, notDefinedPar);
      });
    }
  }
};

var renderDocument = function(doc, docx, mainPar, format) {

  if (format === 'chapters') {
    var nodes = GV.collections.Nodes.find({
      parent: doc._id
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    nodes.forEach(function(node) {
      if (node.nodeType === "chapter") {
        renderChapterNode(node, docx, 0);
      } else {
        renderMediaNode(node, mainPar, 0);
      }
    });
  } else {
    renderListFormat(doc, docx, format);
  }
};

GV.helpers = _.extend(GV.helpers, {

  generateDOCX: function(docId, format, cb) {

    var fileName = docId + '_' + format + ".docx";

    var docx = officegen('docx');
    var doc = GV.collections.Documents.findOne({
      _id: docId
    });

    docx.setDocTitle(doc.title || "Ingen tittel");
    docx.setDescription(doc.description || "");

    // create main paragraph
    var mainParagraph = docx.createP();

    mainParagraph.addText(doc.title || "Ingen tittel", header1Text);

    Router.current().subscribe("filesByDocument", docId, function() {

      renderDocument(doc, docx, mainParagraph, format);

      var out = fs.createWriteStream(GV.basePath + fileName);

      docx.generate(out, {
        'finalize': function(written) {
          console.log('Ferdig å skrive Word-fil.\nBytes skrevet: ' + written + '\n');

          var filePath = path.join(GV.basePath, fileName);

          GV.helpers.openFile(filePath, function(error, result) {
            if (error) {
              console.log(error);
              cb(true);
            } else {
              cb(null);
            }
          });
        },
        'error': function(err) {
          console.log(err);
          cb(true);
        }
      });
    });
  }

});
