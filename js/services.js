/**
 * services.js
 */

var current_service = null;
var selectService = null;

$(document).ready(function() {

    // set actions for button activation
    $(".ONKEYUP").keyup(makeClearable);
    $(".ONCHANGE").change(makeClearable);

    // highlight services tab
    makeAdminNav('services');

    // new button
    $("#new").button({icons: {primary: "ui-icon-document"}}).click(function() {

        showService(null);
    });

    // save button
    $("#save").button({icons: {primary: "ui-icon-disk"}}).click(function() {

        try {
            if(selectService) {
                updateService();
            } else {
                createService();
            }
        } catch (e) {
            alert(e);
        }
    });

    // delete button
    $("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function() {

        if (selectService) {
            $( "#deleteService" ).html(selectService.label);
            $( "#confirmDeleteServiceDialog" ).dialog('open');
        }
    });

    // delete service confirmation dialog
    $( "#confirmDeleteServiceDialog" ).dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        buttons: {
            Continue: function() {
                deleteService();
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $("#WebOptions").hide();
    $("#FileOptions").hide();
    $("#RemoteFileOptions").hide();

    $('#serviceType').change(function(){
        switch($(this).val()) {
            case 'Local File Storage':
                $("#FileOptions").show();
                $("#RemoteFileOptions").hide();
                $("#WebOptions").hide();
                break;
            case 'Remote File Storage':
                $("#FileOptions").show();
                $("#RemoteFileOptions").show();
                $("#WebOptions").hide();
                break;
            case 'Remote Web Service':
                $("#FileOptions").hide();
                $("#RemoteFileOptions").hide();
                $("#WebOptions").show();
                break;
            case 'Native':
            default:
                $("#FileOptions").hide();
                $("#RemoteFileOptions").hide();
                $("#WebOptions").hide();
                break;
        }
    });

    $("#serviceList").dfSearchWidget({
        app: "admin",
        service: "System",
        resource: "/service",
        offsetHeight: 25,
        noSearchTerm: true,
        renderer: function(container,services) {
            if(services.length > 0) {
                current_service = services;
                renderServices(container,services);
                resizeUi();
                selectCurrentService();
                return services.length;
            } else {
                renderServices(container,services);
                container.append("<i>No services...</i>");
                resizeUi();
                showService(null);
                return 0;
            }
        }
    });
});

//
// create service
//
function createService() {

    var service = {};

    // get data from form
    getServiceFormData(service);

    selectService = service;

    // create
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/service?app_name=admin',
        data:CommonUtilities.jsonRecords(service),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#serviceList").dfSearchWidget('go');
            }
            $("#save").button({ disabled: true });
        },
        error:function (response) {

        }
    });
}

//
// update service
//
function updateService() {

    // get data from form
    getServiceFormData(selectService);

    // remove non-updateable fields
    delete selectService.created_by_id;
    delete selectService.created_date;
    delete selectService.last_modified_by_id;
    delete selectService.last_modified_date;

    // update
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/service?app_name=admin&method=MERGE',
        data:CommonUtilities.jsonRecords(selectService),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#serviceList").dfSearchWidget('go');
            }
            $("#save").button({ disabled: true });
        },
        error:function (response) {

        }
    });
}

//
// delete service
//
function deleteService() {

    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/service/' + selectService.id + "?app_name=admin&method=DELETE",
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $("#serviceList").dfSearchWidget('go');
                showService(null);
            }
            $("#save").button({ disabled: true });
        },
        error:function (response) {

        }
    });
}

function makeClearable() {

    $('#new').button({ disabled: false });
    $("#save").button({ disabled: false });
}

function makeServiceButton(id,name,container) {

	container.append($('<button id="SERV_'+id+'" class="service_button selector_btn cW100"><span id="DFServiceLabel_'+id+'">'+name+'</span></button>'));
}

function renderServices(container,services) {

	for(var i = 0; i < services.length; i++) {
		if(!services[i]) continue;
		makeServiceButton(i,services[i].label,container);
	}
	$('.service_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
		showService(null); // clear service selection
		$(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
		showService(current_service[parseInt($(this).attr('id').substring('SERV_'.length))]);
	});
}

function selectCurrentService() {

	if(selectService && current_service) {
		for(var i in current_service) {
			if(current_service[i].name == selectService.name) {
				$('#SERV_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
				showService(current_service[i]);
				return;
			}
		}
	} else {
		showService(null);
	}
}

function showService(service) {

	selectService = service;
	if(service) {
		$('input:text[name=Name]').val(service.name);
		$('input:text[name=Label]').val(service.label);
		if(service.is_active) {
			$('input[name="IsActive"]')[0].checked = true;
		} else {
			$('input[name="IsActive"]')[1].checked = true;
		}
		
		$("#serviceType").val(service.type);
		$("#serviceType").trigger('change');
		
        $("#storageType").val(service.storage_type);
   		$("#storageType").trigger('changeStorage');
        $('input:text[name=StorageName]').val(service.storage_name);
        $('#Credentials').val(service.credentials);

        $('input:text[name=BaseUrl]').val(service.base_url);
		$('#HeaderList').val(service.headers);
		$('#ParamList').val(service.parameters);
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
		
        $("#storageType").val('');
   		$("#storageType").trigger('changeStorage');
        $('input:text[name=StorageName]').val('');
        $('#Credentials').val('');

		$('input:text[name=BaseUrl]').val('');
		$('#HeaderList').val('');
		$('#ParamList').val('');
		$('input[name="IsActive"]')[0].checked = true;
		//$('#active').buttonset('refresh');
		$('#save').button({ disabled: false });
	}
	if(service) {
		$('#delete').button({ disabled: false });
		$('#new').button({ disabled: false });
	} else {
		$('#delete').button({ disabled: true });
		$('#new').button({ disabled: true });
	}
	
}

function getServiceFormData(ws) {

	ws.name = $('input:text[name=Name]').val();
	ws.label = $('input:text[name=Label]').val();
	ws.type = $("#serviceType").val();
	ws.base_url = $('input:text[name=BaseUrl]').val();
	ws.headers = $('#HeaderList').val();
	ws.parameters = $('#ParamList').val();
	ws.is_active = !$('input[name="IsActive"]')[1].checked;
    ws.storage_name = $('input:text[name=StorageName]').val();
    ws.storage_type = $("#storageType").val();
   	ws.credentials = $('#Credentials').val();
}
