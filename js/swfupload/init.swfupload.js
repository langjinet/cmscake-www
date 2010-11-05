var swfu;

window.onload = function() {
    var settings = {
        flash_url : SITE_ROOT + "/swfupload.swf",
        upload_url: SITE_ROOT + "/media/upload",	// Relative to the SWF file or absolute
        
        post_params: {"PHPSESSID" : ""},
        file_size_limit : "100 MB",
        //file_types : "*.gif;*.png;*.jpg;*.jpeg",
        file_types : "*.*",
        file_types_description : "All internet image file types",
        file_upload_limit : 100,
        file_queue_limit : 5,
        custom_settings : {
            progressTarget : "fsUploadProgress",
            cancelButtonId : "btnCancel"
        },
        debug: false,

        // Button settings
        //button_image_url: SITE_ROOT + "/img/admin/TestImageNoText_65x29.png",	// Relative to the Flash file
        button_image_url: SITE_ROOT + "/img/admin/SmallSpyGlassWithTransperancy_17x18.png",
        button_width: "80",
        button_height: "18",
        button_placeholder_id: "spanButtonPlaceHolder",
        button_text: '<span class="theFont">Upload</span>',
        button_text_style: ".theFont { font-size: 13; }",
        button_text_left_padding: 25,
        button_text_top_padding: 0,
        button_action: SWFUpload.BUTTON_ACTION.SELECT_FILES,
        
        // The event handler functions are defined in handlers.js
        file_queued_handler : fileQueued,
        file_queue_error_handler : fileQueueError,
        file_dialog_complete_handler : fileDialogComplete,
        upload_start_handler : uploadStart,
        upload_progress_handler : uploadProgress,
        upload_error_handler : uploadError,
        upload_success_handler : uploadSuccess,
        upload_complete_handler : uploadComplete,
        queue_complete_handler : queueComplete	// Queue plugin event
    };

    swfu = new SWFUpload(settings);
 };