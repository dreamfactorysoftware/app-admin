/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 3/26/13
 * Time: 7:51 PM
 * To change this template use File | Settings | File Templates.
 */
var PackageCtrl = function ($scope, App, Service, $http) {
    Scope = $scope;
    $scope.Apps = App.get();
    Scope.schemaData = {};
    Scope.Services = Service.get(function (data) {
        angular.forEach(data.record, function (service) {
            if (service.type.indexOf("SQL DB Schema") != -1) {
                $http.get('/rest/' + service.api_name + '/?app_name=admin&fields=*').success(function (data) {
                    service.components = data.resource;
                });
            }
        })
    });
    $scope.showDetails = function () {
        $("#splash").hide();
        this.app.app_service_relations = [];
        $scope.app = angular.copy(this.app);
        $("tr.info").removeClass('info');
        $('#row_' + Scope.app.id).addClass('info');

        $('#package-form').show();


    }
    Scope.isServiceInApp = function () {
        var inApp = false;
        angular.forEach(Scope.app.app_service_relations, service)
        {
            if (service.service_id == this.service_id) {
                console.log('a match');
                inApp = true;
            }
        }
        return inApp;
    };
    Scope.addServiceToAppWithComponents = function (checked) {
        var currentService = this.service;
        var currentComponent = this.component;
        if (checked == true) {
            if (Scope.app.app_service_relations.length < 1) {
                var packagedService = {"service_id": this.service.id, "api_name": this.service.api_name, components: [this.component]};
                Scope.app.app_service_relations.push(packagedService);
            } else {
                angular.forEach(Scope.app.app_service_relations, function (service) {
                    if (currentService.id == service.service_id) {
                        service.components.push(currentComponent)
                        return;
                    } else {
                        console.log('im adding');
                        var packagedService = {"service_id": currentService.id, "api_name": currentService.api_name, "components": [currentComponent]};
                        Scope.app.app_service_relations.push(packagedService);
                    }

                });
            }
        } else {

            //Scope.app.roles = removeByAttr(Scope.app.roles, 'id', this.role.id);
        }
    };
    Scope.addServiceToApp = function (checked) {
        if (checked == true) {
            var packagedService = {"service_id": this.service.id, "api_name": this.service.api_name};
            Scope.app.app_service_relations.push(packagedService);
        } else {
            Scope.app.app_service_relations = removeByAttr(Scope.app.app_service_relations, 'service_id', this.service.id);
        }
    };
    Scope.export = function(){
        var id = Scope.app.id;
        App.update({id:id}, Scope.app, function () {

        });
    }
}
