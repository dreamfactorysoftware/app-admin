/**roles.js
 * 
 */

var current_roles = null;
var selectRole = null;
var services = [];
var components = {};
var AllOption = '<option value="*">All</option>';
var nextSrvIndex = 0;

$(document).ready(function() {

	$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

    // set actions for button activation
    $(".ONKEYUP").keyup(makeClearable);
    $(".ONCHANGE").change(makeClearable);

    // highlight roles tab
    makeAdminNav('roles');

    buildAppsList();
    loadServices();

    $("#newrole").button({icons: {primary: "ui-icon-document"}}).click(function() {

        showRole(null);
    });

    $("#saverole").button({icons: {primary: "ui-icon-disk"}}).click(function() {

        try {
            if(selectRole) {
                updateRole();
            } else {
                createRole();
            }
        } catch (e) {
            alert(e);
        }
    });

    $("#deleterole").button({icons: {primary: "ui-icon-trash"}}).click(function() {

        if (selectRole) {
            $( "#deleteconf" ).html(selectRole.name);
            $( "#confirmDeleteRoleDialog" ).dialog('open');
        }
    });

    $( "#confirmDeleteRoleDialog" ).dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        buttons: {
            Continue: function() {
                deleteRole();
                showRole(null);
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $("#rolesList").dfSearchWidget({
        app: "admin",
        service: "System",
        resource: "/role",
        offsetHeight: 25,
        noSearchTerm: true,
        renderer: function(container,roles) {
            if(roles.length > 0) {
                current_roles = roles;
                renderRoles(container,roles);
                resizeUi();
                selectCurrentRole();
                return roles.length;
            } else {
                renderRoles(container,roles);
                container.append("<i>No roles...</i>");
                resizeUi();
                return 0;
            }
        }
    });

    $(window).bind('resize', function() {

        measureScrollbars();
    });

    $(".APP_SELECT_ALL").change(function(){

        var select = $(this).prop('checked');
        $(".APP_CBX").each(function(){
            $(this).prop('checked',select);
        });
    });

    $('#serviceSelect').change(serviceChange);

    $("#addService").button({text:false,icons: {primary: "ui-icon-plusthick"}}).click(addService);
});

//
// create role
//
function createRole() {

    var role = {};

    // get data from form
    getRoleFormData(role);

    selectRole = role;

    // create
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/role?app_name=admin',
        data:CommonUtilities.jsonRecords(role),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $('#rolesList').dfSearchWidget("go");
            }
            $("#saverole").button({ disabled: true });
            $("#savingDialog").dialog("close");
        },
        error:function (response) {

        }
    });
}

//
// update role
//
function updateRole() {

    // get data from form
    getRoleFormData(selectRole);

    // remove non-updateable fields
    delete selectRole.created_by_id;
    delete selectRole.created_date;
    delete selectRole.last_modified_by_id;
    delete selectRole.last_modified_date;

    // update
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/role?app_name=admin&method=MERGE',
        data:CommonUtilities.jsonRecords(selectRole),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $('#rolesList').dfSearchWidget("go");
            }
            $("#saverole").button({ disabled: true });
            $("#savingDialog").dialog("close");
        },
        error:function (response) {

        }
    });
}

//
// delete role
//
function deleteRole() {

    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/role/' + selectRole.id + "?app_name=admin&method=DELETE",
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $('#rolesList').dfSearchWidget("go");
            }
            $("#saverole").button({ disabled: true });
            $("#savingDialog").dialog("close");
        },
        error:function (response) {

        }
    });
}

