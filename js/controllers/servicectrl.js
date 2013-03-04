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
    Scope.serviceOptions = [{name:"Remote Web Service"},{name:"Remote SQL DB"}];
    $('#update_button').hide();

    Scope.save = function () {
        if(Scope.service.type =="Remote SQL DB"){
            Scope.service.credentials = {dsn:Scope.service.dsn, user:Scope.service.user, pwd:Scope.service.pwd};
            Scope.service.credentials = JSON.stringify(Scope.service.credentials);
        }
        var id = Scope.service.id;
        Service.update({id:id}, Scope.service);

    };
    Scope.create = function () {
        if(Scope.service.type =="Remote SQL DB"){
            Scope.service.credentials = {dsn:Scope.service.dsn, user:Scope.service.user, pwd:Scope.service.pwd};
            Scope.service.credentials = JSON.stringify(Scope.service.credentials);
        }
        Service.save(Scope.service, function(data){
            Scope.Services.record.push(data);
        });
    };

    Scope.showFields = function(){

        switch(Scope.service.type)
        {
            case "Remote SQL DB":
                $(".base_url, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format").hide();
                $(".user, .pwd, .dsn").show();
                break;
            case "Remote Web Service":
                $(".user, .pwd, .dsn .storage_name, .storage_type, .credentials, .native_format").hide();
                $(".base_url, .parameters, .headers").show();
                break;
            default:
                $(".base_url, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format").hide();
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
        if(Scope.service.type =="Remote SQL DB"){
            var cString = JSON.parse(Scope.service.credentials);
            Scope.service.dsn = cString.dsn;
            Scope.service.user = cString.user;
            Scope.service.pwd = cString.pwd;

        }
        Scope.action = "Update";
        $('#save_button').hide();
        $('#update_button').show();
        Scope.showFields();
    }

};