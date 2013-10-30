/**
 * editor.js
 */
//document.write('<title>Editing: '+CommonUtilities.getQueryParameter('path')+'</title>');


EditorActions = {
    getFile : function(){
        $.ajax({
            url:CurrentServer + '/rest' + EditorActions.getQueryParameter('path'),
            data:'app_name=admin&method=GET',
            cache:false,
            processData: false,
            success:function (response) {
                var filename = EditorActions.getFileName();
                if(filename.indexOf(".json") != -1){
                    response = JSON.stringify(response);
                }

                EditorActions.loadEditor(response);
            },
            error:function (response) {
                if (response.status == 401) {
                    window.opener.window.top.Actions.doSignInDialog();
                } else if(response.status == 200){
                    EditorActions.loadEditor(response.responseText);
                }else{
                    alertErr(response);
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
            url:CurrentServer + '/rest' + EditorActions.getQueryParameter('path') + '?&app_name=admin',
            data: Editor.getValue(),
            type:'PUT',
            processData: false,
            cache:false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-File-Name",EditorActions.getFileName());
            },
            success:function (response) {
                $.pnotify({
                    title: EditorActions.getFileName(),
                    type: 'success',
                    text: 'Saved Successfully'
                });
            },
            error:function (response) {
                if (response.status == 401) {
                    window.opener.window.top.Actions.doSignInDialog();
                } else {
                    alertErr(response);
                }
            }
        });
    },
    loadEditor:function(contents){
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