/**roles.js
 * 
 */

var isPageDirty = false;
var current_roles = null;
var selected_role = -1;
var selected_role_id = -1;
var selectRole = null;
var services = [];
var servicesLookup = {};

/**
 * Makes the Role button to select the role in the UI
 * @param id
 * @param name
 * @param container
 */
function makeRoleButton(id,name,container) {
	container.append($('<button id="ROLE_'+id+'" class="role_button selector_btn cW100"><span id="DFRoleLabel_'+id+'">'+name+'</span></button>'));
}

/**
 * 
 * @param container
 * @param roles
 */
function renderRoles(container,roles) {
	for(var i in roles) {
		makeRoleButton(i,roles[i].Name,container);
		if(selected_role_id > -1 && parseInt(roles[i].Id) == selected_role_id) {
			selected_role = i;
			selected_role_id = -1;
		}
	}
	$(".role_button").button({icons: {primary: "ui-icon-gear"}}).click(function(){
		if($(this).button( "option", "icons").secondary == undefined) {
			showRole();
			$(this).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
			showRole(current_roles[parseInt($(this).attr("id").substring("ROLE_".length))]);
		} else {
			showRole();
		}
	});
}

/**
 * 
 */
function resetRoles() {
	if(current_roles) {
		for(var i in current_roles) {
			$('#ROLE_'+i).button( "option", "icons", {primary: "ui-icon-gear"} );
		}
	}
}

/**
 * 
 */
