var UserCtrl = function ($scope, Config, User, Role) {
    Scope = $scope;
    Scope.Config = Config.get();
    Scope.Users = User.get();
    Scope.action = "Create";
    Scope.Roles = Role.get();
    Scope.passwordEdit = false;
    Scope.user = {};
    Scope.user.password = '';
    Scope.passwordRepeat = '';

    Scope.formChanged = function () {
        $('#save_' + this.user.id).removeClass('disabled');
    };

    Scope.save = function () {
        if (this.passwordEdit) {
            if (this.user.password == '' || this.user.password != this.passwordRepeat) {
                window.top.Actions.showStatus("Please enter matching passwords", "error");
                return;
            }
        } else {
            delete this.user.password;
        }
        var id = Scope.user.id;
        User.update({id:id}, Scope.user, function() {
            updateByAttr(Scope.Users.record, 'id', id, Scope.user);
            Scope.promptForNew();
            window.top.Actions.showStatus("Updated Successfully");
        }, function(response) {
                Scope.user.password = '';
                Scope.passwordRepeat = '';
                window.top.Actions.showStatus(getErrorString(response), "error");
        });
    };
    Scope.create = function () {
        var newRec = this.user;
        if (this.passwordEdit) {
            if (newRec.password == '' || newRec.password != this.passwordRepeat) {
                window.top.Actions.showStatus("Please enter matching passwords", "error");
                return;
            }
        } else {
            delete newRec.password;
        }
        if(!newRec.display_name){
            newRec.display_name = newRec.first_name + ' ' + newRec.last_name;
        }

        User.save(newRec,
            function(response) {
                Scope.Users.record.push(response);
                if (!Scope.passwordEdit) {
                    Scope.invite(true);
                } else {
                    window.top.Actions.showStatus("Created Successfully");
                    Scope.promptForNew();
                }
            },
            function(response) {
                Scope.user.password = '';
                Scope.passwordRepeat = '';
                window.top.Actions.showStatus(getErrorString(response), "error");
            });
    };
    Scope.invite = function (isCreate) {
        if (isCreate) {
            info = {"to": Scope.user.email, "first_name": Scope.user.first_name, "success": createSuccess, "error": createError};
        } else {
            info = {"to": this.user.email, "first_name": this.user.first_name, "success": resendSuccess, "error": resendError};
        }
        var data = {
            "to": info.to,
            "cc": "",
            "bcc": "",
            "subject": "Welcome to DreamFactory",
            "body_html": "Hi {first_name},<br/><br/>You have been invited to become a DreamFactory user. " +
                "Click the confirmation link below to set your password and log in.<br/><br/>{_invite_url_}<br/><br/>Enjoy!<br/><br/>DreamFactory",
            "from_name": "DreamFactory",
            "from_email": "no-reply@dreamfactory.com",
            "reply_to_name": "DreamFactory",
            "reply_to_email": "no-reply@dreamfactory.com",
            "first_name": info.first_name
        };
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: CurrentServer + '/rest/Email/?app_name=admin&method=POST',
            data: JSON.stringify(data),
            cache: false,
            success: info.success,
            error: info.error
        });
    };
    function createSuccess(response) {
        window.top.Actions.showStatus("User created and invite sent!");
        Scope.promptForNew();
    }

    function createError(response) {
        window.top.Actions.showStatus("User created but unable to send invite. " + getErrorString(response), "error");
        Scope.promptForNew();
    }
    function resendSuccess(response) {
        window.top.Actions.showStatus("Invite sent!");
    }

    function resendError(response) {
        window.top.Actions.showStatus("Unable to send invite. " + getErrorString(response), "error");
    }
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.passwordEdit = false;
        Scope.user = {};
        Scope.user.password = '';
        Scope.passwordRepeat = '';
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
        Scope.userform.$setPristine();
    };
    Scope.delete = function () {
        var which = this.user.display_name;
        if (!which || which == '') {
            which = "the user?";
        } else {
            which = "the user '" + which + "'?";
        }
        if(!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.user.id;
        User.delete({ id:id }, function () {
            Scope.promptForNew();
            $("#row_" + id).fadeOut();
            window.top.Actions.showStatus("Deleted Successfully");
        }, function(response) {
                window.top.Actions.showStatus(getErrorString(response), "error");
        });
    };
    Scope.showDetails = function(){
        Scope.action = "Edit";
        Scope.passwordEdit = false;
        Scope.user = angular.copy(this.user);
        Scope.user.password = '';
        Scope.passwordRepeat = '';
        $("tr.info").removeClass('info');
        $('#row_' + Scope.user.id).addClass('info');
        Scope.userform.$setPristine();
    }
    Scope.toggleRoleSelect = function (checked) {

        if(checked == true){
            $('#role_select').prop('disabled', true);
        }else{
            $('#role_select').prop('disabled', false);
        }
    };
};