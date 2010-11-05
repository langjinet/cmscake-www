// global var
var SITE_ROOT = '';

// calculate webpage height right after the page is loaded
$(document).ready(function() {
	initMenu();
	
    updatePageHeight();

	////////////////////////////////////////////////////////////////////////
	// to make sure IE not crash when insert content to page by Javascript
	// all the insertion event must fire from here
	////////////////////////////////////////////////////////////////////////

	// location: views/element/media_actions.ctp
	if(typeof(modalSetup) == 'function' )
		modalSetup();

	// location : wwwroot/js/media.manager.js
	if( typeof(mediamgr) != 'undefined' )
		mediamgr.init();

	if( typeof( initialize ) == 'function' )
	{
		initialize();
		//showAddress('Pham Phu Thu, district 6, Ho Chi Minh City');
		$('#map_canvas').show();
	}

	var isFancy = typeof($.fn.fancybox) != 'undefined' ;

	if( isFancy ) {
		$("a.fancy").fancybox( {
			'zoomSpeedIn'			: 600,
			'zoomSpeedOut'			: 500
			//'easingIn'				: 'easeOutBack',
			//'easingOut'				: 'easeInBack'
		} );
	}
});
function initMenu()
{
	$('[class^="sub_"]').each( function() {
		var top = $(this).parent().offset().top + $(this).parent().height() - 2;
		var left = $(this).parent().offset().left;
		$(this).css( { top: top, left: left } );

		// round border for sub-nav menu
		$(this).prepend("<div class='line'></div><div class='top'></div>");
		$(this).append("<div class='bottom'></div>");

		$(this).parent().mouseover( function() {
			$(this).find('[class^=sub_]').show();
		});

		$(this).parent().mouseout( function() {
			$(this).find('[class^=sub_]').hide();
		});
	});
}

function updatePageHeight()
{
	var client_height = $(window).height();
    // footer + header height
    var fixed_height = $('#main_navigation').outerHeight( {margin: true} )
		+ $('#footer').outerHeight( {margin: true} );
    
    // space between 'content' and fixed_height
    //var unchanged_space = 80;
    //var min_content_height = client_height - fixed_height - unchanged_space;
	var min_content_height = client_height - fixed_height - 2;
    
	//alert(min_content_height);
	//alert(client_height);
    /*----------------------------------------------------------------------------------------------*
     *  !Important: set height to 'auto', make javascript possible to calculate content height
     *              then check that height, if it is smaller than the MIN height, then expand it.
     *----------------------------------------------------------------------------------------------*/
    $('#content').css('height', 'auto');
    
    if ($('#content').height() < min_content_height) {
		$('#content').css('height', min_content_height + 'px');
	}
}

// vsprintf utility extention for JQuery
//link http://plugins.jquery.com/project/printf
(function($) {
	var formats = {
		'%': function(val) {return '%';},
		'b': function(val) {return  parseInt(val, 10).toString(2);},
		'c': function(val) {return  String.fromCharCode(parseInt(val, 10));},
		'd': function(val) {return  parseInt(val, 10) ? parseInt(val, 10) : 0;},
		'u': function(val) {return  Math.abs(val);},
		'f': function(val, p) {return  (p > -1) ? Math.round(parseFloat(val) * Math.pow(10, p)) / Math.pow(10, p): parseFloat(val);},
		'o': function(val) {return  parseInt(val, 10).toString(8);},
		's': function(val) {return  val;},
		'x': function(val) {return  ('' + parseInt(val, 10).toString(16)).toLowerCase();},
		'X': function(val) {return  ('' + parseInt(val, 10).toString(16)).toUpperCase();}
	};

	var re = /%(?:(\d+)?(?:\.(\d+))?|\(([^)]+)\))([%bcdufosxX])/g;

	var dispatch = function(data){
		if(data.length == 1 && typeof data[0] == 'object') { //python-style printf
			data = data[0];
			return function(match, w, p, lbl, fmt, off, str) {
				return formats[fmt](data[lbl]);
			};
		} else { // regular, somewhat incomplete, printf
			var idx = 0; // oh, the beauty of closures :D
			return function(match, w, p, lbl, fmt, off, str) {
				return formats[fmt](data[idx++], p);
			};
		}
	};

	$.extend({
		sprintf: function(format) {
			var argv = Array.apply(null, arguments).slice(1);
			return format.replace(re, dispatch(argv));
		},
		vsprintf: function(format, data) {
			return format.replace(re, dispatch(data));
		}
	});
})(jQuery);

$.fn.tableBeautify = function() {
	$(this).find('tr:odd').addClass('alt');
}

function toJSON(str)
{
	eval ( 'var data = ' + str );
	return data;
}

var listmanager = {
	current: "",
	targetID: "",

	init: function(targetid, key) {
		this.targetID = targetid;
		this.current = key;

		var matchRows = $("#" + targetid + " tr");

		for(i=1; i<matchRows.length; i++)
		{
			$(matchRows[i]).hide();
		}

		this.showItems(key);
	},

	showItems: function(key)
	{
		var matchRows;
		var total;

		if( key == 'all' )
		{
			matchRows = $("#" + this.targetID + " tr");
			total = matchRows.length;

			for(i=0; i<total; i++)
			{
				$(matchRows[i]).show();
			}

			this.current = key;
			return;
		}

		if (this.current == 'all') {
			matchRows = $("#" + this.targetID + " tr");
			total = matchRows.length;

			for (i = 1; i < total; i++) {
				$(matchRows[i]).hide();
			}
		}
		else {
			matchRows = $("tr." + this.current);
			total = matchRows.length;
			// hide current display rows
			for (i = 0; i < total; i++) {
				$(matchRows[i]).hide();
			}
		}

		// show new select rows
		matchRows = $("tr."+key);
		total = matchRows.length;
		for(i=0; i<total; i++)
		{
			$(matchRows[i]).show();
		}
		this.current = key;
	}
}

function updateProperties( isSaveState )
{
    var saveCurrentState = true;
    if( typeof( isSaveState ) != 'undefined' )
	saveCurrentState = false;
    
    if( $('#ProductProductDefinitionId').val() != $('#ProductOldDefId').val() )
    {
	var def_id = $('#ProductProductDefinitionId').val();
	if( def_id != '-1' )
	{
	    $.ajax({
		url: SITE_ROOT + '/products/deflist/' + def_id,
		type: 'GET',
		success: function(response) {
		    $('#placeHolderProperties').html(response);
		}
	    });
	}
	else
	{
	    $('#placeHolderProperties').html('');
	}
    }
    else
    {
	if (saveCurrentState == true)
	    $('#placeHolderProperties').html( $('#placeHolderTmp').html() );
    }
}

/*
* Utilities for Array
**/
function toText(myarray)
{
	var result = "";

	for(i=0; i<myarray.length; i++)
	{
		if( myarray[i] != '' )
		{
			if(i == myarray.length -1)
				result += myarray[i];
			else
				result += myarray[i] + ",";
		}
	}

	return result;
}

function fromText(strText)
{
	var myarray = new Array;
	myarray = strText.split(',');

	return myarray;
}

function inarray(val, myarray)
{
	for(i=0; i<myarray.length; i++) {
		if( myarray[i] == val ) {
			return i;
		}
	}

	return 'false';
}