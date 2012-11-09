/**
 * roleassign.js
 */
var isPageDirty = false;

var current_users = null;
var current_roles = null;

var selected_role_id = -1;
var selected_role = -1;
var selected_user_id = -1;
var selected_user = -1;

var KEY_CHECKED = 'checked';
var KEY_REFRESH = 'refresh';

var TABLE_USERS = 'users';
var TABLE_ROLES = 'roles';

var ICON_ROLE_LOCKED = 'ui-icon-arrowthick-1-e';
var ICON_USER_LOCKED = 'ui-icon-arrowthick-1-w';
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

function clickedUser(index) {
	selectorLogic(index,TABLE_USERS);
	doRefresh();
}

function clickedRole(index) {
	selectorLogic(index,TABLE_ROLES);
	doRefresh();
}

function markRoles() {
	for(var i in current_roles) {
		var role = current_roles[i];
		var primary_ico = null;
		var secondary_ico = null;
		if(role.isDirty) {
			primary_ico = ICON_ALERT;
		} else if(i == selected_role) {
			primary_ico = ICON_REFERENCED;
		} else {
			primary_ico = role.AppId ? 'ui-icon-wrench' : 'ui-icon-gear';
		}
		if(locked_table == TABLE_ROLES) {
			if(i == primary_record) {
				secondary_ico = ICON_ROLE_LOCKED;
			}
		} else if(i == secondary_record) {
			if($('#USER_'+primary_record).hasClass('RID_'+role.Id)) {
				$('#USER_'+primary_record).removeClass('RID_'+role.Id);
				makeClearable();
			} else {
				addRoleToUser(primary_record,secondary_record);
				secondary_ico = ICON_CHECK;
			}
			secondary_record = null;
		} else {
			if($('#USER_'+primary_record).hasClass('RID_'+role.Id)) {
				secondary_ico = ICON_CHECK;
			}
		}
		$('#ROLE_'+i).button( "option", "icons", {primary: primary_ico, secondary: secondary_ico});
	}
}

function addRoleToUser(userIndex,roleIndex) {
	var role = current_roles[roleIndex];
	var app_id = parseInt(role.AppId);
	for(var i in current_roles) {
		if(app_id == parseInt(current_roles[i].AppId)) {
			if($('#USER_'+userIndex).hasClass('RID_'+current_roles[i].Id)) {
				if(i < roleIndex) {
					var icos = $('#ROLE_'+i).button( "option", "icons");
					$('#ROLE_'+i).button( "option", "icons", {primary: icos.primary, secondary: ''});
				}
				$('#USER_'+userIndex).removeClass('RID_'+current_roles[i].getId());
			}
		}
	}
	$('#USER_'+userIndex).addClass('RID_'+role.Id);
	
	makeClearable();
}

function makeClearable() {
	$('#clearLists').button({ disabled: false });
	$('#rolesList').dfPagerUI('disableAll');
	$('#usersList').dfPagerUI('disableAll');
	$("#save").button({ disabled: false });
}

function markUsers() {
	for(var i = 0; i < current_users.length; i++) {
		if(!current_users[i]) continue;
		var user = current_users[i];
		var primary_ico = null;
		var secondary_ico = null;
		if(user.isDirty) {
			secondary_ico = ICON_ALERT;
		} else if(i == selected_user) {
			secondary_ico = ICON_REFERENCED;
		} else {
			secondary_ico = 'ui-icon-person';
		}
		if(locked_table == TABLE_USERS) {
			if(i == primary_record) {
				primary_ico = ICON_USER_LOCKED;
			}
		} else if(i == secondary_record) {
			if(current_roles[primary_record]) {
				if($('#USER_'+secondary_record).hasClass('RID_'+current_roles[primary_record].Id)) {
					$('#USER_'+secondary_record).removeClass('RID_'+current_roles[primary_record].Id);
					makeClearable();
				} else {
					addRoleToUser(secondary_record,primary_record);
					primary_ico = ICON_CHECK;
				}
			}
			secondary_record = null;
		} else {
			if(current_roles[primary_record]) {
				if($('#USER_'+i).hasClass('RID_'+current_roles[primary_record].Id)) {
					primary_ico = ICON_CHECK;
				}
			}
		}
		$('#USER_'+i).button( "option", "icons", {primary: primary_ico, secondary: secondary_ico});
	}
}

function convertRoleIdsToClasses(roleIds) {
	var tmp = '';
	if(!roleIds || !roleIds.split) return "BARF";
	var roles = roleIds.split(',');
	var role = null;
	var i = 0;
	for(; i < roles.length; i++) {
		role = $.trim(roles[i]);
		if(role.length>0) tmp += ' RID_'+role;
	}
	return tmp;
}

