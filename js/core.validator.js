$.fn.validator = function( showHintOnly ) {
	if( typeof(showHintOnly) == 'undefined' ) {
		showHintOnly = false;
	}
	else {
		showHintOnly = true;
	}
	
	$(this).find('[class*=hintOnly]').each( function(){
		$(this).focus(function(){ whenFocus( $(this)); });
		$(this).blur( function(){ whenBlur( $(this)); });
		
		// add hint
		$('<span>').addClass('hint-pointer')
		.html('&nbsp;')
		.appendTo( $(this).next().hide() );
	});
	
	$(this).find('[class*=client]').each( function() {
		// add events
		$(this).focus(function(){ whenFocus( $(this)); });
		$(this).blur( function(){ whenBlur( $(this)); });
		$(this).keypress( function(e){ whenKeypress(e, $(this)); } );

		// add hint
		$('<span>').addClass('hint-pointer')
		.html('&nbsp;')
		.appendTo( $(this).next() );

		if( showHintOnly == false ) {
			// error message holder
			$('<span>').css( {color: 'black'} )
			.attr('id', $(this).attr('id')+'_error' )
			.html('&nbsp;')
			.appendTo( $(this).next() );	
		} else {
			
		}
		$(this).next().hide();
		
	});

	var whenFocus = function($this) {
		$this.next().css( {display: 'inline'} );
	}

	var whenBlur = function($this) {
		$this.next().css( {display: 'none'} );
	}

	var whenKeypress = function(e, $this) {
		if( e.which == 13 )
		{
			if( $this.parents('form').formcheck(false, 'ignore') )
				$this.parents('form').submit();
		}
	}
};

$.fn.formcheck = function(isSubmit, ignoreGroup) {
	var totalError = 0;
	
	if( typeof(ignoreGroup) == 'undefined' ) {
		ignoreGroup = false;
	}
	
	$(this).find('[class*=client]').each( function() {
		if( !$.fn.formcheck.check( $(this), ignoreGroup ) ) {
			showError($(this));
			totalError++;
			if( totalError == 1 ) {
				$(this).focus();
				$(this).fadeTo('slow', 0.5).fadeTo('fast', 1.0);
				return false;
			} else {
				$(this).triggerHandler('blur');
			}
		}
		else {
			$(this).trigger('blur');
			hideError( $(this) );
		}
	});

	if(totalError > 0) {
		return false;
	}

	if(isSubmit == true) {
		$(this).submit();
	}

	return true;
};

$.fn.formcheck.check = function( $formElement, group ) {
	var data = toJSON( $formElement.attr('alt') );
	value = $formElement.val();
	
	if( group != false && group == data.group )
		return true;
	
	rule = data.rule;
	righthand = data.righthand;

	result = false;
	
	switch (rule) {
		case 'required':
			result = (value == '')? false : true;
			break;
		case 'key':
			result = (value == '')? false : true;
			break;
		case 'number':
		case 'text':
		case 'email':
			result = simpleRegex(value, rule);
			break;
		case 'match':
			if (value != '' && value == $(righthand).val()) {
				result = true;
			}
			else {
				result = false;
			}
			break;
	}
	
	return result;
};

function simpleRegex (val, rule){
	var rx;

	if (rule == 'number') {
	    rx = /^[0-9]+[.,]?[0-9]*$/;
	} else if (rule == 'text') {
		rx = new RegExp('^[a-zA-Z]+$');
	} else if (rule == 'email') {
		rx = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
	}
	
	if (val.match(rx))
		return true;
	return false;
}

function showError($this){
	targetid = "#" + $this.attr('id');
	var error_id = targetid + '_error';
	
	data = toJSON($this.attr('alt'));
	if( data.message != '' ) {
		$(error_id).css( {display: 'inline'} )
		.html("<br/><br/>" + data.message);	
	}
}

function hideError($this) {
	targetid = "#" + $this.attr('id');
	var error_id = targetid + '_error';
	$(error_id).css( {display: 'none'} );
}

var login = {
	user_id:  '#txtUsername',
	password: '#txtPassword',
	placeHolder: '#userstatus',
	login_button: '#login-button',
	
	init: function() {
		$(this.user_id).focus( function(){
			if ( $(this).hasClass('blank') ) {
				$(this).val('');
				$(this).removeClass('blank');
			}
		});
		
		$(this.user_id).blur( function(){
			if ( $(this).val() == '' ) {
				$(this).val('Tên đăng nhập');
				$(this).addClass('blank');
			}
		});
		
		$(this.user_id).keypress( function(e){
			if( e.which == 13 ) {
				$(this).blur();
				$(login.password).focus();
			}		
		});
		
		$(this.password).focus( function(){
			if ( $(this).hasClass('blank') ) {
				$(this).val('');
				$(this).removeClass('blank');
			}
		});
		
		$(this.password).blur( function(){
			if ( $(this).val() == '' ) {
				$(this).val('password');
				$(this).addClass('blank');
			}
		});
		
		$(this.password).keypress( function(e){
			if( e.which == 13 ) {				
				if(!$(login.user_id).hasClass('blank') && !$(login.password).hasClass('blank') && $(login.user_id).val() != '' ) {
					//alert('submit login');
					login.submit();
				}
			}		
		});
		
		$(this.login_button).click(function(){
			if(!$(login.user_id).hasClass('blank') && !$(login.password).hasClass('blank')
			   && $(login.user_id).val() != '' && $(login.password).val() ) {
				login.submit();
			}
		});
	},
	
	submit: function() {
		var user_id = $(this.user_id).val();
		var password = $(this.password).val();
		
		var data = { user_id: user_id, password: password }
		
		$.ajax({
			url: SITE_ROOT + '/users/alogin/',
			data: data,
			type: 'POST',
			success: function(response) {
				var data = toJSON( response );
				
				if( data.success == 'true' ) {
					var logoutlink = "<a href='"+SITE_ROOT+"/admin/pages'>Administration</a> - <a href='"+ SITE_ROOT +"/users/logout'>[Logout: " + data.username +"]</a>";
					if(data.role =='admin') {
					  document.location = SITE_ROOT+"/admin/pages";
					  $(login.placeHolder).html( logoutlink  );
					} else {
						logoutlink = "<a href='"+SITE_ROOT+"/users/profile'>Profile</a> - <a href='"+ SITE_ROOT +"/users/logout'>[Logout: " + data.username +"]</a>";
						alert(data.msg);	
						$(login.placeHolder).html( logoutlink  );
					}
				} else {
					alert(data.msg);
				}
			}
		});
	}
}