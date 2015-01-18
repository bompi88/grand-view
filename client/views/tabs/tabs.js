Template.Tabs.helpers({
    tabs: function() {
        return Tabs.getTabs();
    },
    isMainDocument: function() {
    	return Session.get('nodeInFocus') == Session.get('mainDocument');
    }
});

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

		// If tab removed, go to the general tab. This should be changed to be the nearest tab.
		Session.set('nodeInFocus', Session.get('mainDocument'));
		Tabs.removeTab(this);
	},

	'click .scroller-right': function() {
		$('.scroller-left').fadeIn('slow');
		$('.scroller-right').fadeOut('slow');
		$('.list').animate({left:"+="+widthOfHidden()+"px"},'slow',function(){
		
		});
	},

	'click .scroller-left': function() {
		$('.scroller-right').fadeIn('slow');
		$('.scroller-left').fadeOut('slow');
		$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){
		
		});
	}    

});

// -- The tabs resize and controller methods ---------------------------------------

var scrollBarWidths = 40;

var widthOfList = function() {
  var itemsWidth = 0;
  
  $('.list li').each(function() {
    var it = $(this).outerWidth();
    itemsWidth = itemsWidth + it;
  });

  return itemsWidth;
};

var widthOfHidden = function() {
  return ( ($('.tab-wrapper').outerWidth(true)) - widthOfList() - getLeftPosi() ) - scrollBarWidths || 0;
};

var getLeftPosi = function() {
  return $('.list').position().left;
};

reAdjust = function() {

  if (($('.tab-wrapper').outerWidth(true)) <= widthOfList()) {
    $('.scroller-right').show();
  } else {
    $('.scroller-right').hide();
    
    if (getLeftPosi() < 0) {
    	$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){
		});
	}
  }
  
  if (getLeftPosi() < 0) {
    $('.scroller-left').show();
  } else {
  	$('.scroller-left').hide();
  }
}

Template.Tabs.rendered = function() {
	reAdjust();
};

$(window).on('resize',function(e){  
  	reAdjust();
});
