////////////////////////////////////////////////////////////////////////////////
// Node Schema
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

GV.schemas.Nodes = new SimpleSchema({

  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id
  },

  // A document title
  title: {
    type: String,
    label: function() {
      return "Navn på informasjonselement";
    },
    optional: true,
    max: 100,
    autoform: {
      placeholder: "schemaLabel"
    }
  },

  // A description that describe the content
  description: {
    type: String,
    label: function() {
      return "Informasjonselement";
    },
    optional: true,
    autoform: {
      placeholder: "schemaLabel"
    }
  },

  // Tags that adds a dimension to the description and title fields
  tags: {
    type: [String],
    label: function() {
      return "Nøkkelord";
    },
    optional: true,
    autoform: {
      placeholder: "schemaLabel",
      type: "selectize",
      afFieldInput: {
        maxCount: 20,
        multiple: true,
        selectizeOptions: {
          delimiter: ',',
          preload: true,
          plugins: ['remove_button'],
          dropdownParent: 'body',
          sortField: 'value',

          // Can create new tags
          create: function(input) {

            if (input && (input.length > 100)) {
              Notifications.error(
                "Feil ved innsetting av nøkkelord",
                "Nøkkelordet er for langt, og derfor over 80 tegn."
              );

              return false;
            }

            GV.collections.Tags.insert({
              value: input.toLowerCase(),
              text: input
            });

            return {
              value: input.toLowerCase(),
              text: input
            };
          },

          // How the tags suggestions are rendered
          render: {
            option: function(item, escape) {
              return '<div>' +
                '<span class="title">' +
                '<span class="name">' + item.text + '</span>' +
                '</span>' +
                //'<button type="button" id="btn-editDoc" class="btn btn-success btn-sm pull-right">Slett</button>'
                '</div>';
            },
            option_create: function(data, escape) {
              return '<div class="create">Legg til <strong>' + escape(data.input) +
                '</strong>&hellip;</div>';
            }
          },

          // How to load new tags
          load: function(query, callback) {

            var tags;

            if (!query.length) {
              Router.current()
                .subscribe('tags');
              tags = GV.collections.Tags.find({})
                .fetch();
            } else {
              Router.current()
                .subscribe('tagsByQuery', {
                  text: {
                    $regex: query,
                    $options: 'i'
                  }
                });
              tags = GV.collections.Tags.find({
                  text: {
                    $regex: query,
                    $options: 'i'
                  }
                })
                .fetch();
            }

            callback(tags);
          }
        }
      }
    }
  },

  // Tags that adds a dimension to the description and title fields
  references: {
    type: [String],
    label: function() {
      return "Kilder";
    },
    optional: true,
    autoform: {
      placeholder: "schemaLabel",
      type: "selectize",
      afFieldInput: {
        maxCount: 20,
        multiple: true,
        selectizeOptions: {
          delimiter: ',',
          preload: true,
          plugins: ['remove_button'],
          dropdownParent: 'body',
          sortField: 'value',

          // Can create new tags
          create: function(input) {

            if (input && (input.length > 150)) {
              Notifications.error(
                "Feil ved innsetting av kilde",
                "Kilden er for lang, og det vil si at den er over 150 tegn."
              );

              return false;
            }

            GV.collections.References.insert({
              value: input.toLowerCase(),
              text: input
            });

            return {
              value: input.toLowerCase(),
              text: input
            };
          },

          // How the tags suggestions are rendered
          render: {
            option: function(item, escape) {
              return '<div>' +
                '<span class="title">' +
                '<span class="name">' + item.text + '</span>' +
                '</span>' +
                '</div>';
            },
            option_create: function(data, escape) {
              return '<div class="create">Legg til <strong>' + escape(data.input) +
                '</strong>&hellip;</div>';
            }
          },

          // How to load new tags
          load: function(query, callback) {

            var references;

            if (!query.length) {
              Router.current()
                .subscribe('references');
              references = GV.collections.References.find({})
                .fetch();
            } else {
              Router.current()
                .subscribe('referencesByQuery', {
                  text: {
                    $regex: query,
                    $options: 'i'
                  }
                });
              references = GV.collections.References.find({
                  text: {
                    $regex: query,
                    $options: 'i'
                  }
                })
                .fetch();
            }

            callback(references);
          }
        }
      }
    }
  },

  status: {
    type: String,
    optional: true,
    autoform: {
      placeholder: "schemaLabel"
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

  // The document was updated on this date
  lastChanged: {
    type: Date,
    optional: false
  },

  // The parent node id
  parent: {
    type: String,
    optional: false
  },

  // Which depth level the node is at
  level: {
    type: Number,
    optional: false
  },

  // Which depth level the node is at
  position: {
    type: Number,
    optional: true
  },

  // Which depth level the node is at
  sectionLabel: {
    type: String,
    optional: true
  },

  // Kind of node
  nodeType: {
    type: String,
    optional: true
  },

  // Is this node collapsed?
  collapsed: {
    type: Boolean,
    optional: true
  },

  fileId: {
    type: String,
    optional: true
  }

});

// TODO: update these schema messages to represent the actual schema
GV.schemas.Nodes.messages({
  // "required email": "Epost må fylles inn",
  // "required message": "Melding må vedlegges",
  // "required title": "Emnefeltet må fylles inn",
  // "maxString name": "Navnet må ikke overskride [max] tegn",
  // "minString title": "Emnefeltet må inneholde minimum [min] tegn",
  // "minString message": "Meldingen må inneholde minimum [min] tegn",
  // maxString: "[label] må ikke overskride [max] tegn",
  // expectedString: "[label] må inneholde en streng",
  // "regEx email": "Dette er ikke en gyldig epost"
});

// Attach the schema to the collection
GV.collections.Nodes.attachSchema(GV.schemas.Nodes);
