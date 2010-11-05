var mediacollector = {
	singleValueTarget: null,
	multiValueTarget: null,
	mediaViewTarget: null,
	currentValues: null,
	infos: new Array(),
	
    popup: function(mode, targetID) {
		if( mode == 'single' ) {
			this.singleValueTarget = targetID;
			window.open( SITE_ROOT + '/media/popup/mode:single', null, 'width=600, height=450');
		}
		else if ( mode == 'multi' ) {
			this.multiValueTarget = targetID;
			
			window.open( SITE_ROOT + '/media/popup/mode:multi', null, 'width=600, height=450');
			this.currentValues = $(targetID).val().split(',');
		}
    } ,

	setSingleValue: function( newValue ) {
		$(this.singleValueTarget).val( newValue );
	} ,

	setMultiValue: function( newValue ) {
		$(this.multiValueTarget).val( newValue );
	},

	removeFromRelated: function(id, target) {
		pos = inarray(id, this.currentValues);
		
		if ( pos != 'false' ) {
			this.currentValues.splice(pos, 1);			
			
			var index = this.getIndex( id );
			this.infos.splice(index, 1);
			
			$(this.multiValueTarget).val( toText( this.currentValues ) );
			$(target).fadeOut('fast', function(){ $(this).remove(); } );
		}
		else{
			alrt('item not found');
		}
	},

	getIndex: function( id ) {
		for(i=0; i < this.infos.length; i++)
		{
			if( id == this.infos[i].id)
				return i;
		}
	},
	
	setInfos: function() {
		if( typeof( this.currentValues ) != null ) {
			for( i=0; i< this.currentValues.length; i++)
			{
				// get old path
				var path = $( '#imgframe_' + this.currentValues[i] ).attr('src');
				var info = { id: this.currentValues[i], path: path };
				this.infos.push(info);
			}
		}
	} ,

	updateMediaView: function() {
		// clear old content
		$(this.mediaViewTarget).html('');
		
		for( i= 0; i<this.infos.length; i++) {
			data = { src: this.infos[i].path, mid: this.infos[i].id}
			
			if( typeof(data.src) != 'undefined' ) {
				tpl = "<img id='%(mid)s' src='%(src)s' style='margin: 0px 8px 8px 0px; width: 120px;'  \n\
				onclick='mediacollector.removeFromRelated(%(mid)s, this); return false;'"
				$(this.mediaViewTarget).append( $.sprintf( tpl, data ) );
			}
		}

		// update value to hidden field and infos array
		this.currentValues = fromText( $(this.multiValueTarget).val() );
	} ,

	test: function() {
		for( i=0; i< this.infos.length; i++) {
			alert( this.infos[i].id + ": " +this.infos[i].path );
		}
	}
}
