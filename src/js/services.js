/**
 * services.js
 */
var isPageDirty = false;
var selected_service_id = -1;
var current_service = null;
var selectService = null;

function makeServiceButton(id,name,container) {
	container.append($('<button id="SERV_'+id+'" class="service_button" style="width:100%;margin-top: 4px;"><span id="DFServiceLabel_'+id+'">'+name+'</span></button>'));
}

function renderServices(container,services) {
	for(var i = 0; i < services.length; i++) {
		if(!services[i]) continue;
		makeServiceButton(i,services[i].Label,container);
		if(selected_service_id > -1 && parseInt(services[i].Id) == selected_service_id) {
			selected_user = i;
			selected_service_id = -1;
		}
	}
	$('.service_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
		showService(null); // clear user selection
		$(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
		showService(current_service[parseInt($(this).attr('id').substring('SERV_'.length))]);
	});
}

function showService(service) {
	selectService = service;
	if(service) {
		$('input:text[name=Name]').val(service.Name);
		$('input:text[name=Label]').val(service.Label);
		if(service.IsActive == 'true') {
			$('input[name="IsActive"]')[0].checked = true;
		} else {
			$('input[name="IsActive"]')[1].checked = true;
		}
		
		$("#serviceType").val(service.Type);
		$("#serviceType").trigger('change');
		
		$('input:text[name=BaseUrl]').val(service.BaseUrl);
		$('textarea#HeaderList').val(service.HeaderList);
		$('textarea#ParamList').val(service.ParamList);
		//$('#active').buttonset('refresh');
		$("#save").button({ disabled: true });
	} else {
		if(current_service) {
			for(var i in current_service) {
				$('#SERV_'+i).button( "option", "icons", {primary: 'ui-icon-star', secondary:''} );
			}
		}
		$('input:text[name=Name]').val('');
		$('input:text[name=Label]').val('');
		
		$("#serviceType").val('');
		$("#serviceType").trigger('change');
		
		$('input:text[name=BaseUrl]').val('');
		$('textarea#HeaderList').val('');
		$('textarea#ParamList').val('');
		$('input[name="IsActive"]')[0].checked = true;
		//$('#active').buttonset('refresh');
		$('#save').button({ disabled: false });
	}
	if(service) {
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
	} else {
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
	
}

function makeClearable() {
	$('#clear').button({ disabled: false });
	$('#serviceList').dfPagerUI('disableAll');
	$("#save").button({ disabled: false });
}

var serviceio = new DFRequest({
	app: 'admin',
	service: "System",
	resource: '/Service',
	type: DFRequestType.POST,
	success: function(json) {
		var errorMsg = checkFailure(json);
		if(errorMsg) {
			$('#errorMsg').html(errorMsg);
			$('#errorDialog').dialog('open');
		} else {
			$('#serviceList').dfPager('fetch');
		}
		navControl(true);
		$("#save").button({ disabled: true });
		$('#serviceList').dfPagerUI('enableAll');
	},
	error: function(err) {
		$('#errorMsg').html(err);
		$('#errorDialog').dialog('open');
	}
});

function deleteService(confirmed) {
	if(selectService) {
		if(confirmed) {
			serviceio.deletes(selectService.Id);
		} else {
			$( "#deleteService" ).html(selectService.Label);
			$( "#confirmDeleteUserDialog" ).dialog('open');
		}
	}
}

function getForm(ws) {
	ws.Name = $('input:text[name=Name]').val();
	ws.Label = $('input:text[name=Label]').val();
	ws.Type = $('input:text[name=Type]').val();
	ws.BaseUrl = $('input:text[name=BaseUrl]').val();
	ws.HeaderList = $('textarea#HeaderList').val();
	ws.ParamList = $('textarea#ParamList').val();
	ws.IsActive = !$('input[name="IsActive"]')[1].checked;
}

$(document).ready(function() {
	
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	
	makeAdminNav('services');
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteService();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectService) {
			getForm(selectService);
			serviceio.update(selectService);
		} else {
			var service = {};
			getForm(service);
			serviceio.create(service);
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		navControl(true);
		$('#serviceList').dfPagerUI('enableAll');
		showService(null);
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
				deleteService(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	//$("#active").buttonset();
	//$("#sys_admin").buttonset();
	$("#WebOptions").hide();
	
	$('#serviceType').change(function(){
		switch($(this).val()) {
			case 'Native':
				$("#WebOptions").hide();
				break;
			case 'Managed':
				$("#WebOptions").hide();
				break;
			case 'Web':
				$("#WebOptions").show();
				break;
			default:
				$("#WebOptions").hide();
				break;
		}
	});
	
	$("#serviceList").dfPagerUI({
		app: "admin",
		service: "System",
		resource: "/Service",
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ["Id","Name"],
		renderer: function(container,json) {
			showService(null);
			var services = CommonUtilities.flattenResponse(json);
			if(services.length > 0) {
				current_service = services;
				renderServices(container,services);
				resizeUi();
				return services.length;
			} else {
				renderServices(container,services);
				container.append("<i>End Of List</i>");
				resizeUi();
				return 0;
			}
		}
	});
});