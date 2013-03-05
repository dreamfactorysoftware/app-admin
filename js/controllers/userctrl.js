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
        });


    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.user = {};
        Scope.user.password = '';
        $('#save_button').show();
        $('#update_button').hide();
        $('#passwordError').hide();
        $('#passwordRepeat').val('');
        Scope.userform.$setPristine();
    };
    Scope.delete = function () {
        var id = this.user.id;
        User.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
        });
    };
    Scope.showDetails = function(){
        Scope.action = "Edit";
        Scope.user = this.user;
        Scope.user.password = '';
        $('#save_button').hide();
        $('#update_button').show();
        $('#passwordError').hide();
        $('#passwordRepeat').val('');
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