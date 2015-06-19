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
      return "Dokumenttittel";
    },
    optional: false,
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
    autoform: {
      placeholder: "schemaLabel"
    }
  },

  // Tags that adds a dimension to the description and title fields
  templateBasis: {
    type: String,
    label: function() {
      return "Dokumentmal";
    },
    optional: true,
    autoform: {
        type: "select",
        options: function () {
            if (Meteor.isClient) {
               return GV.collections.Documents.find({template: true}).map(function (c) {
                   return {label: c.title, value: c._id};
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

  isRoot: {
    type: Boolean,
    optional: false,
    autoValue: function() {
      if (this.isInsert) {
        return true;
      } else if (this.isUpsert) {
        return true;
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
GV.collections.Documents.attachSchema(GV.schemas.Documents);
