/**
 * editor.js
 */
//document.write('<title>Editing: '+CommonUtilities.getQueryParameter('path')+'</title>');


Actions = {
    getFile : function(){
        $.ajax({
            url:'http://' + location.host + '/rest/app/' + Actions.getQueryParameter('path'),
            data:'app_name=filemanager&method=GET',
            cache:false,
            success:function (response) {
               Actions.loadEditor(response);
            },
            error:function (response) {
                if (response.status == 401) {
                    $("#loginDialog").modal('toggle');
                }
            }
        });
    },
    saveFile:function(){
        $.ajax({
            url:'http://' + location.host + '/rest/app/' + Actions.getQueryParameter('path'),
            data:'app_name=filemanager&method=MERGE',
            type:'POST',
            cache:false,
            success:function (response) {
                //window.close();
            },
            error:function (response) {
                if (response.status == 401) {
                    $("#loginDialog").modal('toggle');
                }
            }
        });
    },
    loadEditor:function(contents){
        console.log('loaded');
        Editor = ace.edit("editor");
        Editor.setTheme("ace/theme/twilight");
        Editor.getSession().setMode("ace/mode/javascript");
        Editor.setValue(contents);

        $("#save").click(function(){
           Actions.saveFile();
        });

        $("#close").click(function(){
            window.close();
        });
    },
    getQueryParameter: function(key) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
        var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }
};
$(document).ready(function(){
	Actions.getFile();
	
});