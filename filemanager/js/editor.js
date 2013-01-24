/**
 * editor.js
 */
//document.write('<title>Editing: '+CommonUtilities.getQueryParameter('path')+'</title>');


EditorActions = {
    getFile : function(){
        $.ajax({
            url:'http://' + location.host + '/rest/app/' + EditorActions.getQueryParameter('path'),
            data:'app_name=filemanager&method=GET',
            cache:false,
            success:function (response) {
                EditorActions.loadEditor(response);
            },
            error:function (response) {
                if (response.status == 401) {
                    $("#loginDialog").modal('toggle');
                }
            }
        });
    },
    getFileName:function () {
        var pathArray = EditorActions.getQueryParameter('path').split('/');

        return pathArray[pathArray.length - 1];
    },
    saveFile:function(){
        $.ajax({
            url:'http://' + location.host + '/rest/app/' + EditorActions.getQueryParameter('path') + '?&app_name=filemanager&method=MERGE',
            data: Editor.getValue(),
            type:'POST',
            cache:false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-File-Name",Actions.getFileName());
            },
            success:function (response) {
                window.close();
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
            EditorActions.saveFile();
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
    EditorActions.getFile();

});