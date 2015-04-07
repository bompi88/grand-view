DocumentsScheme = new SimpleSchema({

  // A document title
  title: {
    type: String,
    label: function() {
      return "Tittel";
    },
    optional: false,
    min: 3,
    max: 100,
    autoform: {
      placeholder: "schemaLabel"
    }
  },

  // A description that describe the content
  summary: {
    type: String,
    label: function() {
      return "Sammendrag";
    },
    optional: true,
    max: 500,
    autoform: {
      placeholder: "schemaLabel"
    }
  },

  // Tags that adds a dimension to the description and title fields
  tags: {
    type: [String],
    label: function() {
      return "Emneknagger";
    },
    optional: true,
    autoform: {
      type: "selectize",
      placeholder: "schemaLabel",
      afFieldInput: {
        multiple: true,
        selectizeOptions: {
          delimiter: ',',
          persist: false,

          // Can create new tags
          create: function(input) {

            Tags.insert({ value: input, text: input });

            return {
              value: input,
              text: input
            }
          },

          // How the tags suggestions are rendered
          render: {
            option: function(item, escape) {
              return '<div>' +
                '<span class="title">' +
                '<span class="name">' + item.text + '</span>' +
                '</span>' +
                '</div>';
            }
          },

          // How to load new tags
          load: function(query, callback) {
            if (!query.length) return callback();

            if (subscriptions['tags'])
              subscriptions['tags'].stop();

            subscriptions['tags'] = Meteor.subscribe('tagsByQuery', { text: { $regex: query, $options: 'i' } });
            var tags = Tags.find({ text: { $regex: query, $options: 'i' } }).fetch();

            callback(tags);
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
        return new Date;
      }
      else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      }
      else {
        this.unset();
      }
    }
  },

  // The document was updated on this date
  lastChanged: {
    type: Date,
    optional: false
  },

  // The document was shared by this user
  userId: {
    type: String,
    optional: false
  },

  // Is the whole document collapsed?
  collapsed: {
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
DocumentsScheme.messages({
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
Documents.attachSchema(DocumentsScheme);
