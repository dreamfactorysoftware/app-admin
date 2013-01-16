/**
 * appgroupsassign.js
 */
var isPageDirty = false;

var current_apps = null;
var current_grps = null;

var selected_grp_id = -1;
var selected_grp = -1;
var selected_app_id = -1;
var selected_app = -1;

var KEY_CHECKED = 'checked';
var KEY_REFRESH = 'refresh';

var TABLE_APPS = 'appsList';
var TABLE_APP_GRPS = 'appGrpList';

var ICON_APP_GRPS_LOCKED = 'ui-icon-arrowthick-1-e';
var ICON_APP_LOCKED = 'ui-icon-arrowthick-1-w';
var ICON_CHECK = 'ui-icon-check';
var ICON_ALERT = 'ui-icon-alert';
var ICON_CANCEL = 'ui-icon-cancel';
var ICON_REFERENCED = 'ui-icon-radio-on';

var locked_table = null;
var primary_record = -1;
var secondary_record = -1;

/** Logic to enable selector/multi-selector abilities */
function selectorLogic(index,table) {
	if(!locked_table) {
		locked_table = table;
		primary_record = index;
	} else if(locked_table == table) {
		if(primary_record == index) {
			locked_table = null;
			primary_record = null;
		} else {
			primary_record = index;
		}
	} else {
		secondary_record = index;
	}
}

function clickedApp(index) {
	selectorLogic(index,TABLE_APPS);
	doRefresh();
}

function clickedAppGrp(index) {
	selectorLogic(index,TABLE_APP_GRPS);
	doRefresh();
}

function markAppGrps() {
	for(var i in current_grps) {
		var appGrp = current_grps[i];
		var primary_ico = null;
		var secondary_ico = null;
		if(appGrp.isDirty) {
			primary_ico = ICON_ALERT;
		} else if(i == selected_grp) {
			primary_ico = ICON_REFERENCED;
		} else {
			primary_ico = 'ui-icon-gear'; //appGrp.getAppId() ? 'ui-icon-wrench' : 
		}
		if(locked_table == TABLE_APP_GRPS) {
			if(i == primary_record) {
				secondary_ico = ICON_APP_GRPS_LOCKED;
			}
		} else if(i == secondary_record) {
			if($('#APP_'+primary_record).hasClass('GID_'+appGrp.Id)) {
				$('#APP_'+primary_record).removeClass('GID_'+appGrp.Id);
				makeClearable();
			} else {
				addAppToGrp(primary_record,secondary_record);
				secondary_ico = ICON_CHECK;
			}
			secondary_record = null;
		} else {
			if($('#APP_'+primary_record).hasClass('GID_'+appGrp.Id)) {
				secondary_ico = ICON_CHECK;
			}
		}
		$('#APP_GRPS_'+i).button( "option", "icons", {primary: primary_ico, secondary: secondary_ico});
	}
}

function addAppToGrp(appIndex,appGrpIndex) {
	$('#APP_'+appIndex).addClass('GID_'+current_grps[appGrpIndex].Id);
	makeClearable();
}

function makeClearable() {
	$('#clearLists').button({ disabled: false });
	$("#save").button({ disabled: false });
}

function markApps() {
	for(var i = 0; i < current_apps.length; i++) {
		if(!current_apps[i]) continue;
		var user = current_apps[i];
		var primary_ico = null;
		var secondary_ico = null;
		if(user.isDirty) {
			secondary_ico = ICON_ALERT;
		} else if(i == selected_app) {
			secondary_ico = ICON_REFERENCED;
		} else {
			secondary_ico = 'ui-icon-star';
		}
		if(locked_table == TABLE_APPS) {
			if(i == primary_record) {
				primary_ico = ICON_APP_LOCKED;
			}
		} else if(i == secondary_record) {
			if(current_grps[primary_record]) {
				if($('#APP_'+secondary_record).hasClass('GID_'+current_grps[primary_record].Id)) {
					$('#APP_'+secondary_record).removeClass('GID_'+current_grps[primary_record].Id);
					makeClearable();
				} else {
					addAppToGrp(secondary_record,primary_record);
					primary_ico = ICON_CHECK;
				}
			}
			secondary_record = null;
		} else {
			if(current_grps[primary_record]) {
				if($('#APP_'+i).hasClass('GID_'+current_grps[primary_record].Id)) {
					primary_ico = ICON_CHECK;
				}
			}
		}
		$('#APP_'+i).button( "option", "icons", {primary: primary_ico, secondary: secondary_ico});
	}
}

function convertGrpIdsToClasses(grpIds) {
	var tmp = '';
	if(!grpIds || !grpIds.split) return "BARF";
	var roles = grpIds.split(',');
	var role = null;
	var i = 0;
	for(; i < roles.length; i++) {
		role = $.trim(roles[i]);
		if(role.length>0) tmp += ' GID_'+role;
	}
	return tmp;
}

function makeAppGrpButton(id,name,container) {
	container.append($('<button id="APP_GRPS_'+id+'" class="app_grp_button selector_btn cW100"><span id="DFRoleLabel_'+id+'">'+name+'</span></button>'));
}

