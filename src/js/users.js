/**
 * users.js
 */
var isPageDirty = false;
var selected_user_id = -1;
var current_users = null;
var selectUser = null;

/**
 * 
 * @param id
 * @param name
 * @param container
 */
function makeUserButton(id,name,container) {
	container.append($('<button id="USER_'+id+'" class="user_button" style="width:100%;margin-top: 4px;"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

/**
 * 
 * @param container
 * @param users
 */
function renderUsers(container,users) {
	for(var i = 0; i < users.length; i++) {
		if(!users[i]) continue;
		makeUserButton(i,users[i].FullName,container);
		if(selected_user_id > -1 && parseInt(users[i].Id) == selected_user_id) {
			selected_user = i;
			selected_user_id = -1;
		}
	}
	$('.user_button').button({icons: {primary: "ui-icon-person"}}).click(function(){
		showUser(null); // clear user selection
		$(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
		showUser(current_users[parseInt($(this).attr('id').substring('USER_'.length))]);
	});
}

/**
 * 
 * @param user
 */
function showUser(user) {
	selectUser = user;
	if(user) {
		$('input:text[name=username]').val(user.UserName);
		$('input:text[name=fullname]').val(user.FullName);
		$('input:text[name=lastname]').val(user.LastName);
		$('input:text[name=firstname]').val(user.FirstName);
		$('input:text[name=email]').val(user.Email);
		$('input:text[name=phone]').val(user.Phone);
		if(user.IsActive == 'true') {
			$('input[name="isactive"]')[0].checked = true;
		} else {
			$('input[name="isactive"]')[1].checked = true;
		}
		if(user.IsSysAdmin == 'true') {
			$('input[name="issysadmin"]')[0].checked = true;
		} else {
			$('input[name="issysadmin"]')[1].checked = true;
		}
		$("#save").button({ disabled: true });
	} else {
		if(current_users) {
			for(var i in current_users) {
				$('#USER_'+i).button( "option", "icons", {primary: 'ui-icon-person', secondary:''} );
			}
		}
		$('input:text[name=username]').val('');
		$('input:text[name=fullname]').val('');
		$('input:text[name=lastname]').val('');
		$('input:text[name=firstname]').val('');
		$('input:text[name=email]').val('');
		$('input:text[name=phone]').val('');
		$('input[name="isactive"]')[1].checked = true;
		$('input[name="issysadmin"]')[1].checked = true;
		$('#save').button({ disabled: false });
	}
	
	if(user) {
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
	} else {
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
	
}

/**
 * 
 */
function makeClearable() {
	$('#clear').button({ disabled: false });
	$('#usersList').dfPagerUI('disableAll');
	$("#save").button({ disabled: false });
}

/**
 * 
 */
var dfio = new DFRequest({
	app: "admin",
	service: "System",
	resource: "/User",
	type: DFRequestType.POST,
	success: function(json) {
		var errorMsg = checkFailure(json);
		if(errorMsg) {
			$('#errorMsg').html(errorMsg);
			$('#errorDialog').dialog('open');
		} else {
			$('#usersList').dfPager('fetch');
		}
		$("#save").button({ disabled: true });
		$('#usersList').dfPagerUI('enableAll');
	},
	error: function(err) {
		$('#errorMsg').html(err);
		$('#errorDialog').dialog('open');
	}
});

/**
 * 
 * @param obj
 */
function pullFormData(obj) {
	obj.UserName  = $('input:text[name=username]').val();
	obj.FullName  = $('input:text[name=fullname]').val();
	obj.LastName  = $('input:text[name=lastname]').val();
	obj.FirstName = $('input:text[name=firstname]').val();
	obj.Email     = $('input:text[name=email]').val();
	obj.Phone     = $('input:text[name=phone]').val();
	
	if($('input[name="isactive"]')[1].checked) {
		obj.IsActive = 'false';
	} else {
		obj.IsActive = 'true';
	}
	
	if($('input[name="issysadmin"]')[1].checked) {
		obj.IsSysAdmin = 'false';
	} else {
		obj.IsSysAdmin = 'true';
	}
	
	// make sure we are not sending back unused data
	obj.CreatedById      = null;
	obj.CreatedDate      = null;
	obj.LastModifiedDate = null;
	obj.LastModifiedById = null;
	obj.ConfirmCode      = null;
}

/**
 * 
 */
function deleteUser(confirmed) {
	if(selectUser) {
		if(confirmed) {
			dfio.deletes(selectUser.Id);
		} else {
			$( "#deleteUser" ).html(selectUser.FullName);
			$( "#confirmDeleteUserDialog" ).dialog('open');
		}
	}
}

$(document).ready(function() {
	
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	
	makeAdminNav('index');
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteUser();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectUser) {
			pullFormData(selectUser);
			dfio.update(selectUser);
		} else {
			var user = {};
			pullFormData(user);
			dfio.create(user);
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		$('#usersList').dfPagerUI('enableAll');
		showUser(null);
	});
	
	$("#errorDialog").dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: false,
		buttons: {	}
	});
	
	$( "#confirmDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				refreshList(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$( "#confirmDeleteUserDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				deleteUser(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$("#usersList").dfPagerUI({
		app: "admin",
		service: "System",
		resource: "/User",
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ["Id","LastName","FirstName"],
		renderer: function(container,json) {
			showUser(null);
			var users = CommonUtilities.flattenResponse(json);
			if(users.length > 0) {
				current_users = users;
				renderUsers(container,users);
				resizeUi();
				return users.length;
			} else {
				renderUsers(container,users);
				container.append("<i>End Of List</i>");
				resizeUi();
				return 0;
			}
		}
	});
});