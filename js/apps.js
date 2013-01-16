/**
 * apps.js
 */

function makeClearable() {
    $('#new').button({ disabled: false });
    $("#save").button({ disabled: false });
}


function makeSelectable(that) {
    if($(that).prop("checked")) {
        $("#cell").removeAttr('disabled');
        $("#tablet").removeAttr('disabled');
        $("#desktop").removeAttr('disabled');
        $("#plugin").removeAttr('disabled');
    } else {
        $("#cell").prop('checked',false).attr('disabled', 'disabled');
        $("#tablet").prop('checked',false).attr('disabled', 'disabled');
        $("#desktop").prop('checked',false).attr('disabled', 'disabled');
        $("#plugin").prop('checked',false).attr('disabled', 'disabled');
    }
}

$(document).ready(function() {

    var isPageDirty = false;
    var selected_app_id = -1;
    var current_apps = null;
    var selectApp = null;
    var reselectApp = false;

    /**
     *
     * @param id
     * @param name
     * @param container
     */
    function makeAppButton(id,name,container) {
        container.append($('<button id="APP_'+id+'" class="app_button selector_btn cW100"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
    }

    /**
     *
     * @param container
     * @param apps
     */
    function renderApps(container,apps) {
        for(var i = 0; i < apps.length; i++) {
            if(!apps[i]) continue;
            makeAppButton(i,apps[i].label,container);
            if(selected_app_id > -1 && parseInt(apps[i].id) == selected_app_id) {
                selected_user = i;
                selected_app_id = -1;
            }
        }
        $('.app_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
            showApp(null); // clear user selection
            $(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
            showApp(current_apps[parseInt($(this).attr('id').substring('APP_'.length))]);
        });
    }

    /**
     *
     */
    function selectCurrentApp() {
        if(selectApp && current_apps) {
            for(var i in current_apps) {
                if(current_apps[i].name == selectApp) {
                    $('#APP_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
                    showApp(current_apps[i]);
                    return;
                }
            }
        } else {
            showApp();
        }
    }
    /**
     *
     * @param app
     */
    function showApp(app) {

        if(selectApp && app == null && reselectApp) {
            reselectApp = false;
            app = selectApp;
        } else {
            selectApp = app;
        }

        if(app) {
            $('input:text[name=Name]').val(app.name);
            $('input:text[name=Label]').val(app.label);
            $('input:text[name=Description]').val(app.description);
            $('input:text[name=Url]').val(app.url);
            if(app.is_active) {
                $('input[name="IsActive"]')[0].checked = true;
            } else {
                $('input[name="IsActive"]')[1].checked = true;
            }
            if(app.is_url_external) {
                $('input[name="IsUrlExternal"]')[0].checked = true;
            } else {
                $('input[name="IsUrlExternal"]')[1].checked = true;
            }
            $("#save").button({ disabled: true });
            if(app.is_url_external) {
                $("#filemanager").button({ disabled: true });
            } else {
                $("#filemanager").button({ disabled: false });
            }
            $("#importapp").button({ disabled: true });
            $("#exportapp").button({ disabled: false });
            $('#delete').button({ disabled: false });
            $('#new').button({ disabled: false });


            $("#deviceTarget").prop('checked',app.filter_by_device);

            $("#cell").prop('checked',app.filter_phone);
            $("#tablet").prop('checked',app.filter_tablet);
            $("#desktop").prop('checked',app.filter_desktop);
            $("#plugin").prop('checked',app.requires_plugin);

            $("#deviceTarget").trigger("onchange");

        } else {
            if(current_apps) {
                for(var i in current_apps) {
                    $('#APP_'+i).button( "option", "icons", {primary: 'ui-icon-star', secondary:''} );
                }
            }
            $('input:text[name=Name]').val('');
            $('input:text[name=Label]').val('');
            $('input:text[name=Description]').val('');
            $('input:text[name=Url]').val('');
            $('input[name="IsActive"]')[1].checked = true;
            $('input[name="IsUrlExternal"]')[1].checked = true;
            $('#save').button({ disabled: false });
            $("#importapp").button({ disabled: false });
            $("#filemanager").button({ disabled: true });
            $("#exportapp").button({ disabled: true });
            $('#delete').button({ disabled: true });
            $('#new').button({ disabled: true });

            $("#deviceTarget").prop('checked',false);
            $("#deviceTarget").trigger("onchange");

        }

        selectSchemas(app);
    }

    /**
     *
     */
    var appio = new DFRequest({
        app: "admin",
        service: "System",
        resource: "/app",
        success: function(json,request) {
            if(!parseErrors(json,errorHandler)) {
                if(request) {
                    switch(request.action) {
                        case DFRequestActions.UPDATE:
                            $("#appsList").dfSearchWidget('go');
                            window.top.Actions.upDateSession();
                            break;
                        case DFRequestActions.CREATE:
                            $("#appsList").dfSearchWidget('go');
                            //updateLaunchPad("Do you want to update LaunchPad now with the new Application?");
                            window.top.Actions.upDateSession();
                            break;
                        case DFRequestActions.DELETE:
                            $("#appsList").dfSearchWidget('go');
                            //updateLaunchPad("Do you want to update LaunchPad now without the Application?");
                            window.top.Actions.upDateSession();
                            break;
                        default:
                            window.top.Actions.upDateSession();
                            break;
                    }
                }
            }
            $("#save").button({ disabled: true });
        }
    });

    /**
     *
     * @param confirmed
     */
    function deleteApp(confirmed) {
        if(selectApp) {
            if(confirmed) {
                appio.deletes(selectApp.id);
                showApp();
            } else {
                $( "#deleteApp" ).html(selectApp.label);
                $( "#confirmDeleteAppDialog" ).dialog('open');
            }
        }
    }

    /**
     *
     * @param app
     */
    function getForm(app) {
        app.name = $('input:text[name=Name]').val();
        app.label = $('input:text[name=Label]').val();
        app.description = $('input:text[name=Description]').val();
        app.url = $('input:text[name=Url]').val();

        if($('input[name="IsActive"]')[0].checked) {
            app.is_active = 1;
        } else {
            app.is_active = 0;
        }
        if($('input[name="IsUrlExternal"]')[0].checked) {
            app.is_url_external = 1;
        } else {
            app.is_url_external = 0;
        }

        if($("#deviceTarget").prop('checked')) {
            app.filter_by_device = 1;
        } else {
            app.filter_by_device = 0;
        }

        if($("#cell").prop('checked')) {
            app.filter_phone = 1;
        } else {
            app.filter_phone = 0;
        }

        if($("#tablet").prop('checked')) {
            app.filter_tablet = 1;
        } else {
            app.filter_tablet = 0;
        }

        if($("#desktop").prop('checked')) {
            app.filter_desktop = 1;
        } else {
            app.filter_desktop = 0;
        }

        if($("#plugin").prop('checked')) {
            app.requires_plugin = 1;
        } else {
            app.requires_plugin = 0;
        }

        app.schemas = getSelectSchemas();
    }

    function selectSchemas(app) {
        $("#SELECT_ALL_SCHEMAS").prop('checked',false);
        $(".SCHEMA_CBX").each(function(){
            $(this).prop('checked',false);
        });
        if(app && app.schemas) {
            var tmp = app.schemas.split(",");
            for(var i in tmp) {
                var str = $.trim(tmp[i]);
                if(str.length > 0) {
                    $("input[value='"+str+"']").prop('checked',true);
                }
            }
        }
    }


    function getSelectSchemas() {
        var str = "";
        $(".SCHEMA_CBX").each(function(){
            if($(this).prop('checked')) {
                if(str.length > 0) str += ",";
                str += $(this).val();
            }
        });
        return str;
    }

    function showSchemas(schema) {
        var con = $('#SCHEMA_ID_LIST');
        con.html('');
        for(var i in schema) {
            if(schema[i].name == undefined) continue;
            con.append('<div><input type="checkbox" name="SCHEMA_ID_'+schema[i].name+'" value="'+schema[i].name+'" class="SCHEMA_CBX" onchange="makeClearable()"/>'+schema[i].label+'</div>');
        }
    }

    /**
     * The Role IO object
     */
    var schemas = new DFRequest({
        app: "admin",
        service: "DB",
        resource: "/schema",
        type: DFRequestType.POST,
        success: function(json,request) {
            if(!parseErrors(json,errorHandler)) {
                showSchemas(json.table);
            }
        }
    });

    makeAdminNav('apps');

    schemas.retrieve();

    if(CommonUtilities.getQueryParameter('selectedApp')) {
        reselectApp = true;
    }

    $("#deviceTarget").trigger("onchange");

    $("#importapp").button({icons: {primary: "ui-icon-circle-arrow-n"}}).click(function(){
        $("#uploadFileInput").trigger("click");
    });

    $("#exportapp").button({icons: {primary: "ui-icon-circle-arrow-s"}}).click(function(){
        $("#uploadFileIframe").attr("src","/REST/APP/"+selectApp.name+"/?export=true&app_name=admin");
    });

    $("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
        deleteApp();
    });

    $("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
        if(selectApp) {
            getForm(selectApp);
            var t = selectApp.name;
            delete selectApp.name;
            delete selectApp.created_by_id;
            delete selectApp.created_date;
            delete selectApp.last_modified_by_id;
            delete selectApp.last_modified_date;
            appio.update(selectApp);
            selectApp = t;
        } else {
            var app = {};
            getForm(app);
            appio.create(app);
            selectApp = app.name;

        }
    });

    $("#new").button({icons: {primary: "ui-icon-document"}}).click(function(){
        showApp();
    });

    $("#filemanager").button({icons: {primary: "ui-icon-folder-collapsed"}}).click(function(){
        window.location = ('../filemanager/index.html?hostApp=admin&path='+selectApp.name+'&returnUrl='+escape(window.location.href.substring(0,window.location.href.indexOf('?'))+'?selectedApp='+selectApp.name));
    });

    $( "#confirmDeleteAppDialog" ).dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        buttons: {
            Continue: function() {
                deleteApp(true);
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $(".ONKEYUP").keyup(makeClearable);
    $(".ONCHANGE").change(makeClearable);
    $(".SCHEMA_SELECT_ALL").change(function() {
        var select = $(this).prop('checked');
        $(".SCHEMA_CBX").each(function(){
            $(this).prop('checked',select);
        });
        makeClearable();
    });
    $("#uploadFileIframe").load(function() {
        var that = $(this);
        var str = that.contents().text();
        if(str && str.length > 0) {
            try {
                str = JSON.parse(str);
                var result = parseErrors(str,errorHandler);
                appio.retrieve();
            } catch (e) {
                alert(e);
            }
        }
    });

    $("#appsList").dfSearchWidget({
        app: 'admin',
        service: "System",
        resource: '/app',
        offsetHeight: 25,
        noSearchTerm: true,
        renderer: function(container,apps) {
            for(var i in apps) {
                if(reselectApp && apps[i].name == CommonUtilities.getQueryParameter('selectedApp')) {
                    selectApp = apps[i];
                }
            }
            if(apps.length > 0) {
                current_apps = apps;
                renderApps(container,apps);
                resizeUi();
                selectCurrentApp();
                return apps.length;
            } else {
                renderApps(container,users);
                container.append('<i>End Of List</i>');
                resizeUi();
                showApp();
                return 0;
            }
        }
    });

});