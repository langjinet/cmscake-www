$.fn.editable = function(options){
	var defaults = {
		onEdit: null,
		onSubmit: function(content){
			if(content.current != content.previous)
			{
				key = $(this).parent().parent().find('[type=hidden]').val();
				column = $(this).attr('name');
				value = content.current;

				$.post(
					content.url + key,
					{ 'col': column, 'newvalue': value }
				);
			}
		},
		submitURL: null,
		editClass: 'dynamic',
		submit: 'save',
		cancel: 'cancel',
		type: 'text',		//text, textarea or select
		submitBy: 'click',	//blur,change,dblclick,click
		options: null
	}
	
	var options = $.extend(defaults, options);
	
	var toEditable = function($this,options){
		$this.data('editable.current',$this.html());		
		$.editableFactory[options.type].toEditable($this.empty(),options);
		// Configure events,styles for changed content
		$this.unbind()
			 .data('editable.previous',$this.data('editable.current'))
			 .children()
				 .focus()
				 .addClass(options.editClass);

		// close old editable element
		if($('.buttonsContainer').parent().is('.editable'))
			toNonEditable($('.buttonsContainer').parent(), options, false);
		
		buttonsContainer = $('<div class="buttonsContainer">').appendTo($this);
		$(buttonsContainer).css({'background': 'white',
								'padding': '2px 10px',
								'position': 'absolute',
								'border': 'solid 1px orange',
								width: '100px',
								height: 'auto'
								});
		$(buttonsContainer).css('top', 20 + $this.offset().top );
		$(buttonsContainer).css('left', $this.offset().left );

		// keyboard press event for text input
		$this.keypress( function(e){
			if(e.keyCode == 13)			// enter
				toNonEditable($this, options, true);
			else if( e.keyCode == 27)		// escape
				toNonEditable($this, options, false);
		});

		// Submit Event
		if(options.submit) {
			$('<a>').appendTo($(buttonsContainer))
						.html(options.submit)
						.css( {'color': 'black'})
						.attr('href', '#')
						.unbind()
						.mouseup(function(){toNonEditable($this,options,true)});
		} else
		{
			
			$this.one(options.submitBy,function(){toNonEditable($this,options,true)})
				 .children()
				 	.one(options.submitBy,function(){toNonEditable($this,options,true)});
		}
		
		// Cancel Event
		if(options.cancel)
			$('<span>').appendTo($(buttonsContainer)).html(' &nbsp;');
			$('<a>').appendTo($(buttonsContainer))
						.html(options.cancel)
						.attr('href', '#')
						.css('color', 'black')
						.unbind()
						.mouseup(function(){toNonEditable($this,options,false)});

		// Call User Function
		if($.isFunction(options.onEdit))
		{	
			options.onEdit.apply(	$this,
									[{
										current:$this.data('editable.current'),
										previous:$this.data('editable.previous')
									}]
								);
		}
	}

	var inputkeypressed = function()
	{
		alert('key press');
	}
	
	var toNonEditable = function($this,options,change){
		if($.editableFactory[options.type].getValue($this,options) == '')
		{
			// new value is empty, not save
			change = false;
		}
		
		// Configure events,styles for changed content
		$this.unbind()
			 .click(function(){toEditable($this,options)})
			 .data( 'editable.current',
				    change?
						$.editableFactory[options.type].getValue($this,options)
						:$this.data('editable.current')
					)
			 .html(
				    options.type=='password'?
						'*****'
						:$this.data('editable.current')
					);

		
		// Call User Function
		if($.isFunction(options.onSubmit))
		{
			options.onSubmit.apply(	$this,
										[{
											current: $this.data('editable.current'),
											previous:$this.data('editable.previous'),
											url: options.submitURL
										}]
									);
		}
	}
			
	return  this.click(function(){toEditable($(this),options)});
}

$.editableFactory = {
	'text': {
		toEditable: function($this,options){
			$this.append('<input style="width: 95%; font-size: 8pt; padding: 2px 0px; height: 12px;" type="text" value="'+$this.data('editable.current')+'"/>');
		},
		getValue: function($this,options){
			return $this.children().val();
		}
	},
	'password': {
		toEditable: function($this,options){
			$this.append('<input type="password" value="'+$this.data('editable.current')+'"/>');
		},
		getValue: function($this,options){
			return $this.children().val();
		}
	},
	'textarea': {
		toEditable: function($this,options){
			$('<textarea/>').appendTo($this)
							.val($this.data('editable.current'));
		},
		getValue: function($this,options){
			return $this.children().val();
		}
	},
	'select': {
		toEditable: function($this,options){
			$select = $('<select/>').appendTo($this);
			$.each( options.options,
					function(key,value){
						$('<option/>').appendTo($select)
									.html(value)
									.attr('value',key);
					}
				   )
			$select.children().each(
				function(){
					var opt = $(this);
					if(opt.text()==$this.data('editable.current'))
						return opt.attr('selected', 'selected').text();
				}
			)
		},
		getValue: function($this,options){
			var item = null;
			$('select', $this).children().each(
				function(){
					if($(this).attr('selected'))
						return item = $(this).text();
				}
			)
			return item;
		}
	}
}
