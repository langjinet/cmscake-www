var mediamgr = {
    targetContainer: '#result_container',
    mediaCount: 0,
  	thumbClassName: null,		// thumbnail class name
  	popupMode: null,			// for the search URL
  	popupAction: null,			// for event handling when a item is clicked
  	multiValues: new Array(),
  	eventSender: null,
  	mediaInfos: null,			// get existing media info from MediaCollector, called by edit paged
	
    init: function(tcn) {
		if( this.popupAction == 'multi' ) {
			// update state
			this.updateStates();
		}
		
		if( typeof(tcn) != 'undefined' )
			this.thumbClassName = tcn;
		
        $('#tn_container').find('[class=tooltip]').each(function() {
            var left = $(this).parent().offset().left;
            var top = $(this).parent().offset().top + $(this).parent().height();

            // tooltip element of Media
            $(this).css( {  'display': 'none',
                            'text-align': 'left',
                            'position': 'absolute',
                            'border': 'solid #333 1px',
                            'border-width': '1px 1px 1px 1px',
                            'padding': '5px',
                            'background': '#EEE',
                            'min-width': '150px',
                            'max-width': '300px',
                            'left': left,
                            'top': top
                         }
                       );
        });

        // register event for media items
        // show/hide tooltip when mouse hover/out of Media
        $('#tn_container').find('[class^=thumb]').each(function(){
            $(this).mouseover(function(){
                $(this).find('[class=tooltip]').show();
            });

            $(this).mouseout(function(){
                $(this).find('[class=tooltip]').hide();
            });
        });
		
		// if no thumbnail item is shown, no item messge will show
		if( $('#tn_container').find('[class^=thumb]').size() == 0)
		{
			$('#noitem').show();
		}
		else
		{
			$('#noitem').hide();
		}
    } ,

	getIDs: function() {
		if( typeof( this.getMediaCollector() ) != 'undefined' )
		{
			this.multiValues = this.getMediaCollector().currentValues;
			this.mediaInfos = this.getMediaCollector().infos;
		}
	},

	generateThumbElement: function(media) {
		media.tnclass = this.thumbClassName;
		
		var tmp = "<input type='hidden' id='data_%(id)s' value = \"{ id: '%(id)s', name: '%(name)s', tags: '%(tags)s', desc: '%(desc)s', permission: '%(permission)s' }\" />";
        tmp = $.sprintf( tmp, media );

        var tpl = "<div class='%(tnclass)s'>";
        tpl += tmp;
	     	tpl += "<img class='tn_img' src='%(location)s' /><br/>";
        tpl += "<input class='checkitem' value='%(id)s' type='checkbox' onclick='statusChanged()' />";
	     	tpl += " %(name)s";
	     	tpl += "<div class='tooltip'>";
        tpl += "<a href='#' onclick='$(\"#edit_modal\").dialog(\"open\"); setValues($(this)); return false;' ><img src='/img/admin/edit.png' /></a>";
        tpl += " <a href='#' onclick=\"$('#delete_modal').dialog('open'); setDeleteID($(this)); return false;\"><img src='/img/admin/delete.png' /></a>";
        tpl += "<br/>";
        tpl += "<span style='font-weight: bold'>";
        tpl += "%(name)s</span>";
        tpl += "<br/>%(desc)s";
	     	tpl += 	"</div></div>";
        var result = $.sprintf( tpl, media );

		return result;
	} ,
	
    added: function(media) {
        var result = this.generateThumbElement(media);
        $(this.targetContainer).prepend(result)
        .fadeIn( 'slow',
                 function(){
                     mediamgr.init();
                }
        );
    },

	updated: function(media) {
		var result = this.generateThumbElement(media);
        $('#data_'+media.id).parent().replaceWith(result);

		if( $('#dlPermission').val() != '-1' && $('#dlPermission').val() != media.permission )
			$('#data_'+media.id).parent().fadeOut('slow', function(){ $(this).remove(); mediamgr.init(); });
		
        mediamgr.init();
	},

	deleted: function(media) {
		$("#data_" + media.id ).parent()
		.fadeOut(	'fast',
					function() {
						$(this).replaceWith('');
						mediamgr.init();
					}
				);
	},

    search: function( search_mode ) {
        var data = { keyword: null, tag: null, permission: null, search_mode: null, mediatype: null };

		if( search_mode == 'all' )
		{
			data.search_mode = 'all';
			data.keyword = '';
			data.tag = '';
			data.permission = '';
            data.mediatype = '';
			
			$('#txtKeyword').val('');
			$('#txtTag').val('');
			$('#dlPermission').val('-1');
            $('#dlMediaType').val('-1');
		}
		else
		{
			data.keyword = $('#txtKeyword').val();
			data.tag = $('#txtTag').val();
			data.permission = $('#dlPermission').val();
            data.mediatype = $('#dlMediaType').val();
            
			if( data.keyword == '' && data.tag == '' && data.permission == '-1' && data.mediatype =='-1')
			{
                // do nothing if all params is empty
				//return false;
			}
		}

		var searchURL = SITE_ROOT + '/media/search';
		if( this.popupMode != null )
			searchURL += '/mode:popup';
		
        $.ajax({ type: 'POST',
                url: searchURL,
                data: data,
                beforeSend: function() { $('#spinner').show(); },
                success: function(response){
                    $('#result_container').fadeOut( 'slow',
                                                    function(){
                                                        $(this).html(response).fadeIn();
                                                        mediamgr.init();
                                                        $('#spinner').hide();
                                                    }
                    );
                }
        });
    },

    ajaxLinks: function(target) {
        // get all navigation link
        $(target + ' .paging a').each ( function(i){
            $(this).click( function(){
				if(mediamgr.popupMode != null)
					this.href += '/mode:popup';

                $.ajax({
                    type: 'post',
                    async: true,
                    url: this.href,

                    beforeSend: function() { $('#spinner').show(); },
                    complete: function() { $('#spinner').hide(); },
                    success: function(content) {
                        $(target).slideUp().html(content).slideDown('fast', function(){ mediamgr.init(); });
                    }
                });

                return false;
            });
        });
    } ,

	//****************************************************
	// popup functions
	//****************************************************
	itemclick: function( sender ) {
		var data;
		if( this.popupAction == 'single')
		{
			data = toJSON( $(sender).find('input[type=hidden]').val() );
			//alert(data.medium);
			this.getMediaCollector().setSingleValue( data.medium );
			window.close();
		}
		else if( this.popupAction == 'multi') {
			data = toJSON( $(sender).find('input[type=hidden]').val() );

			pos = jQuery.inArray( data.id, this.multiValues );
			
			if( pos == -1 ) {
				this.multiValues.push( data.id );
				this.toggleItem(sender, 'true');
			} else {
				this.multiValues.splice(pos, 1);
				this.toggleItem(sender, 'false');
			}
		} else if( this.popupAction == 'inline' ) {
			this.eventSender = sender;
			$("#option_dialog").dialog("open");
		}
	} ,

	applyToEditor: function(format){
		var tinymce = this.getTinyMce();
		var editor = tinymce.EditorManager.activeEditor;

		var result = $( this.eventSender ).find('img').attr('src');
		format.file = result;
		format.originFile = result.replace("tn_", "");
		
		var tpl = '<a href="%(originFile)s" class="fancy"><img src="%(file)s" style="%(width)s %(imgfloat)s %(align)s %(height)s border: none;" /></a>';
		result = $.sprintf(tpl, format);
		editor.execCommand('mceInsertContent', null, result );
	} ,
	
	apply: function() {
		//this.test();
		this.getMediaCollector().setMultiValue( toText( this.multiValues ) );
		this.getMediaCollector().infos = this.mediaInfos;
		//this.getMediaCollector().test();
		this.getMediaCollector().updateMediaView();
		window.close();
	} ,

	toggleItem: function(sender, isSelected) {
		var mid = $(sender).attr('id').replace( 'tn_', '' );
		
		if( isSelected == 'true' ) {
			$(sender).addClass('imageframe_selected');
			var src = $( sender ).find('img').attr('src');
			
			info = { id: mid, path: src };
			this.mediaInfos.push( info );
		}
		else {
			var index = this.getIndex( mid );
			this.mediaInfos.splice(index, 1);	
			$(sender).removeClass('imageframe_selected');
		}
	},

	getIndex: function( id ) {
		for(i=0; i<this.mediaInfos.length; i++)
		{
			if( id == this.mediaInfos[i].id)
				return i;
		}
	},
	
	test: function() {
		for( i=0; i< this.mediaInfos.length; i++) {
			alert( this.mediaInfos[i].id + ": " +this.mediaInfos[i].path );
		}
	},

	updateStates: function() {
		var idList;
		for( i =0; i< this.multiValues.length; i++) {
			idList += 'tn_' + this.multiValues[i] + ";";
		}

		$('[class=thumb_popup]').each( function(){
			currentID = $(this).attr('id');
			if ( idList.indexOf( currentID ) >= 0 ) {
				$(this).addClass('imageframe_selected');
			}
		});
	} ,
	
	cancel: function() {
		window.close();
	} ,
	//****************************************************
	// popup functions -END
	//****************************************************
	getWin: function() {
		return window.dialogArguments || opener || parent || top;
	} ,

	getMediaCollector: function() {
		var win = window.dialogArguments || opener || parent || top;
		return win.mediacollector;
	} ,

	getTinyMce: function() {
		var win = window.dialogArguments || opener || parent || top;
		return win.tinymce;
	}
}

