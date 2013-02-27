/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 2/7/13
 * Time: 4:23 AM
 * To change this template use File | Settings | File Templates.
 */
var ServiceCtrl = function ($scope, Service) {
    Scope = $scope;
    Scope.service = {};
    Scope.Services = Service.get();
    Scope.action = "Create";
    Scope.service.type = "Remote Web Service";
    $('#update_button').hide();

    Scope.save = function () {

        var id = Scope.service.id;
        Service.update({id:id}, Scope.group);

    };
    Scope.create = function () {

        Service.save(Scope.service, function(data){
            Scope.Services.record.push(data);
        });
    };
    Scope.isAppInGroup = function(){
        if(Scope.group){
            var id = this.app.id;
            var assignedApps = Scope.group.apps;
            assignedApps = $(assignedApps);
            var inGroup =false;
            assignedApps.each(function(index, val){
                if(val.id == id){
                    inGroup = true;
                }
            });

        }
        return inGroup;
    };
    Scope.addAppToGroup = function (checked) {

        if(checked == true){
            Scope.group.apps.push(this.app);
        }else{
            Scope.group.apps = removeByAttr(Scope.group.apps, 'id', this.app.id);
        }
    };
    Scope.delete = function () {
        var id = this.service.id;
        Service.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
        });
    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.service = {};
        $('#save_button').show();
        $('#update_button').hide();
    };
    Scope.showDetails = function(){
        Scope.service = this.service;
        Scope.action = "Update";
        $('#save_button').hide();
        $('#update_button').show();
    }
    removeByAttr = function(arr, attr, value){
        var i = arr.length;
        while(i--){
            if(arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )){
                arr.splice(i,1);
            }
        }
        return arr;
    };
};