/**
 * users.js
 */

var current_users = null;
var selectUser = null;

$(document).ready(function() {

    // set actions for password field highlighting
    $("#Password").keyup(doPasswordVerify);
    $("#VPassword").keyup(doPasswordVerify);

    // set actions for button activation
    $(".ONKEYUP").keyup(makeClearable);
    $(".ONCHANGE").change(makeClearable);

    // highlight users tab
    makeAdminNav('index');

    buildRolesMenu();

    // invite button
    $("#invite").button({icons: {primary: "ui-icon-document"}}).click(function() {

        if (selectUser) {
            inviteUser();
        }
    });

    // new button
    $("#new").button({icons: {primary: "ui-icon-document"}}).click(function() {

        showUser(null);
    });

    // save button
    $("#save").button({icons: {primary: "ui-icon-disk"}}).click(function() {

        try {
            if(selectUser) {
                updateUser();
            } else {
                createUser();
            }
        } catch (e) {
            alert(e);
        }
    });

    // delete button
    $("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function() {

        if (selectUser) {
            $( "#deleteUser" ).html(selectUser.full_name);
            $( "#confirmDeleteUserDialog" ).dialog('open');
        }
    });

    // delete user confirmation dialog
    $( "#confirmDeleteUserDialog" ).dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        buttons: {
            Continue: function() {
                deleteUser();
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $("#usersList").dfSearchWidget({
        app: "admin",
        service: "System",
        resource: "/user",
        offsetHeight: 25,
        filter: function(name,val){
            if(!name) name = "full_name";
            return {
                filter: name+" LIKE '%"+val+"%'"
            };
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
                current_users = users;
                renderUsers(container,users);
                container.append($('<div style="height:8px;"></div>'));
                resizeUi();
                selectCurrentUser();
                return users.length;
            } else {
                renderUsers(container,users);
                container.append("<div align='center'>&lt;<i>No results for search term... Please Try Again!</i>&gt;</div>");
                resizeUi();
                showUser(null);
                return 0;
            }
        }
    });
});

//
// invite user
//
function inviteUser() {

    var email = {};
    email.to_emails = selectUser.email;
    email.subject = 'An Invitation To Our Platform';
    email.html_body = 'You have been invited to join our document services platform!<br><br>';
    email.html_body += '<a href="' + 'http://' + location.host + '">Login</a>'  + '<br>';
    email.html_body += 'User Name: ' + selectUser.username + '<br>';
    email.html_body += 'Password: ' + 'password123' + '<br>';

    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/email?app_name=admin',
        data:JSON.stringify(email),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                alert(selectUser.full_name + ' has been invited.')
            } else {
                alert('There was an error sending the invite.')
            }
        },
        error:function (response) {
            alert('There was an error sending the invite.')
        }
    });
}

//
// create user
//
function createUser() {

    var user = {};

    // get data from form
    getUserFormData(user);

    selectUser = user;

    // create
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/user?app_name=admin',
        data:CommonUtilities.jsonRecords(user),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                selectUser.id = response.record[0].fields.id;
                current_users.splice(0, 0, selectUser);
                $('#usersList').dfSearchWidget("refresh");
            }
            $("#save").button({ disabled: true });
        },
        error:function (response) {

        }
    });
}

//
// update user
//
function updateUser() {

    // get data from form
    getUserFormData(selectUser);

    // remove non-updateable fields
    delete selectUser.created_by_id;
    delete selectUser.created_date;
    delete selectUser.last_modified_by_id;
    delete selectUser.last_modified_date;

    // update
    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/user?app_name=admin&method=MERGE',
        data:CommonUtilities.jsonRecords(selectUser),
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                $('#usersList').dfSearchWidget("refresh");
            }
            $("#save").button({ disabled: true });
        },
        error:function (response) {

        }
    });
}

