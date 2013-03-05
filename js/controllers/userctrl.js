var UserCtrl = function ($scope, User, Role) {

    Scope = $scope;
    Scope.Users = User.get();
    Scope.Roles = Role.get();
    Scope.action = "Create";
    Scope.user = {};
    Scope.user.is_active = false;
    Scope.user.is_sys_admin = false;
    Scope.user.password = 'zxczxc';
    $('#password').val('123123');
    $('#passwordRepeat').val('123123');
    $('#passwordError').hide();
    $('#email').val('');
    $('#save_button').show();
    $('#update_button').hide();

    Scope.formChanged = function () {
        $('#save_' + this.user.id).removeClass('disabled');
    };

    Scope.save = function () {
        if(this.user.password == ''){
            delete this.user.password;
        }
        var id = Scope.user.id;
        User.update({id:id}, Scope.user);
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
            Scope.Users.record.push(data);
            Scope.promptForNew();
        });
    };
    Scope.promptForNew = function () {
        alert("xxx");
        Scope.action = "Create";
        Scope.user = {};
        Scope.user.is_active = false;
        Scope.user.is_sys_admin = false;
        Scope.user.password = '';
        $('#password').val('');
        $('#passwordRepeat').val('');
        $('#passwordError').hide();
        $('#email').val('');
        $('#save_button').show();
        $('#update_button').hide();

        Scope.userform.$setPristine();
    };
    Scope.delete = function () {
        if(!confirm("Are you sure you want to delete the user '" + this.user.display_name + "'?")) {
            return;
        }
        var id = this.user.id;
        User.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
            Scope.promptForNew();
        });
    };
    Scope.showDetails = function(){
        Scope.action = "Edit";
        Scope.user = this.user;
        Scope.user.password = '';
        $('#password').val('');
        $('#passwordRepeat').val('');
        $('#passwordError').hide();
        $('#email').val('');
        $('#save_button').hide();
        $('#update_button').show();
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