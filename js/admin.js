/**
 * Administration button set navigation
 * @param current_button
 */
function makeAdminNav(current_button) {
	$( '#admin_radio' ).append('<input type="radio" id="index" name="radio"'+(current_button == 'index' ? 'checked="checked"' : '')+'/><label for="index">Users</label>');
	$( '#admin_radio' ).append('<input type="radio" id="roles" name="radio" '+(current_button == 'roles' ? 'checked="checked"' : '')+'/><label for="roles">Roles</label>');
	$( '#admin_radio' ).append('<input type="radio" id="roleassign" name="radio" '+(current_button == 'roleassign' ? 'checked="checked"' : '')+'/><label for="roleassign">Assign Roles</label>');
	$( '#admin_radio' ).append('<input type="radio" id="apps" name="radio" '+(current_button == 'apps' ? 'checked="checked"' : '')+'/><label for="apps">Applications</label>');
	$( '#admin_radio' ).append('<input type="radio" id="appgroups" name="radio" '+(current_button == 'appgroups' ? 'checked="checked"' : '')+'/><label for="appgroups">Groups</label>');
	//$( '#admin_radio' ).append('<input type="radio" id="appgroupassign" name="radio" '+(current_button == 'appgroupassign' ? 'checked="checked"' : '')+'/><label for="appgroupassign">Assign Groups</label>');
	$( '#admin_radio' ).append('<input type="radio" id="services" name="radio" '+(current_button == 'services' ? 'checked="checked"' : '')+'/><label for="services">Services</label>');
	
	$( '#admin_radio' ).buttonset().click(function() {
		var key = $("input[name='radio']:checked").attr('id');
		if(current_button != key) {
			current_button = key;
			window.location = (key+'.html?_='+new Date().getTime());
		}
	});
	
}

/**
 * Administration functions for maintaining the height of the UI to
 * fill into the space provided by LaunchPad.
 */
function resizeUi() {
	var h = $(window).height()-35;
	var button_bar = $("#admin_radio").outerHeight();
	$("#admin_panel").css('height', (h - button_bar));
};

var resizeTimer = null;

$(window).bind('resize', function() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeUi, 100);
});


/**
 * Administration global error handling function. Every admin module
 * uses this function to read and report errors.
 * 
 * 
 * @param errs
 * @param data
 */
function errorHandler(errs,data) {
	var str = '';
	if(errs.length > 1) {
		str += 'The following errors occured; ';
		for(var i in errs) {
			str += '\n\t'+(i+1)+'. '+errs[i];
		}
	} else {
		if(errs[0].indexOf("INVALIDSESSION") != -1 && top.parent.relogin) {
			top.parent.relogin();
			return;
		} else {
			str += 'The following error occured; '+errs[0];
		}
	}
	alert(str+="\n\n");
}