//
// delete user
//
function deleteUser() {

    $.ajax({
        dataType:'json',
        type : 'POST',
        url:'http://' + location.host + '/rest/system/user/' + selectUser.id + "?app_name=admin&method=DELETE",
        cache:false,
        processData: false,
        success:function (response) {
            if(!parseErrors(response, errorHandler)) {
                for(var i in current_users) {
                    if(current_users[i].id == selectUser.id) {
                        current_users.splice(i,1);
                        $("#usersList").dfSearchWidget("refresh");
                        break;
                    }
                }
                showUser(null);
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

//
// Build the roles menu, admin looks like just another role.
//
function buildRolesMenu() {

    $.ajax({
        dataType:'json',
        url:'http://' + location.host + '/rest/system/role',
        data:'app_name=admin&method=GET&fields=' + escape('id,name'),
        cache:false,
        success:function (response) {
            if(!parseErrors(response)) {
                var rs = $("#roleSelector");
                rs.html($("<option/>").attr("value","").text("[ No Role Selected ]"));
                rs.append($("<option/>").attr("value","*").text("System Administrator"));
                for(var i in response.record) {
                    rs.append($("<option/>").attr("value",response.record[i].fields.id).text(response.record[i].fields.name));
                }
            }
        },
        error:function (response) {

        }
    });
}

function makeUserButton(id,name,container) {

    container.append($('<button id="USER_'+id+'" class="user_button selector_btn cW100"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

function renderUsers(container,users) {

    for(var i = 0; i < users.length; i++) {
        if(!users[i]) continue;
        makeUserButton(i,users[i].full_name,container);
    }
    $('.user_button').button({icons: {primary: "ui-icon-person"}}).click(function(){
        showUser(null); // clear user selection
        $(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
        showUser(current_users[parseInt($(this).attr('id').substring('USER_'.length))]);
    });
}

function selectCurrentUser() {

    if(selectUser && current_users) {
        for(var i in current_users) {
            if(current_users[i].full_name == selectUser.full_name && current_users[i].last_name == selectUser.last_name && current_users[i].first_name == selectUser.first_name) {
                $('#USER_'+i).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
                showUser(current_users[i]);
                return;
            }
        }
    } else {
        showUser(null);
    }
}

function showUser(user) {

    selectUser = user;
    if(user) {
        $('input:text[name=username]').val(user.username);
        $('input:text[name=fullname]').val(user.full_name);
        $('input:text[name=lastname]').val(user.last_name);
        $('input:text[name=firstname]').val(user.first_name);
        $('input:text[name=email]').val(user.email);
        $('input:text[name=phone]').val(user.phone);
        if(user.is_active) {
            $('input[name="isactive"]')[0].checked = true;
        } else {
            $('input[name="isactive"]')[1].checked = true;
        }

        if(user.is_sys_admin) {
            $("#roleSelector").val("*");
        } else {
            $("#roleSelector").val(user.role_id);
        }

        $("#save").button({ disabled: true });
        $('#delete').button({ disabled: false });
        $('#new').button({ disabled: false });
        $('#invite').button({ disabled: false });
    } else {
        if(current_users) {
            for(var i in current_users) {
                $('#USER_'+i).button( "option", "icons", {primary: 'ui-icon-person', secondary:''} );
            }
        }
        $('input:text[name=username]').val('');
        $('#Password').val("");
        $('#VPassword').val("");
        $('input:text[name=fullname]').val('');
        $('input:text[name=lastname]').val('');
        $('input:text[name=firstname]').val('');
        $('input:text[name=email]').val('');
        $('input:text[name=phone]').val('');
        $('input[name="isactive"]')[1].checked = true;

        $("#roleSelector").val("");

        $('#save').button({ disabled: false });
        $('#delete').button({ disabled: true });
        $('#new').button({ disabled: true });
        $('#invite').button({ disabled: true });

        $("#Password").removeClass("RedBorder");
        $("#Password").removeClass("GreenBorder");
        $("#VPassword").removeClass("RedBorder");
        $("#VPassword").removeClass("GreenBorder");
    }
}

function getUserFormData(obj) {

    obj.username  = $('input:text[name=username]').val();

    var pword = $.trim($('#Password').val());
    var vword = $.trim($('#VPassword').val());

    if(pword && pword == vword) {
        obj.Password = pword;
    } else if(pword && pword != vword) {
        throw "Passwords do not match! Password and Verify Password must match before you may proceed.";
    }

    $('#Password').val("").trigger("keyup");
    $('#VPassword').val("").trigger("keyup");

    obj.full_name  = $('input:text[name=fullname]').val();
    obj.last_name  = $('input:text[name=lastname]').val();
    obj.first_name = $('input:text[name=firstname]').val();
    obj.email     = $('input:text[name=email]').val();
    obj.phone     = $('input:text[name=phone]').val();

    if($('input[name="isactive"]')[1].checked) {
        obj.is_active = 0;
    } else {
        obj.is_active = 1;
    }

    var roleId = $("#roleSelector").val();

    if(roleId == "*") {
        obj.is_sys_admin = 1;
        obj.role_id = null;
    } else {
        obj.is_sys_admin = 0;
        obj.role_id = roleId;
    }

}

function doPasswordVerify() {

    var value = $("#Password").val();
    var verify = $("#VPassword").val();
    if(value.length > 0 && verify.length > 0) {
        if(value == verify) {
            $("#Password").removeClass("RedBorder");
            $("#Password").addClass("GreenBorder");
            $("#VPassword").removeClass("RedBorder");
            $("#VPassword").addClass("GreenBorder");
        } else {
            $("#Password").removeClass("GreenBorder");
            $("#Password").addClass("RedBorder");
            $("#VPassword").removeClass("GreenBorder");
            $("#VPassword").addClass("RedBorder");
        }
    } else {
        $("#Password").removeClass("RedBorder");
        $("#Password").removeClass("GreenBorder");
        $("#VPassword").removeClass("RedBorder");
        $("#VPassword").removeClass("GreenBorder");
    }
}