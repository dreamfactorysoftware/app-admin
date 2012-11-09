/**
 * appgroups.js
 */
var isPageDirty = false;
	
var selected_app_grp_id = -1;
var current_app_grps = null;
var selectAppGrp = null;

function makeAppGrpButton(id,name,container) {
	container.append($('<button id="APP_GRP_'+id+'" class="app_grp_button" style="width:100%;margin-top: 4px;"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

function renderApps(container,appGrp) {
	for(var i = 0; i < appGrp.length; i++) {
		if(!appGrp[i]) continue;
		makeAppGrpButton(i,appGrp[i].Name,container);
		if(selected_app_grp_id > -1 && parseInt(appGrp[i].Id) == selected_app_grp_id) {
			selected_app_grp_id = -1;
		}
	}
	$('.app_grp_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
		showAppGrp(null); // clear user selection
		$(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
		showAppGrp(current_app_grps[parseInt($(this).attr('id').substring('APP_GRP_'.length))]);
	});
}

function showAppGrp(appGrp) {
	selectAppGrp = appGrp;
	if(appGrp) {
		$('input:text[name=Name]').val(appGrp.Name);
		$('input:text[name=Description]').val(appGrp.Description);
		$("#save").button({ disabled: true });
	} else {
		if(current_app_grps) {
			for(var i in current_app_grps) {
				$('#APP_GRP_'+i).button( "option", "icons", {primary: 'ui-icon-star', secondary:''} );
			}
		}
		$('input:text[name=Name]').val('');
		$('input:text[name=Description]').val('');
		$('#save').button({ disabled: false });
	}
	if(appGrp) {
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
	} else {
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
}

function makeClearable() {
	$('#clear').button({ disabled: false });
	$('#appGrpList').dfPagerUI('disableAll');
	$("#save").button({ disabled: false });
}

var appgrpio = new DFRequest({
	app: 'admin',
	service: "System",
	resource: '/AppGroup',
	type: DFRequestType.POST,
	success: function(json) {
		var errorMsg = checkFailure(json);
		if(errorMsg) {
			$('#errorMsg').html(errorMsg);
			$('#errorDialog').dialog('open');
		} else {
			$('#appGrpList').dfPager('fetch');
		}
		$("#save").button({ disabled: true });
		$('#appGrpList').dfPagerUI('enableAll');
		$('#savingDialog').dialog('close');
	},
	error: function(err) {
		$('#savingDialog').dialog('close');
		$('#errorMsg').html(err);
		$('#errorDialog').dialog('open');
	}
});

function deleteAppGrp(confirmed) {
	if(selectAppGrp) {
		if(confirmed) {
			appgrpio.deletes(selectAppGrp.Id);
		} else {
			$( "#deleteAppGrp" ).html(selectAppGrp.Name);
			$( "#confirmDeleteAppGrpDialog" ).dialog('open');
		}
	}
}

function getForm(grp) {
	grp.Name = $('input:text[name=Name]').val();
	grp.Description = $('input:text[name=Description]').val();
}

$(document).ready(function() {
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	makeAdminNav('appgroups');
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteAppGrp();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectAppGrp) {
			getForm(selectAppGrp);
			appgrpio.update(selectAppGrp);
		} else {
			var appGrp = {};
			getForm(appGrp);
			appgrpio.create(appGrp);
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		$('#appGrpList').dfPagerUI('enableAll');
		showAppGrp(null);
	});
	
	$("#savingDialog").dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: false,
		buttons: {	}
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
	
	$( "#confirmDeleteAppGrpDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				deleteAppGrp(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$("#AppType").buttonset();
	$("#active").buttonset();
	
	$('#appGrpList').dfPagerUI({
		app: 'admin',
		service: "System",
		resource: '/AppGroup',
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ['Id'],
		renderer: function(container,json) {
			showAppGrp(null);
			var apps = CommonUtilities.flattenResponse(json);
			if(apps.length > 0) {
				current_app_grps = apps;
				renderApps(container,apps);
				resizeUi();
				return apps.length;
			} else {
				renderApps(container,users);
				container.append('<i>End Of List</i>');
				resizeUi();
				return 0;
			}
		}
	});
});