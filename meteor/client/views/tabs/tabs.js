////////////////////////////////////////////////////////////////////////////////
// Tree template logic
////////////////////////////////////////////////////////////////////////////////


var scrollBarWidths = 40;


// -- The tabs resize and controller methods -----------------------------------

/**
 * Return the width of all tabs combined
 */
var widthOfList = function() {
  var itemsWidth = 0;

  $('.list li').each(function() {
    var it = $(this).outerWidth();
    itemsWidth = itemsWidth + it;
  });

  return itemsWidth;
};

/**
 * Returns the width of hidden area
 */
var widthOfHidden = function() {
  return (($('.tab-wrapper').outerWidth(true)) - widthOfList() - getLeftPosi()) - scrollBarWidths || 0;
};

/**
 * Get the left most position
 */
var getLeftPosi = function() {
  return $('.list') && $('.list').position() && $('.list').position().left;
};

/**
 * Readjusts the tab view and renders the scroll indicators
 */
reAdjust = function() {

  // if tabs view overflows the container, render a scroll button on the right
  if (($('.tab-wrapper').outerWidth(true)) <= widthOfList()) {
    $('.scroller-right').show();

  // else hide it and readjust the view
  } else {
    $('.scroller-right').hide();

    if (getLeftPosi() < 0) {
      $('.list').animate({ left: "-=" + getLeftPosi() + "px" }, 'slow');
    }
  }

  // If left position is outside of container, show a scroll button else hide it
  if (getLeftPosi() < 0) {
    $('.scroller-left').show();
  } else {
    $('.scroller-left').hide();
  }
}


// -- Template helpers ---------------------------------------------------------


Template.Tabs.helpers({

    tabs: function() {
        return GV.tabs.getTabs();
    },

    isMainDocument: function() {
    	return Session.get('nodeInFocus') == Session.get('mainDocument');
    },

    getTitle: function(id) {
    	var node = GV.collections.Nodes.findOne({
        _id: id
      },
      {
        fields: {
          title: 1
        }
      });

    	return node && node.title || null;
    }

});


// -- Template events ----------------------------------------------------------


Template.Tabs.events({

	'click .tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', this.toString());
	},

	'click .general-info': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', Session.get('mainDocument'));
	},

	'click .delete-tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();
		event.stopPropagation && event.stopPropagation();

		// If tab removed, go to the general tab.
    // This should be changed to be the nearest tab.
		Session.set('nodeInFocus', Session.get('mainDocument'));
		GV.tabs.removeTab(this);
	},

	'click .scroller-right': function() {
		$('.scroller-left').fadeIn('slow');
		$('.scroller-right').fadeOut('slow');
		$('.list').animate({left:"+="+widthOfHidden()+"px"},'slow');
	},

	'click .scroller-left': function() {
		$('.scroller-right').fadeIn('slow');
		$('.scroller-left').fadeOut('slow');
		$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow');
	},

	'mouseenter .list span.glyphicon': function(event, tmpl) {
		$(event.target).parent().addClass('hovered');
	},

	'mouseleave .list span.glyphicon': function(event, tmpl) {
		$(event.target).parent().removeClass('hovered');
	}

});


//-- Make sure the tab view readjust itself on change --------------------------

// TODO: maybe a little hacky?

Template.Tabs.rendered = function() {
	reAdjust();
};

$(window).on('resize',function(e){
  	reAdjust();
});
