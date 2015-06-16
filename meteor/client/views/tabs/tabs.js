////////////////////////////////////////////////////////////////////////////////
// Tree template logic
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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

    getDoc: function(id) {
    	return GV.collections.Nodes.findOne({
        _id: id
      },
      {
        fields: {
          title: 1,
          nodeType: 1
        }
      });
    }

});


// -- Template events ----------------------------------------------------------


Template.Tabs.events({

	'click .tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', this._id.toString());

    if(this.nodeType === "chapter") {
      Session.set('showNodeForm', false);
      Session.set('showMediaNodesView', true);
    } else {
      Session.set('showNodeForm', true);
      Session.set('showMediaNodesView', false);
    }

    $('li.node span').removeClass('selected');

    var el  = $("li.root li.node[data-id='" + this._id + "']").find("> span");

    if(el && el.length)
      el.addClass('selected');

	},

	'click .general-info': function(event, tmpl) {
		event.preventDefault && event.preventDefault();

		Session.set('nodeInFocus', Session.get('mainDocument'));

    $('li.node span').removeClass('selected');

    var el  = $("li.root > span");

    if(el && el.length)
      el.addClass('selected');
	},

	'click .delete-tab': function(event, tmpl) {
		event.preventDefault && event.preventDefault();
		event.stopPropagation && event.stopPropagation();

		// If tab removed, go to the general tab.
    // This should be changed to be the nearest tab.
		Session.set('nodeInFocus', Session.get('mainDocument'));
		GV.tabs.removeTab(this._id);
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