function makeRoleButton(id,name,container) {
	container.append($('<button id="ROLE_'+id+'" class="role_button" style="width:100%;margin-top: 4px;"><span id="DFRoleLabel_'+id+'">'+name+'</span></button>'));
}

function renderRoles(container,roles) {
	for(var i in roles) {
		makeRoleButton(i,roles[i].Name,container);
		if(selected_role_id > -1 && parseInt(roles[i].Id) == selected_role_id) {
			selected_role_id = -1;
		}
	}
	$('.role_button').button().click(function(){
		clickedRole(parseInt($(this).attr('id').substring('ROLE_'.length)));
	});
	doRefresh();
}

function makeUserButton(id,name,container,roleIds) {
	container.append($('<button id="USER_'+id+'" class="user_button '+convertRoleIdsToClasses(roleIds)+'" style="width:100%;margin-top: 4px;"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

function renderUsers(container,users) {
	for(var i = 0; i < users.length; i++) {
		if(!users[i]) continue;
		makeUserButton(i,users[i].FullName,container,users[i].RoleIds);
		if(selected_user_id > -1 && parseInt(users[i].Id) == selected_user_id) {
			selected_user_id = -1;
		}
	}
	$('.user_button').button({icons: {secondary: "ui-icon-person"}}).click(function(){
		clickedUser(parseInt($(this).attr('id').substring('USER_'.length)));
	});
	doRefresh();
}

var refresh_to = null;

function doRefresh() {
	if(refresh_to) return;
	if(current_users && current_roles) {
		markRoles();
		markUsers();
	} else {
		refresh_to = window.setTimeout('refresh_to=null;doRefresh()',10);
	}
}

var reset_to = null;

function resetSelector(table) {
	if(reset_to) return;
	if(current_users && current_roles && !refresh_to) {
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

	makeAdminNav('roleassign');
	
	var userio = new DFRequest({
		app: 'admin',
		service: "System",
		resource: '/User',
		type: DFRequestType.POST,
		action: DFRequestActions.UPDATE,
		success: function(json) {
			var errorMsg = checkFailure(json);
			if(errorMsg) {
				$('#errorMsg').html(errorMsg);
				$('#errorDialog').dialog('open');
			}
			$("#save").button({ disabled: true });
			$("#clearLists").button({ disabled: true });
			$('#usersList').dfPagerUI('enableAll');
			$('#rolesList').dfPagerUI('enableAll');
		},
		error: function(err) {
			$('#errorMsg').html(err);
			$('#errorDialog').dialog('open');
   		}
	});
	
	$("#clearLists").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		var users = $('#usersList').dfPagerUI('getUIContainer');
		users.html('');
		renderUsers(users,current_users);
		var roles = $('#rolesList').dfPagerUI('getUIContainer');
		roles.html('');
		renderRoles(roles,current_roles);
		resizeUi();
		$('#usersList').dfPagerUI('enableAll');
		$('#rolesList').dfPagerUI('enableAll');
		diableAllListControls();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		var changes = [];
		for(var i in current_users) {
			var new_role_ids = [];
			var cl = $('#USER_'+i).attr('class').split(' ');
			for(var j in cl) {
				if(cl[j].indexOf('RID_') == 0) {
					new_role_ids[new_role_ids.length] = cl[j].substring(4);
				}
			}
			var tmp = '';
			for(var j in new_role_ids) {
				tmp += ','+new_role_ids[j];
			}
			if(tmp.length > 0) tmp += ',';
			if(tmp != current_users[i].RoleIds) {
				current_users[i].RoleIds = tmp;
				changes[changes.length] = current_users[i];
			}
		}
		if(changes.length > 0) {
			userio.update(changes);
		}
	});
	
	
	$('#usersList').dfPagerUI({
		app: 'admin',
		service: "System",
		resource: '/User',
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ['Id','LastName','FirstName'],
		renderer: function(container,json) {
			resetSelector(TABLE_USERS);
			var users = CommonUtilities.flattenResponse(json);
			if(users.length > 0) {
				current_users = users;
				renderUsers(container,users);
				resizeUi();
				return users.length;
			} else {
				current_users = [];
				renderUsers(container,users);
				container.append('<i>End Of List</i>');
				resizeUi();
				return 0;
			}
			doRefresh();
		}
	});
	
	$('#rolesList').dfPagerUI({
		app: 'admin',
		service: "System",
		resource: '/Role',
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ['Id','AppId','Name'],
		renderer: function(container,json) {
			resetSelector(TABLE_ROLES);
			var roles = CommonUtilities.flattenResponse(json);
			if(roles.length > 0) {
				current_roles = roles;
				renderRoles(container,roles);
				resizeUi();
				return roles.length;
			} else {
				current_roles = [];
				renderRoles(container,roles);
				container.append('<i>End Of List</i>');
				return 0;
			}
			doRefresh();
		}
	});
	
	diableAllListControls();
});