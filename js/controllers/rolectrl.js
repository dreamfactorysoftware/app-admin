var RoleCtrl = function ($scope, RolesRelated, User, App, Service, $http) {
    Scope = $scope;
    Scope.role = {users:[], apps:[]};
    Scope.action = "Create new ";
    Scope.actioned = "Created";
    $('#update_button').hide();
    $("#alert-container").empty().hide();
    $("#success-container").empty().hide();
    Scope.components = [
        {name:"*", label:"All"}
    ];
    Scope.component = '*';
    Scope.AllUsers = User.get();
    Scope.Apps = App.get();
    Scope.service = {service_id:null, access:"Full Access", component:"*"};
    Scope.selectServices = {};
    Scope.Services = Service.get(function (data) {
        var services = data.record;
        services.forEach(function (service) {
            if (service.type.indexOf("SQL") != -1) {
                $http.get('/rest/' + service.api_name + '/?app_name=admin&fields=*').success(function (data) {
                    service.components = data.resource;
                    Scope.selectServices[service.id] = data.resource;
                    var allRecord = {name:'*', label:'All', plural:'All'};
                    Scope.selectServices[service.id].unshift(allRecord);

                });
            }
        });
        if (Scope.Services.record) {
            Scope.Services.record.push({id:null, name:"All"})
        }
    });
    Scope.Roles = RolesRelated.get();
    Scope.save = function () {
        $("#alert-container").empty().hide();
        $("#success-container").hide();
        var id = this.role.id;
        RolesRelated.update({id:id}, Scope.role, function () {
            $("#success-container").html('Role successfully ' + Scope.actioned).show();

        }, function (response) {
            $("#alert-container").html(response.data.error[0].message).show();
        });
    };
    Scope.create = function () {
        RolesRelated.save(Scope.role, function (data) {
            Scope.Roles.record.push(data);
            $("#success-container").html('Role successfully ' + Scope.actioned).show();


        }, function (response) {
            $("#alert-container").html(response.data.error[0].message).show();
        });
    };
    Scope.isUserInRole = function () {
        var inRole = false;
        if (this.users) {
            if (checkForDuplicate(this.users, 'role_id', this.user.role_id)) {
                inRole = true;
            }
        }
        return inRole
    };

    Scope.isAppInRole = function () {
        var inRole = false;
        if (Scope.role.apps) {
            if (checkForDuplicate(Scope.role.apps, 'id', this.app.id)) {
                inRole = true;
            }
        }
        return inRole

    };
    Scope.addAppToRole = function (checked) {
        if (checked == true) {
            Scope.role.apps.push(this.app);
        } else {
            Scope.role.apps = removeByAttr(Scope.role.apps, 'id', this.app.id);
        }
    };
    $scope.updateUserToRole = function (checked) {
        if (checked == true) {
            Scope.role.users.push(this.user);
        } else {
            Scope.role.users = removeByAttr(Scope.role.users, 'id', this.user.id);
        }
    };
    Scope.loadComponents = function () {
        Scope.components = [];
        Scope.components.push({ name:"*", label:"All"});
        Scope.components = angular.copy(Scope.selectServices[Scope.service.service_id]);
    };
    Scope.loadIndComponents = function () {
        this.components = [];
        this.components.push({ name:"*", label:"All"});
        this.components = angular.copy(Scope.selectServices[this.service_access.service_id]);
    };

    Scope.removeAccess = function () {
        Scope.role.role_service_accesses = removeByAttrs(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component);
    };
    Scope.checkForExisting = function () {
        $("#alert-container").empty().hide();
        if (checkForDuplicates(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component)) {
            $("#alert-container").html("<b>You have duplicate access rules for one service/component</b>").show();
        }
    };
    Scope.addServiceAccess = function () {
        $("#alert-container").empty().hide();
        if (checkForDuplicates(Scope.role.role_service_accesses, 'service_id', Scope.service.service_id, 'component', Scope.service.component)) {
            $("#alert-container").html("<b>Service access already exits.</b>").show();
        } else {
            var newAccess = angular.copy(Scope.service);
            Scope.role.role_service_accesses.push(newAccess);

        }
    }
    Scope.editServiceAccess = function () {
        $("#alert-container").empty().hide();
        var newAccess = this.service_access;
        Scope.role.role_service_accesses = removeByAttrs(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component);
        Scope.role.role_service_accesses.push(newAccess);
    };

    $scope.delete = function () {
        var which = this.role.name;
        if (!which || which == '') {
            which = "the role?";
        } else {
            which = "the role '" + which + "'?";
        }
        if (!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.role.id;
        RolesRelated.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
        });
        Scope.promptForNew();
    };
    $scope.promptForNew = function () {
        Scope.action = "Create new";
        Scope.actioned = "Created";
        Scope.role = {users:[], apps:[]};
        $('#save_button').show();
        $('#update_button').hide();
        $("#alert-container").empty().hide();
        $("tr.info").removeClass('info');
    };
    $scope.showDetails = function () {
        Scope.action = "Edit this ";
        Scope.actioned = "Updated"
        Scope.currentRole = this.role;
        Scope.role = angular.copy(Scope.currentRole);
        Scope.service.role_id = angular.copy(Scope.currentRole.id);
        Scope.users = angular.copy(Scope.currentRole.users);
        $('#save_button').hide();
        $('#update_button').show();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.role.id).addClass('info');
    }

};