/**
 * appgroups.js
 */

var current_app_grps = null;
var selectAppGrp = null;
var current_apps = null;

$(document).ready(function() {

    // set actions for button activation
    $(".ONKEYUP").keyup(makeClearable);
    $(".ONCHANGE").change(makeClearable);

    // highlight app groups tab
    makeAdminNav('appgroups');

    buildAppsList();

    // new app group button
    $("#new").button({icons: {primary: "ui-icon-document"}}).click(function() {

        showAppGrp(null);
    });

    // save app group button
    $("#save").button({icons: {primary: "ui-icon-disk"}}).click(function() {

        try {
            if(selectAppGrp) {
                updateAppGrp();
            } else {
                createAppGrp();
            }
        } catch (e) {
            alert(e);
        }
    });

    // delete app group button
    $("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function() {

        if (selectAppGrp) {
            $( "#deleteAppGrp" ).html(selectAppGrp.label);
            $( "#confirmDeleteAppGrpDialog" ).dialog('open');
        }
    });

    // delete app group confirmation dialog
    $( "#confirmDeleteAppGrpDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				deleteAppGrp();
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});

	$("#AppType").buttonset();
	$("#active").buttonset();

	$("#appGrpList").dfSearchWidget({
		app: 'admin',
		service: "System",
		resource: '/app_group',
		offsetHeight: 25,
		noSearchTerm: true,
		renderer: function(container,apps) {
			if(apps.length > 0) {
				current_app_grps = apps;
				renderAppGrps(container,apps);
				resizeUi();
				selectCurrentAppGrp();
				return apps.length;
			} else {
                renderAppGrps(container,apps);
				container.append('<i>No App groups...</i>');
				resizeUi();
				showAppGrp(null);
				return 0;
			}
		}
	});
});

//
// create app group
//
function createAppGrp() {

    var appGrp = {};

    // get data from form
    getAppGrpFormData(appGrp);

    selectAppGrp = appGrp;

    // create
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/app_group?app_name=admin',
        data:CommonUtilities.jsonRecords(selectAppGrp),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#appGrpList").dfSearchWidget('go');
            }
            $("#save").button({ disabled: true });
            $('#savingDialog').dialog('close');
        },
        error:function (response) {

        }
    });
}

//
// update app group
//
function updateAppGrp() {

    // get data from form
    getAppGrpFormData(selectAppGrp);

    // remove non-updateable fields
    delete selectAppGrp.created_by_id;
    delete selectAppGrp.created_date;
    delete selectAppGrp.last_modified_by_id;
    delete selectAppGrp.last_modified_date;

    // update
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/app_group?app_name=admin&method=MERGE',
        data:CommonUtilities.jsonRecords(selectAppGrp),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#appGrpList").dfSearchWidget('go');
            }
            $("#save").button({ disabled: true });
            $('#savingDialog').dialog('close');
        },
        error:function (response) {

        }
    });
}

//
// Delete app group
//
function deleteAppGrp() {

    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/app_group/' + selectAppGrp.id + '?app_name=admin&method=DELETE',
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#appGrpList").dfSearchWidget('go');
            }
            $("#save").button({ disabled: true });
            $('#savingDialog').dialog('close');
        },
        error:function (response) {

        }
    });
}

function makeClearable() {

    $('#new').button({ disabled: false });
    $("#save").button({ disabled: false });
}

//
// Build the list of applications to select from.
//
function buildAppsList() {

    $.ajax({
        dataType:'json',
        url:'http://' + location.host + '/rest/system/app',
        data:'app_name=admin&method=GET',
        cache:false,
        success:function (response) {
            if(!parseErrors(response)) {
                current_apps = CommonUtilities.flattenResponse(response);
                showApps(current_apps);
            }
        },
        error:function (response) {

        }
    });
}

function makeAppGrpButton(id,name,container) {

    container.append($('<button id="APP_GRP_'+id+'" class="app_grp_button selector_btn cW100"><span id="DFAppGrpLabel_'+id+'">'+name+'</span></button>'));
}

function renderAppGrps(container,appGrp) {

    for(var i = 0; i < appGrp.length; i++) {
        if(!appGrp[i]) continue;
        makeAppGrpButton(i,appGrp[i].name,container);
    }
    $('.app_grp_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
        showAppGrp(null); // clear app group selection
        $(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
        showAppGrp(current_app_grps[parseInt($(this).attr('id').substring('APP_GRP_'.length))]);
    });
}

function selectCurrentAppGrp() {

    if(selectAppGrp && current_app_grps) {
        for(var i in current_app_grps) {
            if(current_app_grps[i].name == selectAppGrp.name) {
                $('#APP_GRP_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
                showAppGrp(current_app_grps[i]);
                return;
            }
        }
    } else {
        showAppGrp(null);
    }
}

function showAppGrp(appGrp) {

    selectAppGrp = appGrp;
    if(appGrp) {
        $('input:text[name=Name]').val(appGrp.name);
        $('input:text[name=Description]').val(appGrp.description);
        $("#save").button({ disabled: true });
        $('#delete').button({ disabled: false });
        $('#new').button({ disabled: false });
    } else {
        if(current_app_grps) {
            for(var i in current_app_grps) {
                $('#APP_GRP_'+i).button( "option", "icons", {primary: 'ui-icon-star', secondary:''} );
            }
        }
        $('input:text[name=Name]').val('');
        $('input:text[name=Description]').val('');
        $('#save').button({ disabled: false });
        $('#delete').button({ disabled: true });
        $('#new').button({ disabled: true });
    }
    selectApps(appGrp);
}

function selectAllApps(cb) {

    var select = $(cb).prop('checked');
    $(".APP_CBX").each(function(){
        $(this).prop('checked',select);
    });
}

function showApps(apps) {

    var con = $('#APP_ID_LIST');
    con.html('');
    for(var i in apps) {
        con.append('<div><input type="checkbox" name="APP_ID_'+apps[i].id+'" value="'+apps[i].id+'" data-groups="'+apps[i].app_group_ids+'" class="APP_CBX" onchange="makeClearable()"/>'+apps[i].label+'</div>');
    }
}

function selectApps(grp) {

    $(".APP_CBX").each(function(){
        var tmp = $(this).data("groups");
        var selected = false;
        if(tmp && grp) {
            var atmp = tmp.split(",");
            for(var i in atmp) {
                var value = $.trim(atmp[i]);
                if(value) {
                    if(value == grp.id) {
                        selected = true;
                        break;
                    }
                }
            }
        }
        $(this).prop('checked',selected);
    });
}

function selectAllApps(cb) {

    var select = $(cb).prop('checked');
    $(".APP_CBX").each(function(){
        $(this).prop('checked',select);
    });
}

function getSelectAppIds() {

    var str = "";
    $(".APP_CBX").each(function(){
        if($(this).prop('checked')) {
            if(str.length == 0) str += ",";
            str += $(this).val();
            str += ",";
        }
    });
    return str;
}

function getAppGrpFormData(grp) {

    grp.name = $('input:text[name=Name]').val();
    grp.description = $('input:text[name=Description]').val();
    grp.app_ids = getSelectAppIds();
}