/////////////////////////////////////////////////
/// method using in media_actions.ctp
/////////////////////////////////////////////////
function modalSetup() {
	$('#option_dialog').dialog( {
		bgiframe: false,
		height: 300,
		width: 500,
		modal: true,
		autoOpen: false,
		title: 'Image property',
		buttons: {
			No: function() {
				$(this).dialog('close');
			},
			
			Yes: function(){
				var format = { imgfloat: '', align: '', width: '', height: '', file: '', origin: '' };
				
				if( $('#rdLeft').attr('checked') == true )
					format.imgfloat = "float: left;";
				else
					format.imgfloat = "float: right;";

				if( $('#txtWidth').val() != '')
					format.width = "width: " + $('#txtWidth').val() + "px;";
				
				if( $('#txtHeight').val() != '')
					format.height = "height: " + $('#txtHeight').val() + "px;";

				if( $('#chkUseOrigin').attr('checked') == true )
					format.origin = true;

				format.align = "align: " + $('#dlAlign').val() + ";";
					
				mediamgr.applyToEditor(format);
				window.close();
			}
		}
	});
	
	$('#edit_modal').dialog({
		bgiframe: false,
		height: 360,
		width: 600,
		modal: true,
		autoOpen: false,
		title: 'Edit media',
		buttons: {
			No: function() {
				$(this).dialog('close');
			},
			Yes: function() {
				onSaveClick();
			}
		}
	});

	$('#delete_modal').dialog({
		bgiframe: false,
		height: 200,
		width: 300,
		modal: true,
		autoOpen: false,
		title: 'Delete',
		buttons: {
			No: function() {
				$(this).dialog('close');
			},
			Yes: function() {
				var delID = $('#deleteID').val();
				if ( delID != '')
				{
					$.ajax({
						type: 'POST',
						url: SITE_ROOT + '/media/delete/' + delID,
						dataType: 'json',
						beforeSend: function() { $('#spinner').show(); },
						success: function(data) {
							if( data.id !='-1' )
								mediamgr.deleted(data);
							$('#spinner').hide();
						}
					});
				}
				$(this).dialog('close');
			}
		}
	});
}

