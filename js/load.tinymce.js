$().ready(function(){
      // init all Textarea with class mceSmallEditor to a small WYSIWYG editor
      $('textarea.mceSmallEditor').tinymce({
            mode: 'specific_textareas',
            theme: 'simple',
            width: "350",
            height: "100"
            //language : "vi"
      });
      
      // standard config for all Textarea ( except mceSmallEditor )
      $('textarea[class != mceSmallEditor]').tinymce({
            theme: "advanced",
            mode: "specific_textareas",
            //editor_deselector : "mceSmallEditor",
            convert_urls: false,
            theme_advanced_toolbar_location : "top",
            theme_advanced_toolbar_align : "left",
            width: "400",
            height: "200",
            plugins: "picture",
      
            theme_advanced_buttons1: "bold, italic, underline, seperator, justifyleft, justifycenter ,justifyright, justifyfull, seperator, bullist, numlist, outdent, indent, link, unlink, image, picture, cleanup, seperator, forecolor, backcolor, fontsizeselect, seperator, removeformat, code",
            theme_advanced_buttons2: "",
            theme_advanced_buttons3: "",
            
            oninit : "updatePageHeight"
            //language : "vi"
      });
});