function renderAppGrps(container,appGrps) {
	for(var i in appGrps) {
		makeAppGrpButton(i,appGrps[i].Name,container);
		if(selected_grp_id > -1 && parseInt(appGrps[i].Id) == selected_grp_id) {
			selected_grp_id = -1;
		}
	}
	$('.app_grp_button').button().click(function(){
		clickedAppGrp(parseInt($(this).attr('id').substring('APP_GRPS_'.length)));
	});
	doRefresh();
}

function makeAppButton(id,name,container,grpIds) {
	container.append($('<button id="APP_'+id+'" class="app_button '+convertGrpIdsToClasses(grpIds)+' selector_btn cW100"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

function renderApps(container,apps) {
	for(var i = 0; i < apps.length; i++) {
		if(!apps[i]) continue;
		makeAppButton(i,apps[i].Label,container,apps[i].AppGroupIds);
		if(selected_app_id > -1 && parseInt(apps[i].Id) == selected_app_id) {
			selected_app_id = -1;
		}
	}
	$('.app_button').button({icons: {secondary: "ui-icon-star"}}).click(function(){
		clickedApp(parseInt($(this).attr('id').substring('APP_'.length)));
	});
	doRefresh();
}

var refresh_to = null;
function doRefresh() {
	if(refresh_to) return;
	if(current_apps && current_grps) {
		markAppGrps();
		markApps();
	} else {
		refresh_to = window.setTimeout('refresh_to=null;doRefresh()',10);
	}
}

var reset_to = null;
function resetSelector(table) {
	if(reset_to) return;
	if(current_apps && current_grps && !refresh_to) {
		if(table == locked_table) {
			locked_table = null;
			primary_record = -1;
			secondary_record = -1;
		}
	} else {
		reset_to = window.setTimeout('reset_to=null;resetSelector()',10);
	}
}

function diableAllListControls() {
	$("#clearLists").button({ disabled: true });
	$("#save").button({ disabled: true });
}

function enableAllListControls() {
	$("#clearLists").button({ disabled: true });
	$("#save").button({ disabled: true });
}


$(document).ready(function() {
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	makeAdminNav('appgroupassign');
	
	$("#errorDialog").dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: false,
		buttons: {	}
	});
	
	$("#clearLists").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		$("#appGrpList").dfSearchWidget("go");
		$("#appsList").dfSearchWidget("go");
		diableAllListControls();
	});

	var appio = new DFRequest({
		app: 'admin',
		service: "System",
		resource: '/App',
		success: function(json,request) {
			parseErrors(json,errorHandler);
			$("#save").button({ disabled: true });
			$("#clearLists").button({ disabled: true });
		}
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		var changes = [];
		for(var i in current_apps) {
			var new_role_ids = [];
			var cl = $('#APP_'+i).attr('class').split(' ');
			for(var j in cl) {
				if(cl[j].indexOf('GID_') == 0) {
					new_role_ids[new_role_ids.length] = cl[j].substring(4);
				}
			}
			var tmp = '';
			for(var j in new_role_ids) {
				tmp += ','+new_role_ids[j];
			}
			if(tmp.length > 0) tmp += ',';
			if(tmp != current_apps[i].AppGroupIds) {
				current_apps[i].AppGroupIds = tmp;
				var tmp = current_apps[i];
				// purge unwanted updates

				delete tmp.CreatedById;
				delete tmp.CreatedDate;
				delete tmp.LastModifiedById;
				delete tmp.LastModifiedDate;
				delete tmp.Name;
				delete tmp.Description;
				delete tmp.IsActive;
				delete tmp.IsUrlExternal;
				delete tmp.Label;
				delete tmp.Url;
				
				changes[changes.length] = tmp;
			}
		}
		if(changes.length > 0) {
			appio.update(changes);
		}
	});
	
	$("#appsList").dfSearchWidget({
		app: "admin",
		service: "System",
		resource: "/App",
		offsetHeight: 25,
		noSearchTerm: true,
		renderer: function(container,apps) {
			resetSelector(TABLE_APPS);
			if(apps.length > 0) {
				current_apps = apps;
				renderApps(container,apps);
				resizeUi();
				return apps.length;
			} else {
				current_apps = [];
				renderApps(container,apps);
				container.append('<i>No Apps...</i>');
				resizeUi();
				return 0;
			}
			doRefresh();
		}
	});
	
	$("#appGrpList").dfSearchWidget({
		app: 'admin',
		service: "System",
		resource: '/AppGroup',
		offsetHeight: 25,
		noSearchTerm: true,
		renderer: function(container,app_grps) {
			resetSelector(TABLE_APP_GRPS);
			if(app_grps.length > 0) {
				current_grps = app_grps;
				renderAppGrps(container,app_grps);
				resizeUi();
				return app_grps.length;
			} else {
				current_grps = [];
				renderAppGrps(container,app_grps);
				container.append('<i>No app groups...</i>');
				return 0;
			}
			doRefresh();
		}
	});
	
	
	diableAllListControls();
});