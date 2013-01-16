/**
 * roleassign.js
 */

/**
 * 
 * @param errs
 * @param data
 */


$(document).ready(function() {
	
	makeAdminNav('roleassign');
	
	function makeEntry(container,users,klass,pre,action) {
		for(var i = 0; i < users.length; i++) {
			var row = $('<div/>');
			var checkbox = $('<input/>');
			checkbox.attr("id",pre+i);
			checkbox.attr("type","checkbox");
			checkbox.addClass(klass);
			checkbox.data("index",i);
			checkbox.data("id",users[i].id);
			checkbox.click(action);
			row.append(checkbox);
			row.append(users[i].full_name);
			container.append(row);
		}
	}
	
	
	/**
	 * 
	 * @param container
	 * @param users
	 */
	function showSearchUsers(container,users) {
		makeEntry(container,users,"SEARCH_USERS","SU_",function(){
			$('#UAdd').button({ disabled: false });
		});
	}

	var userio = new DFRequest({
		app: 'admin',
		service: "System",
		resource: '/user',
		type: DFRequestType.POST,
		action: DFRequestActions.UPDATE,
		success: function(json,request) {
			if(!parseErrors(json,errorHandler)) {
				$('#usersList').dfSearchWidget("go");
				$("#searchUsersList").dfSearchWidget("go");
				$("#URemove").button({disabled: true});
				$("#UAdd").button({disabled: true});
			}
		}
	});
	
	/**
	 * 
	 * @param container
	 * @param users
	 */
	function showRoleUsers(container,users) {
		makeEntry(container,users,"ROLE_USERS","RU_",function(){
			$('#URemove').button({ disabled: false });
		});
	}
	
	/**
	 * 
	 */
	function deselectAllRoles() {
		$(".ROLE_BUTTON").each(function(){
			$(this).button({icons:{secondary:null}});
			$(this).removeClass("ROLE_BUTTON_SELECTED");
		});
	}

	/**
	 * 
	 */
	function getSelectedRoleId() {
		return $(".ROLE_BUTTON_SELECTED").data("RoleIds");
	}
	
	/**
	 * 
	 */
	function removeUsers() {
		var remove_lst = [];
		$(".ROLE_USERS").each(function(){
			if($(this).prop('checked') == true) {
				remove_lst[remove_lst.length] = {
					"id": $(this).data('id'),
					"role_id": ""
				};
			}
		});
		
		userio.update(remove_lst);
		
	}
	
	/**
	 * 
	 */
	function addUsers() {
		var add_lst = [];
		var role_id = getSelectedRoleId();
		if(role_id) {
			$(".SEARCH_USERS").each(function(){
				if($(this).prop('checked') == true) {
					add_lst[add_lst.length] = {
						"id": $(this).data('id'),
						"role_id": role_id
					};
				}
			});
			
			userio.update(add_lst);
			
		}
		
	}
	
	/**
	 * 
	 * @param container
	 * @param users
	 */
	function showRoles(container,roles) {
		for(var i = 0; i < roles.length; i++) {
			var role = roles[i];
			var rbtn = $('<button class="cW100 cTM1 ROLE_BUTTON"></button>');
			rbtn.attr("id","RBTN_"+i);
			rbtn.text(role.name);
			rbtn.data("RoleIds",role.id);
			rbtn.data("Index",i);
			rbtn.button().click(function(){
				deselectAllRoles();
				$(this).button({icons:{secondary:"ui-icon-play"}});
				$(this).addClass("ROLE_BUTTON_SELECTED");
				var id = $(this).data("RoleIds");
				var index = $(this).data("Index");
				var name = $(this).text();
				$().dfSearchWidget.activeSearches["usersList"].params = {
					filter: "role_id = '"+id+"'"
				};
				$("#usersList").dfSearchWidget("go");
			});
			
			container.append(rbtn);
		}
	}
	
	$("#Refresh").button({icons: {primary: "ui-icon-refresh"}}).click(function(){
		$("#rolesList").dfSearchWidget("go");
		$().dfSearchWidget.activeSearches["usersList"].params = {
			filter: "role_id = '-1'"
		};
		$('#usersList').dfSearchWidget("go");
	});
	
	$('#rolesList').dfSearchWidget({
		app: "admin",
		service: "System",
		resource: "/role",
		offsetHeight: 0,
		noSearchTerm: true,
		renderer: function(container,roles) {
			if(roles.length > 0) {
				showRoles(container,roles);
				container.append($('<div style="height:8px;"></div>'));
			} else {
				container.append("<div align='center'>&lt;<i>No Roles Found</i>&gt;</div>");
			}
			resizeUi();
			
		}
	});
	
	$("#URemove").button({icons: {primary: "ui-icon-closethick"},disabled: true}).click(removeUsers);
	$("#UAdd").button({icons: {primary: "ui-icon-plusthick"},disabled: true}).click(addUsers);
	
	$('#usersList').dfSearchWidget({
		app: "admin",
		service: "System",
		resource: "/user",
		offsetHeight: 0,
		noSearchTerm: true,
		params: {
			filter: "role_id = '-1' AND is_sys_admin = 0"
		},
		renderer: function(container,users,request) {
			$('#URemove').button({ disabled: true });
			if(users.length > 0) {
				showRoleUsers(container,users);
				container.append($('<div style="height:8px;"></div>'));
			} else {
				if(request.params.filter=="role_id = '-1' AND is_sys_admin = 0") {
					container.append("<div align='center'>&lt;<i>Select a Role To Begin</i>&gt;</div>");
				} else {
					container.append("<div align='center'>&lt;<i>No Users Are Assigned To This Role</i>&gt;</div>");
				}
			}
			resizeUi();
		}
	});
	
	$("#searchUsersList").dfSearchWidget({
		app: "admin",
		service: "System",
		resource: "/user",
		offsetHeight: 0,
		filter: function(name,val){
			if(!name && !val) {
				return {
					filter: "role_id = '' AND is_sys_admin = 0"
				};
			} else {
				if(!name) name = "full_name";
				return {
					filter: name+" LIKE '%"+val+"%'"
				};
			}
		},
		orderBy: [
					{
						label: "[Sort By]",
						value: "id"
					},
					{
						label: "First Name",
						value: "first_name"
					},
					{
						label: "Last Name",
						value: "last_name"
					},
					{
						label: "Last Modified",
						value: "last_modified_date"
					}
				],
		renderer: function(container,users) {
			if(users.length > 0) {
				showSearchUsers(container,users);
				container.append($('<div style="height:8px;"></div>'));
			} else {
				container.append("<div align='center'>&lt;<i>No results for search term...</i>&gt;</div>");
			}
			resizeUi();
		}
	});
	
});



