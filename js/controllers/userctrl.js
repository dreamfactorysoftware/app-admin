var UserCtrl = function ($scope, User, Role) {
    Scope = $scope;
    Scope.Users = User.get();
    Scope.action = "Create";
    Scope.Roles = Role.get();
    Scope.sendInvite = true;
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
        if (!this.sendInvite) {
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
                Scope.promptForNew();
                Scope.Users.record.push(response);
                window.top.Actions.showStatus("Created Successfully");
            },
            function(response) {
                Scope.user.password = '';
                Scope.passwordRepeat = '';
                window.top.Actions.showStatus(getErrorString(response), "error");
            });
    };
    Scope.invite = function () {
        alert("Invite!");
    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.sendInvite = true;
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
        Scope.sendInvite = true;
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