function makeClearable() {

    $('#newrole').button({ disabled: false });
    $("#saverole").button({ disabled: false });
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

//
// Load list of services.
//
function loadServices() {

    services = [];
    components = {};

    $.ajax({
        dataType:'json',
        url:'http://' + location.host + '/rest/system/service',
        data:'app_name=admin&method=GET',
        cache:false,
        success:function (response) {
            if(!parseErrors(response)) {
                if(response.record) {
                    services = response.record;
                    var servicesMenu = $("#serviceSelect");
                    for(var i in services) {
                        var name = services[i].fields.name;
                        var label = services[i].fields.label;
                        var type = services[i].fields.type;
                        $('<option value="'+name+'">'+label+'</option>').appendTo(servicesMenu);
                        loadComponents(name, type);
                    }
                }
            }
        },
        error:function (response) {

        }
    });
}

//
// Load list of components for a service.
//
function loadComponents(serviceName, serviceType) {

    components[serviceName] = [];

    if (serviceType == "Native" || serviceType == "Local SQL DB" || serviceType == "Remote SQL DB") {
        $.ajax({
            dataType:'json',
            url:'http://' + location.host + '/rest/' + serviceName,
            data:'app_name=admin&method=GET',
            cache:false,
            success:function (response) {
                if(!parseErrors(response)) {
                    if(response.resource) {
                        components[serviceName] = response.resource;
                    }
                }
            },
            error:function (response) {
                alert("error "+ serviceName);
            }
        });
    }
}

function makeRoleButton(id,name,container) {

    container.append($('<button id="ROLE_'+id+'" class="role_button selector_btn cW100"><span id="DFRoleLabel_'+id+'">'+name+'</span></button>'));
}

function renderRoles(container,roles) {

    for(var i in roles) {
        makeRoleButton(i,roles[i].name,container);
    }
    $(".role_button").button({icons: {primary: "ui-icon-gear"}}).click(function(){
        if($(this).button( "option", "icons").secondary == undefined) {
            showRole(null);
            $(this).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
            showRole(current_roles[parseInt($(this).attr("id").substring("ROLE_".length))]);
        } else {
            showRole(null);
        }
    });
}

function resetRoles() {

    if(current_roles) {
        for(var i in current_roles) {
            $('#ROLE_'+i).button( "option", "icons", {primary: "ui-icon-gear"} );
        }
    }
}

function selectCurrentRole() {

    if(selectRole && current_roles) {
        for(var i in current_roles) {
            if(current_roles[i].name == selectRole.name) {
                $('#ROLE_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
                showRole(current_roles[i]);
                return;
            }
        }
    } else {
        showRole(null);
    }
}

function showRole(role) {

    selectRole = role;
    if(role) {
        $('#rName').val(role.name);
        $('#rDescription').val(role.description);
        $('#saverole').button({ disabled: true });
        $('#deleterole').button({ disabled: false });
        $('#newrole').button({ disabled: false });
    } else {
        resetRoles();
        $('#rName').val('');
        $('#rDescription').val('');
        $('#saverole').button({ disabled: false });
        $('#deleterole').button({ disabled: true });
        $('#newrole').button({ disabled: true });
    }
    $("#SELECT_ALL_APPS").prop('checked',false);
    selectApps(role);
    makeServiceList(role);
    measureScrollbars();
}

function makeServiceList(role) {

    $("#serviceSelect").val("*").trigger("onchange");
    $("#componentSelect").val("*");
    $("#SERVICE_ID_LIST").html("");
    nextSrvIndex = 0;
    if(role) {
        for(var i in role.services ) {
            $("#SERVICE_ID_LIST").append(makeServiceComponentLine(nextSrvIndex, role.services[i]));

            // services menu
            $('#serviceSelect_'+nextSrvIndex).change(serviceChange);

            // checkboxes
            $("#create_"+nextSrvIndex).change(makeClearable);
            $("#read_"+nextSrvIndex).change(makeClearable);
            $("#update_"+nextSrvIndex).change(makeClearable);
            $("#delete_"+nextSrvIndex).change(makeClearable);

            // delete button
            $('#REMOVE_SRV_'+nextSrvIndex).click(removeService);
            nextSrvIndex++;
        };
    }
}

function makeCheckBox(index, service, field) {

    return $('<div class="cLeft cW25"><input type="checkbox" value="true" title="' + field + '" id="' + field + '_'+index + '" '+ (service[field] ? "CHECKED":"")+'/></div>');
}

function makeServiceComponentLine(index, service) {

    // create major elements...
    var line = $('<div id="SRV_'+index+'" data-index="'+index+'" class="SERVICE_ITEM cBM1"/>');
    var fcolumn = $('<div class="cLeft cW30"/>');
    var scolumn = $('<div class="cLeft cW30 cLM1"/>');
    var tcolumn = $('<div class="cLeft cW30" align="center"/>');
    var srvSelect = $('<select id="serviceSelect_'+index+'" data-index="'+index+'" class="cW100" onchange="makeClearable()"/>');
    var compSelect = $('<select id="componentSelect_'+index+'" data-index="'+index+'" class="cW100" onchange="makeClearable()">');

    fcolumn.appendTo(line);
    scolumn.appendTo(line);
    tcolumn.appendTo(line);
    srvSelect.appendTo(fcolumn);
    compSelect.appendTo(scolumn);

    // create default options...
    $(AllOption).appendTo(srvSelect);
    $(AllOption).appendTo(compSelect);

    var selected = false;

    // populate service and component menus and set selections
    for(var i in services) {
        selected = service.service == services[i].fields.name;
        $('<option value="' + services[i].fields.name + '" ' + (selected ? "SELECTED":"") + '>' + services[i].fields.label + '</option>').appendTo(srvSelect);
        if(selected) {
            for(var j in components[services[i].fields.name]) {
                var cname = components[services[i].fields.name][j].name;
                $('<option value="' + cname + '" '+(service.component == cname ? "SELECTED":"") + '>' + cname +'</option>').appendTo(compSelect);
            }
        }
    }

    // check box elements...
    makeCheckBox(index, service, "create").appendTo(tcolumn);
    makeCheckBox(index, service, "read").appendTo(tcolumn);
    makeCheckBox(index, service, "update").appendTo(tcolumn);
    makeCheckBox(index, service, "delete").appendTo(tcolumn);

    $('<span class="ui-state-df-red"><span class="ui-icon ui-icon-closethick offTop3 cLM1" data-label="'+service.service+'" data-index="'+index+'" id="REMOVE_SRV_'+index+'" title="Remove From List"></span></span>').appendTo(line);
    $('<div class="cClear"><!--  --></div>').appendTo(tcolumn);
    $('<div class="cClear"><!--  --></div>').appendTo(line);

    return line;
}

function addService() {

    var $that = $(".SERVICE_ITEM");
    var exists = false;
    var psrv = $("#serviceSelect").val();
    var pcomp = $("#componentSelect").val();

    $that.each(function(index){
        var i = $(this).data("index");
        if(!exists) {
            var tsrv = $("#serviceSelect_" + i).val();
            var tcomp = $("#componentSelect_" + i).val();
            if(psrv == tsrv && pcomp == tcomp) {
                exists = true;
            }
        }
    });

    if(exists) {
        alert('There is already an entry for that service and component.');
    } else {
        var index = nextSrvIndex++;
        var obj = {
            service: psrv,
            component: pcomp,
            read:$('#read').prop('checked') ? 1 : 0,
            create:$('#create').prop('checked') ? 1 : 0,
            update:$('#update').prop('checked') ? 1 : 0,
            delete:$('#delete').prop('checked') ? 1 : 0
        };
        $("#SERVICE_ID_LIST").append(makeServiceComponentLine(index, obj));

        // services menu
        $('#serviceSelect_'+index).change(serviceChange);

        // checkboxes
        $("#create_"+index).change(makeClearable);
        $("#read_"+index).change(makeClearable);
        $("#update_"+index).change(makeClearable);
        $("#delete_"+index).change(makeClearable);

        // delete button
        $('#REMOVE_SRV_'+index).click(removeService);

        // reset template line
        $("#serviceSelect").val("*").trigger("onchange");
        $("#componentSelect").val("*");
        $('#read').prop('checked',false);
        $('#create').prop('checked',false);
        $('#update').prop('checked',false);
        $('#delete').prop('checked',false);

        if(selectRole) {
            getRoleFormData(selectRole);
            showRole(selectRole);
        }

        measureScrollbars();

        makeClearable();
    }
}

function removeService() {

    var $this = $(this);
    var index = $this.data("index");
    var label = $this.data("label");
    var c = confirm("Are you sure you want to remove the service '"+label+"' from the list? ");
    if(c) {
        $("#SRV_"+index).remove();
        if(selectRole) {
            getRoleFormData(selectRole);
            showRole(selectRole);
        }
        makeClearable();
    }
}

function serviceChange() {

    var index = parseInt($(this).data("index"));
    if(index < 0) {
        index = "";
    } else {
        index = "_"+index;
    }
    var $that = $("#componentSelect"+index);
    $that.html(AllOption);
    var comp = components[$(this).val()];
    if(comp) {
        for(var i in comp) {
            $('<option value="'+comp[i].name+'">'+comp[i].name+'</option>').appendTo($that);
        }
    }
}

function showApps(apps) {

    var con = $('#APP_ID_LIST');
    con.html('');
    for(var i in apps) {
        if(apps[i].id == undefined) continue;
        con.append('<div><input type="checkbox" name="APP_ID_'+apps[i].id+'" value="'+apps[i].id+'" class="APP_CBX"/>'+apps[i].label+'</div>');
    }

    $(".APP_CBX").change(makeClearable);
}

function selectApps(role) {

    $(".APP_CBX").each(function(){
        $(this).prop('checked',false);
    });
    if(role && role.app_ids) {
        var tmp = role.app_ids.split(",");
        for(var i in tmp) {
            var str = $.trim(tmp[i]);
            if(str.length > 0) {
                $("input[value='"+str+"']").prop('checked',true);
            }
        }
    }
}

function getRoleFormData(role) {

    role.name = $('#rName').val();
    role.description = $('#rDescription').val();
    role.services = getServices();
    role.app_ids = getSelectAppIds();
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

function getServices() {

    var result = [];
    $(".SERVICE_ITEM").each(function(index){
        var i = $(this).data("index");
        result[index] = {
            service:$("#serviceSelect_" + i).val(),
            component:$("#componentSelect_" + i).val(),
            create:$("#create_" + i).prop('checked') ? 1 : 0,
            read:$("#read_" + i).prop('checked')  ? 1 : 0,
            update:$("#update_" + i).prop('checked') ? 1 : 0,
            delete:$("#delete_" + i).prop('checked') ? 1 : 0
        };
    });
    return result;
}

function measureScrollbars() {

    $("#ServicesHeaders").css("width",$("#SERVICE_ID_LIST").width());
    $("#ServicesWidgets").css("width",$("#SERVICE_ID_LIST").width());
}