function selectCurrentRole() {
	if(selectRole && current_roles) {
		for(var i in current_roles) {
			if(current_roles[i].Name == selectRole.Name) {
				$('#ROLE_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
				showRole(current_roles[i]);
				return;
			}
		}
	} else {
		showRole();
	}
}

/**
 * 
 * @param role
 */
function showRole(role) {
	selectRole = role;
	if(role) {
		$('#rName').val(role.Name);
		$('#rDescription').val(role.Description);
		$('#save').button({ disabled: true });
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
	} else {
		resetRoles();
		$('#rName').val('');
		$('#rDescription').val('');
		$('#save').button({ disabled: false });
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
	selectApps(role);
	makeServiceList(role);
}

/**
 * 
 */
function makeClearable() {
	$('#clear').button({ disabled: false });
	$('#save').button({ disabled: false });
	$('#rolesList').dfPagerUI('disableAll');
}

/**
 * The Role IO object
 */
var roleio = new DFRequest({
	app: 'admin',
	service: 'System',
	resource: '/Role',
	type: DFRequestType.POST,
	success: function(xml) {
		var errorMsg = checkFailure(xml);
		if(errorMsg) {
			$("#errorMsg").html(errorMsg);
			$("#errorDialog").dialog("open");
		} else {
			$("#rolesList").dfPager("fetch");
		}
		$("#save").button({ disabled: true });
		$("#rolesList").dfPagerUI("enableAll");
		$("#savingDialog").dialog("close");
	},
	error: function(err) {
		$("#errorMsg").html(err);
		$("#errorDialog").dialog("open");
  	}
});

/**
 * The Application IO object
 */
var appio = new DFRequest({
	app:  "admin",
	service: "System",
	resource: "/App",
	success: function(json) {
		if(!parseErrors(json,function(errs,data){
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
		})) {
			current_apps = CommonUtilities.flattenResponse(json);
			showApps(current_apps);
		}
	},
	error: function(err) {
		$("#errorMsg").html(err);
		$("#errorDialog").dialog("open");
  	}
});

/**
 * 
 * @param confirmed
 */
function deleteRole(confirmed) {
	if(selectRole) {
		if(confirmed) {
			roleio.deletes(selectRole.Id);
			showRole();
		} else {
			$( "#deleteRole" ).html(selectRole.Name);
			$( "#confirmDeleteRoleDialog" ).dialog('open');
		}
	}
}

/**
 * 
 */
function addService() {
	var index = 0;
	var id = $("#serviceId").val();
	var label = $("#serviceId option:selected").text();
	var $that = $(".SERVICE_ITEM");
	if(selectRole) {
		index = selectRole.Services.length;
	} else {
		index = $that.length;
	}
	var exists = false;
	var psrv = $("#serviceSelect").val();
	var pcomp = $("#componentSelect").val();
	$that.each(function(index){
		if(!exists) {
			var $this = $(this);
			var tsrv = $("#serviceSelect_"+index).val();
			var tcomp = $("#componentSelect_"+index).val();
			if(psrv == tsrv && pcomp == tcomp) {
				exists = true;
			}
		}
	});
	if(!exists) {
		makeClearable();
		$("#SERVICE_ID_LIST").append(makeServiceComponentLine(index,{
			Service: psrv,
			Component: pcomp,
			Read:$('#Read').prop('checked')+"",
			Create:$('#Create').prop('checked')+"",
			Update:$('#Update').prop('checked')+"",
			Delete:$('#Delete').prop('checked')+""
		}));
		$('#REMOVE_SRV_'+index).click(removeService);
		$("#serviceSelect").val("*").trigger("onchange");
		$('#Read').prop('checked',false);
		$('#Create').prop('checked',false);
		$('#Update').prop('checked',false);
		$('#Delete').prop('checked',false);
	}
}

/**
 * 
 * @param apps
 */
function showApps(apps) {
	var con = $('#APP_ID_LIST');
	con.html('');
	for(var i in apps) {
		con.append('<div><input type="checkbox" name="APP_ID_'+apps[i].Id+'" value="'+apps[i].Id+'" class="APP_CBX" onchange="makeClearable()"/>'+apps[i].Label+'</div>');
	}
}

/**
 * 
 * @param role
 */
function selectApps(role) {
	$(".APP_CBX").each(function(){
		$(this).prop('checked',false);
	});
	if(role && role.AppIds) {
		var tmp = role.AppIds.split(",");
		for(var i in tmp) {
			var str = $.trim(tmp[i]);
			if(str.length > 0) {
				$("input[value='"+str+"']").prop('checked',true);
			}
		}
	}
}

/**
 * 
 * @param role
 */
function processForm(role) {
	role.Name = $('#rName').val();
	role.Description = $('#rDescription').val();
	role.Services = getServices();
	role.AppIds = getSelectAppIds();
}

/**
 * 
 * @returns {String}
 */
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

/**
 * 
 * @returns {Array}
 */
function getServices() {
	var tmp = [];
	$(".SERVICE_ITEM").each(function(index){
		tmp[index] = {
			Service:$("#serviceSelect_"+index).val(),
			Component:$("#componentSelect_"+index).val(),
			Create:$("#Create_"+index).prop('checked')+"",
			Read:$("#Read_"+index).prop('checked')+"",
			Update:$("#Update_"+index).prop('checked')+"",
			Delete:$("#Delete_"+index).prop('checked')+""
		};
	});
	return tmp;
}

/**
 * The Service IO object
 */
var serviceDescriptor = new DFRequest({
	app: 'admin',
	service: "",
	success: function(json) {
		if(services.length > 0) {
		} else {
			services = json.service;
			var selectSrv = $("#serviceSelect");
			for(var i in services) {
				var myServiceName = services[i].name;
				var myServiceLabel = services[i].label;
				servicesLookup[myServiceName] = i;
				$('<option value="'+myServiceName+'">'+myServiceLabel+'</option>').appendTo(selectSrv);
				var myDef = serviceDescriptor.prepareRequest(null,null,myServiceName);
				myDef.success = function(data) {
					if(data.resource) {
						var srv = services[servicesLookup[this.service]];
						srv.components = data.resource;
					}
				};
				serviceDescriptor.retrieve(null,null,myDef);
			}
		}
	},
	error: function(err) {
		$('#errorMsg').html(err);
		$('#errorDialog').dialog('open');
  	}
});

/**
 * 
 * @param srv
 */
function doListSelect(srv) {
	var $this = $(srv);
	var index = parseInt($this.data("index"));
	var srv = services[servicesLookup[$this.val()]];
	if(index < 0) {
		index = "";
	} else {
		index = "_"+index;
	}
	var $that = $("#componentSelect"+index);
	$that.html('<option value="All">All</option>');
	if(srv) {
		for(var i in srv.components) {
			$('<option value="'+srv.components[i].name+'">'+srv.components[i].name+'</option>').appendTo($that);
		}
	}
}

function removeService() {
	var $this = $(this);
	var index = $this.data("index");
	var label = $this.data("label");
	var c = confirm("Are you sure you want to remove the service '"+label+"' from the list? ");
	if(c) {
		$("#SRV_"+index).remove();
		makeClearable();
	}
}

/**
 * 
 * @param role
 */
function makeServiceList(role) {
	$("#serviceSelect").val("*").trigger("onchange");
	$("#SERVICE_ID_LIST").html("");
	if(role) {
		for(var i in role.Services ) {
			$("#SERVICE_ID_LIST").append(makeServiceComponentLine(i,role.Services[i]));
			$('#REMOVE_SRV_'+i).click(removeService);
		};
	}
}

/**
 * 
 * @param index
 * @param service
 * @param title
 * @returns
 */
function makeCheckBox(index,service,title) {
	return $('<div class="cLeft cW25"><input type="checkbox" value="true" title="'+title+'" onchange="makeClearable()" id="'+title+'_'+index+'" '+(service[title] == "true"?"CHECKED":"")+'/></div>');
}

/**
 * 
 * @param index
 * @param service
 * @returns
 */
function makeServiceComponentLine(index,service) {
	
	// create major elements...
	var line = $('<div id="SRV_'+index+'" data-index="'+index+'" class="SERVICE_ITEM cBM1"/>');
	var fcolumn = $('<div class="cLeft cW30"/>');
	var scolumn = $('<div class="cLeft cW30 cLM1"/>');
	var tcolumn = $('<div class="cLeft cW30" align="center"/>');
	var srvSelect = $('<select id="serviceSelect_'+index+'" data-index="'+index+'" class="cW100" onchange="doListSelect(this);makeClearable()"/>');
	var compSelect = $('<select id="componentSelect_'+index+'" data-index="'+index+'" class="cW100" onchange="makeClearable()">');
	
	fcolumn.appendTo(line);
	scolumn.appendTo(line);
	tcolumn.appendTo(line);
	srvSelect.appendTo(fcolumn);
	compSelect.appendTo(scolumn);
	
	// create default options...
	$('<option value="*">All</option>').appendTo(srvSelect);
	$('<option value="*">All</option>').appendTo(compSelect);
	
	var selected = false;
	
	// iterate over services and their compoenents...
	for(var i in services) {
		selected = service.Service == services[i].name;
		$('<option value="'+services[i].name+'" '+(selected?"SELECTED":"")+'>'+services[i].label+'</option>').appendTo(srvSelect);
		if(selected) {
			for(var j in services[i].components) {
				$('<option value="'+services[i].components[j].name+'" '+(service.Component == services[i].components[j].name?"SELECTED":"")+'>'+services[i].components[j].name+'</option>').appendTo(compSelect);
			}
		}
	}
	
	// check box elements...
	makeCheckBox(index,service,"Create").appendTo(tcolumn);
	makeCheckBox(index,service,"Read").appendTo(tcolumn);
	makeCheckBox(index,service,"Update").appendTo(tcolumn);
	makeCheckBox(index,service,"Delete").appendTo(tcolumn);
	
	$('<span class="ui-state-df-red"><span class="ui-icon ui-icon-closethick offTop3 cLM1" data-label="'+service.Service+'" data-index="'+index+'" id="REMOVE_SRV_'+index+'" title="Remove From List"></span></span>').appendTo(line);
	$('<div class="cClear"><!--  --></div>').appendTo(tcolumn);
	$('<div class="cClear"><!--  --></div>').appendTo(line);
	
	return line;
}

$(document).ready(function() {
	
	$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	
	makeAdminNav('roles');
	appio.retrieve();
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteRole();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectRole) {
			processForm(selectRole);
			roleio.update(selectRole);
		} else {
			var role = {};
			processForm(role);
			roleio.create(role);
			selectRole = role;
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		$('#rolesList').dfPagerUI('enableAll');
		showRole();
	});
	
	$("#REC_READ_BTN").click(function(){
		var $this =$("#REC_READ");
		if($this.hasClass("ui-icon-check")) {
			$this.removeClass("ui-icon-check");
			$this.addClass("ui-icon-cancel");
		} else {
			$this.addClass("ui-icon-check");
			$this.removeClass("ui-icon-cancel");
		}
	});
	
	$("#REC_CREATE_BTN").click(function(){
		var $this = $("#REC_CREATE");
		if($this.hasClass("ui-icon-check")) {
			$this.removeClass("ui-icon-check");
			$this.addClass("ui-icon-cancel");
		} else {
			$this.addClass("ui-icon-check");
			$this.removeClass("ui-icon-cancel");
		}
	});
	
	$("#REC_UPDATE_BTN").click(function(){
		var $this = $("#REC_UPDATE");
		if($this.hasClass("ui-icon-check")) {
			$this.removeClass("ui-icon-check");
			$this.addClass("ui-icon-cancel");
		} else {
			$this.addClass("ui-icon-check");
			$this.removeClass("ui-icon-cancel");
		}
	});
	
	$("#REC_DELETE_BTN").click(function(){
		var $this = $("#REC_DELETE");
		if($this.hasClass("ui-icon-check")) {
			$this.removeClass("ui-icon-check");
			$this.addClass("ui-icon-cancel");
		} else {
			$this.addClass("ui-icon-check");
			$this.removeClass("ui-icon-cancel");
		}
	});
	
	$("#addService").button({text:false,icons: {primary: "ui-icon-plusthick"}}).click(addService);
	
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
	
	$( "#confirmDeleteRoleDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				deleteRole(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$( "#recordsgroup" ).buttonset();
	$( "#admingroup" ).buttonset();
	$( "#rolesgroup" ).buttonset();
	
	$("#rolesList").dfPagerUI({
		app: "admin",
		service: "System",
		resource: "/Role",
		pageNo: 0,
		pageLimit: 1,
		pageLimits: [10,25,50,100],
		orderBy: 0,
		orderFields: ["Id","AppId","Name"],
		renderer: function(container,json) {
			var roles = CommonUtilities.flattenResponse(json);
			if(roles.length > 0) {
				current_roles = roles;
				renderRoles(container,roles);
				resizeUi();
				selectCurrentRole();
				return roles.length;
			} else {
				renderRoles(container,roles);
				container.append("<i>End Of List</i>");
				resizeUi();
				return 0;
			}
		}
	});
	
	serviceDescriptor.retrieve({order:"label"});
});
