////////////////////////////////////////////////////////////////////////////////
// Document Schema
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

'use strict';

GV.schemas.Documents = new SimpleSchema({

  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id
  },

  // A document title
  title: {
    type: String,
    label: function() {
      if(GV.helpers.isTemplate()) {
        return 'Navn på mal';
      } else {
        return 'Dokumenttittel';
      }
    },
    optional: false,
    max: 100,
    autoform: {
      placeholder: 'schemaLabel'
    }
  },

  // A description that describe the content
  summary: {
    type: String,
    label: function() {
      if(GV.helpers.isTemplate()) {
        return 'Beskrivelse av mal';
      } else {
        return 'Prosjektbeskrivelse';
      }
    },
    optional: true,
    autoform: {
      rows: 6,
      placeholder: function() {
        if(GV.helpers.isTemplate()) {
          return 'Skriv inn en kortfattet beskrivelse av malen';
        } else {
          return 'Skriv inn en kortfattet beskrivelse av prosjektet';
        }
      }
    }
  },

  // Tags that adds a dimension to the description and title fields
  templateBasis: {
    type: String,
    label: function() {
      return 'Dokumentmal';
    },
    optional: true,
    autoform: {
      type: 'select',
      options: function() {
        if (Meteor.isClient) {
          return GV.collections.Documents.find({
            template: true
          }).map(function(c) {
            return {
              label: c.title,
              value: c._id
            };
          });
        }
      }
    }
  },

  // The document was created on this date
  createdOn: {
    type: Date,
    optional: false,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    }
  },

  isRoot: {
    type: Boolean,
    optional: false,
    autoValue: function() {
      if (this.isInsert) {
        return true;
      } else if (this.isUpsert) {
        return true;
      } else {
        this.unset();
      }
    }
  },

  // The document was updated on this date
  lastChanged: {
    type: Date,
    optional: false
  },

  // All file ids in the document
  fileIds: {
    type: [String],
    optional: true
  },

  // Is the whole document collapsed?
  collapsed: {
    type: Boolean,
    optional: true
  },

  // Is the whole document collapsed?
  template: {
    type: Boolean,
    optional: true
  },

  // Is the whole document collapsed?
  children: {
    type: [String],
    optional: true
  }

});


// TODO: update these schema messages to represent the actual schema
GV.schemas.Documents.messages({
  // 'required email': 'Epost må fylles inn',
  // 'required message': 'Melding må vedlegges',
  // 'required title': 'Emnefeltet må fylles inn',
  // 'maxString name': 'Navnet må ikke overskride [max] tegn',
  // 'minString title': 'Emnefeltet må inneholde minimum [min] tegn',
  // 'minString message': 'Meldingen må inneholde minimum [min] tegn',
  // maxString: '[label] må ikke overskride [max] tegn',
  // expectedString: '[label] må inneholde en streng',
  // 'regEx email': 'Dette er ikke en gyldig epost'
});

// Attach the schema to the collection
GV.collections.Documents.attachSchema(GV.schemas.Documents);