function onSaveClick() {
    var newData = getValues();

    $.ajax({
        type: 'POST',
        url: SITE_ROOT + '/media/update',
        data: newData,
        dataType: 'json',
        beforeSend: function() { $('#spinner').show(); },
        success: function(data){
            // update server data complete, update client view
            $("#edit_modal").dialog("close");
            mediamgr.updated(data);
            $('#spinner').hide();
        }
    });
}

function getValues() {
    //alert('before upload');
    var data = {id: null, name: null, tags: null, desc: null, permission: null }

    data.id   = $("#MediaId").val();
    data.name = $("#MediaName").val();
    data.tags = $("#MediaTags").val();
    data.desc = $("#MediaDesc").val().replace(/[\n\r\t]/g, '<br/>');
    $('[id^=MediaPermission]').each( function() {
        if( $(this).attr('checked') == true && $(this).val() != '')
            data.permission = $(this).val();
    } );
	
    return data;
}

function setValues(target) {
    var hiddenValue = target.parent().parent().find('input[type=hidden]').val();
    var data = toJSON( hiddenValue );
    
    $("#MediaId").val(data.id);
    $("#MediaName").val(data.name);
    $("#MediaTags").val(data.tags);
	
	var desc = data.desc.replace(/(<br\/>)/g, "\n");
    $("#MediaDesc").val( desc );
    
    $('[id^=MediaPermission]').each( function() {        
        if( $(this).val() == data.permission ) {
            $(this).attr('checked', 'true');
        }
        else {
            $(this).attr('checked', '');
        }
    });

	$("[id^=MediaPermission]").button("refresh");
}

function setDeleteID(target) {
    var hiddenValue = target.parent().parent().find('input[type=hidden]').val();
    var data = toJSON( hiddenValue );
    $('#deleteID').val(data.id);
}