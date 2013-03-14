var UserCtrl = function ($scope, User, Role) {
    Scope = $scope;
    Scope.Users = User.get();
    Scope.action = "Create";
    Scope.Roles = Role.get();
    Scope.user = {};
    $('#update_button').hide();
    Scope.formChanged = function () {
        $('#save_' + this.user.id).removeClass('disabled');
    };

    Scope.save = function () {
        if(this.user.password == ''){
            delete this.user.password;
        }
        var id = Scope.user.id;
        User.update({id:id}, Scope.user, function(){
            Scope.promptForNew();
            window.top.Actions.showStatus("Updated Successfully");
        });
    };
    Scope.create = function () {
        var newRec = this.user;
        if(this.user.password == ''){
            delete this.user.password;
        }
        if(!newRec.display_name){
            newRec.display_name = newRec.first_name + ' ' + newRec.last_name;
        }

        User.save(newRec, function(data){
            Scope.promptForNew();
            Scope.Users.record.push(data);
            window.top.Actions.showStatus("Created Successfully");
        });


    };
    Scope.promptForNew = function () {
        $(':checkbox').removeAttr('checked');
        Scope.action = "Create";
        Scope.user = {};
        Scope.user.password = '';
        $('#save_button').show();
        $('#update_button').hide();
        $('#passwordError').hide();
        $('#passwordRepeat').val('');
        Scope.userform.$setPristine();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
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
        });
    };
    Scope.showDetails = function(){
        Scope.action = "Edit";
        Scope.user = angular.copy(this.user);
        Scope.user.password = '';
        $('#save_button').hide();
        $('#update_button').show();
        $('#passwordError').hide();
        $('#passwordRepeat').val('');
        Scope.userform.$setPristine();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.user.id).addClass('info');
    }
    Scope.toggleRoleSelect = function (checked) {

        if(checked == true){
            $('#role_select').prop('disabled', true);
        }else{
            $('#role_select').prop('disabled', false);
        }
    };

};