/**
 * apps.js
 */
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
		makeAppButton(i,apps[i].Label,container);
		if(selected_app_id > -1 && parseInt(apps[i].Id) == selected_app_id) {
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
			if(current_apps[i].Name == selectApp) {
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
		$('input:text[name=Name]').val(app.Name);
		$('input:text[name=Label]').val(app.Label);
		$('input:text[name=Description]').val(app.Description);
		$('input:text[name=Url]').val(app.Url);
		if(app.IsActive == "true") {
			$('input[name="IsActive"]')[0].checked = true;
		} else {
			$('input[name="IsActive"]')[1].checked = true;
		}
		if(app.IsUrlExternal == "true") {
			$('input[name="IsUrlExternal"]')[0].checked = true;
		} else {
			$('input[name="IsUrlExternal"]')[1].checked = true;
		}
		$("#save").button({ disabled: true });
		if(app.IsUrlExternal == "true") {
			$("#filemanager").button({ disabled: true });
		} else {
			$("#filemanager").button({ disabled: false });
		}
		hideImport();
		$("#export").button({ disabled: false });
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
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
		showImport();
		$("#filemanager").button({ disabled: true });
		$("#export").button({ disabled: true });
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
}

/**
 * 
 */
function makeClearable() {
	$('#clear').button({ disabled: false });
	$('#appsList').dfPagerUI('disableAll');
	$("#save").button({ disabled: false });
}

/**
 * 
 */
var appio = new DFRequest({
	app: "admin",
	service: "System",
	resource: "/App",
	success: function(json) {
		var errorMsg = checkFailure(json);
		if(errorMsg) {
			$('#errorMsg').html(errorMsg);
			$('#errorDialog').dialog('open');
		} else {
			$('#appsList').dfPager('fetch');
		}
		$("#save").button({ disabled: true });
		$('#appsList').dfPagerUI('enableAll');
	},
	error: function(d1,d2) {
		$('#errorMsg').html(d1+" "+d2);
		$('#errorDialog').dialog('open');
	}
});

/**
 * 
 * @param confirmed
 */
function deleteApp(confirmed) {
	if(selectApp) {
		if(confirmed) {
			appio.deletes(selectApp.Id);
			showApp();
		} else {
			$( "#deleteApp" ).html(selectApp.Label);
			$( "#confirmDeleteAppDialog" ).dialog('open');
		}
	}
}

/**
 * 
 * @param app
 */
function getForm(app) {
	app.Name = $('input:text[name=Name]').val();
	app.Label = $('input:text[name=Label]').val();
	app.Description = $('input:text[name=Description]').val();
	app.Url = $('input:text[name=Url]').val();
	
	if($('input[name="IsActive"]')[0].checked) {
		app.IsActive = true;
	} else {
		app.IsActive = false;
	}
	
	if($('input[name="IsUrlExternal"]')[0].checked) {
		app.UrlExternal = true;
	} else {
		app.UrlExternal = false;
	}
}

/**
 * 
 */
function showImport() {
	$("#fileManagement").show();
}

/**
 * 
 */
function hideImport() {
	$("#fileManagement").hide();
}

/**
 * 
 * @param iframe
 */
function checkResults(iframe) {
	var that = $(iframe);
	var str = that.contents().text();
	if(str && str.length > 0) {
		try {
			str = JSON.parse(str);
			var result = parseErrors(str,function(errs,data){
				var str = '';
				if(errs.length > 1) {
					'The following errors occured;\n';
					for(var i in errs) {
						str += '\n\t'+(i+1)+'. '+errs[i];
					}
				} else {
					str += 'The following error occured; '+errs[0];
				}
				alert(str+="\n\n");
			});
			appio.retrieve();
		} catch (e) {
			alert(e);
		}
	}
}

$(document).ready(function() {
	
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	makeAdminNav('apps');
	
	if(CommonUtilities.getQueryParameter('selectedApp')) {
		reselectApp = true;
	}
	
	$("#import").button({icons: {primary: "ui-icon-circle-arrow-n"}}).click(function(){
		$("#uploadFileInput").trigger("click");
	});
	
	$("#export").button({icons: {primary: "ui-icon-circle-arrow-s"}}).click(function(){
		$("#uploadFileIframe").attr("src","/REST/admin/APP/"+selectApp.Name+"/?export=true&");
	});
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteApp();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectApp) {
			getForm(selectApp);
			var t = selectApp.Name;
			selectApp.Name = null;
			appio.update(selectApp);
			selectApp = t;
		} else {
			var app = {};
			getForm(app);
			appio.create(app);
			selectApp = app;
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		$('#appsList').dfPagerUI('enableAll');
		showApp();
	});
	
	$("#filemanager").button({icons: {primary: "ui-icon-folder-collapsed"}}).click(function(){
		window.location = ('../filemanager/index.html?hostApp=admin&path='+selectApp.Name+'&returnUrl='+escape(window.location.href.substring(0,window.location.href.indexOf('?'))+'?selectedApp='+selectApp.Name));
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
	
	$('#appsList').dfPagerUI({
		app: 'admin',
		service: "System",
		resource: '/App',
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ['Id','Name','Label','IsActive','Url','IsUrlExternal'],
		renderer: function(container,json) {
			var apps = CommonUtilities.flattenResponse(json);
			for(var i in apps) {
				if(reselectApp && apps[i].Name == CommonUtilities.getQueryParameter('selectedApp')) {
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