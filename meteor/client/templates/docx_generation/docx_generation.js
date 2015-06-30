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

var officegen = require('officegen');
var cp = require("child_process");
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

    if (file && (file.copies.filesStore.type.split("/")[0] === "image")) {
      par.addImage(process.env.HOME + "/GrandView/files/" + file.copies.filesStore.key);
    } else if (file) {
      par.addText("Filbane:", keywordHeaderText);
      par.addText(" \"" + process.env.HOME +
        "/GrandView/files/" + file.copies.filesStore.key +
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

var renderDocument = function(doc, docx, mainPar) {

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
};

GV.helpers = _.extend(GV.helpers, {

  generateDOCX: function(docId) {

    var basePath = process.env.HOME + "/GrandView";
    var fileName = docId + ".docx";

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

      renderDocument(doc, docx, mainParagraph);

      var out = fs.createWriteStream(basePath + "/" + fileName);

      docx.generate(out, {
        'finalize': function(written) {
          console.log('Ferdig å skrive Word-fil.\nBytes skrevet: ' + written + '\n');

          cp.exec("open " + basePath + "/" + fileName, function(error, result) {
            if (error)
              console.log(error);
          });
        },
        'error': function(err) {
          console.log(err);
        }
      });
    });
  }

});
