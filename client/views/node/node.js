Template.Node.rendered = function () {

   var typeaheadAdapter = new Bloodhound({
      local: Tags.find().map(function(tag) { return {value: tag.name}; }),
      datumTokenizer: function(d) {
       return Bloodhound.tokenizers.whitespace(d.name); 
     },
     queryTokenizer: Bloodhound.tokenizers.whitespace    
   });

   typeaheadAdapter.initialize();

   $(this.find('#referenceKeywords')).tokenfield({
      typeahead: {
         source: typeaheadAdapter.ttAdapter()
      }
   });
};