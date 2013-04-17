var ConfigCtrl = function ($scope, Config, Role) {
    Scope = $scope;
    Scope.Config = Config.get();
    Scope.Roles = Role.get();
    Scope.save = function () {
        Config.update(Scope.Config, function() {
            window.top.Actions.showStatus("Updated Successfully");
        }, function(response) {
            window.top.Actions.showStatus(getErrorString(response), "error");
        });
    };
}
