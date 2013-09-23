var RoleCtrl = function ($scope, RolesRelated, User, App, Service, $http) {
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    Scope = $scope;
    Scope.role = {users: [], apps: [], role_service_accesses: [], role_system_accesses:[]};
    Scope.action = "Create new ";
    Scope.actioned = "Created";
    $('#update_button').hide();
    //$("#alert-container").empty().hide();
    //$("#success-container").empty().hide();
    Scope.components = [
        {name: "*", label: "All"}
    ];

    Scope.systemComponents = [];

    Scope.component = '*';
    Scope.AllUsers = User.get();
    Scope.Apps = App.get();
    Scope.service = {service_id: null, access: "Full Access", component: "*"};
    Scope.selectServices = {};
    Scope.Services = Service.get(function (data) {
        var services = data.record;
        services.unshift({id: null, name: "All", type: ""});
        services.unshift({id: "0", name: "System", type: "System", api_name:"system"});
        services.forEach(function (service) {
            //if (service.type.indexOf("SQL") != -1) {
            if(service.id != null){
                $http.get('/rest/' + service.api_name + '/?app_name=admin&fields=*').success(function (data) {
                    try{
                        service.components = data.resource;
                        Scope.selectServices[service.id] = data.resource;
                        var allRecord = {name: '*', label: 'All', plural: 'All'};
                        Scope.selectServices[service.id].unshift(allRecord);
                    }catch(err){}
                }).error(function(){});
            }
            //}
        });

    });

    Scope.Roles = RolesRelated.get();
    Scope.save = function () {
        Scope.role.role_system_accesses = [];
        Scope.role.role_service_accesses.forEach(function(access){
            if(access.service_id == "0"){

                //delete access.service_id;
                Scope.role.role_system_accesses.push(access);
            }

        });

        Scope.role.role_service_accesses=Scope.role.role_service_accesses.filter(function(itm){return itm.service_id !== "0"});
        var id = this.role.id;
        RolesRelated.update({id: id}, Scope.role, function () {
            updateByAttr(Scope.Roles.record, 'id', id, Scope.role);
            Scope.promptForNew();
            //window.top.Actions.showStatus("Updated Successfully");

            // Success Message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role Updated Successfully'
            });
        }, function (response) {
            //$("#alert-container").html(response.data.error[0].message).show();

            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            var error = response.data.error;
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: error[0].message
            });
        });
    };
    Scope.create = function () {
        Scope.role.role_system_accesses = [];
        Scope.role.role_service_accesses.forEach(function(access){
            if(access.service_id == "0"){
                Scope.role.role_system_accesses.push(access);
            }

        });

        Scope.role.role_service_accesses=Scope.role.role_service_accesses.filter(function(itm){return itm.service_id !== "0"});

        RolesRelated.save(Scope.role, function (data) {
            Scope.Roles.record.push(data);
            //window.top.Actions.showStatus("Created Successfully");
            Scope.promptForNew();

            // Success Message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role Created Successfully'
            });

        }, function (response) {
            //$("#alert-container").html(response.data.error[0].message).show();

            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            var error = response.data.error;
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: error[0].message
            });
        });
    };

    Scope.isUserInRole = function () {
        var currentUser = this.user;
        var inRole = false;
        if (Scope.role.users) {
            angular.forEach(Scope.role.users, function (user) {
                if (angular.equals(user.id, currentUser.id)) {
                    inRole = true;
                }
            });
        }
        return inRole;
    };

    Scope.isAppInRole = function () {

        var currentApp = this.app;
        var inRole = false;
        if (Scope.role.apps) {
            angular.forEach(Scope.role.apps, function (app) {
                if (angular.equals(app.id, currentApp.id)) {
                    inRole = true;
                }
            });
        }
        return inRole;
    };
    Scope.addAppToRole = function () {
        if (checkForDuplicate(Scope.role.apps, 'id', this.app.id)) {
            Scope.role.apps = removeByAttr(Scope.role.apps, 'id', this.app.id);
        } else {
            Scope.role.apps.push(this.app);
        }
    };
    $scope.updateUserToRole = function () {
        if (checkForDuplicate(Scope.role.users, 'id', this.user.id)) {
            Scope.role.users = removeByAttr(Scope.role.users, 'id', this.user.id);
        } else {
            Scope.role.users.push(this.user);
        }
    };
    Scope.loadComponents = function () {
        Scope.components = [];
        Scope.components.push({ name: "*", label: "All"});
        Scope.components = angular.copy(Scope.selectServices[Scope.service.service_id]);
    };
    Scope.loadIndComponents = function () {
        this.components = [];
        this.components.push({ name: "*", label: "All"});
        //this.components.push({name:"System", label:"System"});
        this.components = angular.copy(Scope.selectServices[this.service_access.service_id]);
    };

    Scope.removeAccess = function () {
        var rows = Scope.role.role_service_accesses;
        var row = this.service_access;
        angular.forEach(rows, function(access, index){
            if(access.service_id === row.service_id && access.component == row.component){
                // console.log(index);
                rows.splice(index, 1);
            }
        });
        //Scope.role.role_service_accesses = removeByAttrs(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component);
    };

    Scope.addServiceAccess = function () {
        //$("#alert-container").empty().hide();
        var newAccess = angular.copy(Scope.service);
        if (checkForDuplicates(Scope.role.role_service_accesses, 'service_id', Scope.service.service_id, 'component', Scope.service.component)) {
            //$("#alert-container").html("<b>Service access already exists.</b>").show();
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Service access already exists.'
            });
        } else if (Scope.service.service_id === null) {

            if (Scope.role.role_service_accesses.length > 0) {
                var inRole = false;
                angular.forEach(Scope.role.role_service_accesses, function (access) {
                    if (access.service_id === null) {
                        inRole = true;
                    }
                });
                if (inRole) {
                    //$("#alert-container").html("<b>Service access already exists for all components.</b>").show();

                    $.pnotify({
                        title: 'Roles',
                        type: 'error',
                        text: 'Service access already exists for all components.'
                    });

                } else {
                    Scope.role.role_service_accesses.push(newAccess);
                    $.pnotify({
                        title: 'Roles',
                        type: 'success',
                        text: 'Added below, press save/update to finalize'
                    });

                }
            } else {

                Scope.role.role_service_accesses.push(newAccess);
                $.pnotify({
                    title: 'Roles',
                    type: 'success',
                    text: 'Added below, press save/update to finalize'
                });

            }

        } else {

            Scope.role.role_service_accesses.push(newAccess);
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Added below, press save/update to finalize'
            });
        }
    }
    Scope.editServiceAccess = function () {
        //$("#alert-container").empty().hide();
        var newAccess = this.service_access;
        Scope.role.role_service_accesses = removeByAttrs(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component);
        Scope.role.role_service_accesses.push(newAccess);
    };


    //ADDED PNOTIFY
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
        RolesRelated.delete({ id: id }, function () {
            Scope.promptForNew();

            //window.top.Actions.showStatus("Deleted Successfully");
            $("#row_" + id).fadeOut();

            // Success message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role deleted.'
            });
        }, function(response) {

            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            var error = response.data.error;
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: error[0].message
            });
        });

        // Shouldn't prompt for new on failure
        //Scope.promptForNew();
    };
    $scope.promptForNew = function () {
        angular.element(":checkbox").attr('checked', false);
        Scope.action = "Create new";
        Scope.actioned = "Created";
        Scope.service = {service_id: null, access: "Full Access", component: "*"};
        //Scope.selectServices = {};
        Scope.role = {users: [], apps: [], role_service_accesses: [], role_system_accesses:[]};
        $('#save_button').show();
        $('#update_button').hide();
        //$("#alert-container").empty().hide();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
    };
    $scope.showDetails = function () {
        //angular.element(":checkbox").attr('checked',false);
        Scope.action = "Edit this ";
        Scope.actioned = "Updated";
        Scope.role = angular.copy(this.role);
        Scope.service = {service_id: null, access: "Full Access", component: "*"};
        Scope.service.role_id = angular.copy(Scope.role.id);
        Scope.users = angular.copy(Scope.role.users);
        Scope.apps = angular.copy(Scope.role.apps);
        Scope.role.role_system_accesses.forEach(function(access){
            access.service_id = "0";
            Scope.role.role_service_accesses.push(access);
        });
        //Scope.accesses = angular.copy(Scope.role.role_service_accesses);
        $('#save_button').hide();
        $('#update_button').show();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.role.id).addClass('info');
    }
    $scope.makeDefault = function(){
        Scope.role.default_app_id = this.app.id;
    };
    $scope.clearDefault = function(){
        Scope.role.default_app_id = null;
    };
};