var AppCtrl = function ($scope, AppsRelated, Role, $http, Service, $location, $timeout) {

    $('#alert_container').empty();
    Scope = $scope;
    Scope.alerts = [];
    Scope.currentServer = CurrentServer;
    Scope.action = "Create";
    setCurrentApp('applications');
    Scope.app = {is_url_external:0, native:true, allow_fullscreen_toggle:0, requires_fullscreen: '0', roles: [], storage_service_id: null};
    $('#update_button').hide();
    $('.external').hide();

    Scope.storageOptions = [];

    Scope.Apps = AppsRelated.get(function () {
    }, function (response) {
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
    Scope.Roles = Role.get(function () {
    }, function (response) {
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
    Scope.Services = Service.get(function () {
        Scope.storageServices = [];
        Scope.storageContainers = {}
        Scope.Services.record.forEach(function (service) {

            if (service.type.indexOf("File Storage") != -1) {
                Scope.storageServices.push(service);

                $http.get('/rest/' + service.api_name + '?app_name=admin').success(function (data) {
                    Scope.storageContainers[service.id] = {options: []};
                    data.resource.forEach(function (container) {
                        if(service.api_name =="app"){
                            Scope.app.storage_service_id = service.id;
                            Scope.defaultStorageID = service.id;
                            Scope.app.storage_container = "applications";
                            Scope.storageContainers[service.id].options.push({name: container.name});
                            Scope.storageContainers[service.id].name = service.api_name;
                            Scope.loadStorageContainers();
                        }else{
                            Scope.storageContainers[service.id].options.push({name: container.name});
                            Scope.storageContainers[service.id].name = service.api_name;
                        }

                    })

                });
            }



        });
    })

    Scope.loadStorageContainers = function () {
        Scope.storageOptions = [];
        Scope.storageOptions = Scope.storageContainers[Scope.app.storage_service_id].options;




    }
    Scope.formChanged = function () {
        $('#save_' + this.app.id).removeClass('disabled');
    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.app = {is_url_external: '0',native:true, requires_fullscreen: '0', roles: []};
        Scope.app.storage_service_id = Scope.defaultStorageID;
        Scope.app.storage_container = "applications";
        $('#context-root').show();
        $('#file-manager').hide();
        $('#app-preview').hide();
        $('#step1').show();
        $('#create_button').show();
        $('#update_button').hide();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
    };
    Scope.save = function () {
        if(Scope.app.native){
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
            Scope.app.name = Scope.app.api_name;
            Scope.app.launch_url = "";
        }
        var id = Scope.app.id;
        AppsRelated.update({id: id}, Scope.app, function (data) {
                updateByAttr(Scope.Apps.record, 'id', id, data);

                window.top.Actions.updateSession("update");

                $.pnotify({
                    title: Scope.app.name,
                    type: 'success',
                    text: 'Updated Successfully'
                });
                $(document).scrollTop();
                Scope.promptForNew();

            },
            function (response) {
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
    Scope.goToImport = function () {
        $location.path('/import');
    }
    Scope.create = function () {
        if(Scope.app.native){
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
            Scope.app.name = Scope.app.api_name;
            Scope.app.launch_url = "";

        }
        AppsRelated.save(Scope.app, function (data) {
                Scope.Apps.record.push(data);
                //Scope.app.id = data.id;
                //Scope.app = data;
                window.top.Actions.updateSession("update");
                $.pnotify({
                    title: Scope.app.name,
                    type: 'success',
                    text: 'Created Successfully'
                });
                Scope.promptForNew();
                if(!Scope.app.native){
                    Scope.showAppPreview(data.launch_url);
                }
            },
            function (response) {
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

    Scope.delete = function () {
        var which = this.app.name;
        if (!which || which == '') {
            which = "the application?";
        } else {
            which = "the application '" + which + "'?";
        }
        if (!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.app.id;
        AppsRelated.delete({ id: id }, function () {
                $("#row_" + id).fadeOut();
                window.top.Actions.updateSession();

                Scope.promptForNew();
                $.pnotify({
                    title: Scope.app.name,
                    type: 'success',
                    text: 'Removed Successfully'
                });
            },
            function (response) {
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
    Scope.postFile = function (target) {
        console.log(target);
    }
    Scope.showLocal = function () {
        $('.local').show();
        $('.external').hide();
    };
    Scope.hideLocal = function () {
        $('.local').hide();
        $('.external').show();
    };
    Scope.showFileManager = function () {
        Scope.action = "Edit Files for this";
        $('#step1').hide();
        $('#app-preview').hide();
        $('#create_button').hide();
        $('#update_button').hide();
        $("#file-manager").show();
        var container;
        if(this.app.storage_service_id){
            container = this.app.storage_container || null;
            container = container? this.app.storage_container + "/" : '';
            $("#file-manager iframe").css('height', $(window).height() - 200).attr("src", CurrentServer + '/public/admin/filemanager/?path=/' + Scope.storageContainers[this.app.storage_service_id].name + '/' + container + this.app.api_name + '/&allowroot=false').show();
        }else{
            $("#file-manager iframe").css('height', $(window).height() - 200).attr("src", CurrentServer + '/public/admin/filemanager/?path=/app/applications/' + this.app.api_name + '/&allowroot=false').show();
        }


    };
    Scope.showAppPreview = function (appUrl) {

        Scope.action = "Preview ";
        $('#step1').hide();

        $("#app-preview").show();


        $("#app-preview  iframe").css('height', $(window).height() - 200).attr("src", appUrl).show();
        $('#create_button').hide();
        $('#update_button').hide();
        $('#file-manager').hide();
    };

    Scope.showDetails = function () {
        Scope.app = {};
        Scope.action = "Update";
        Scope.app = this.app;
        if(!this.app.storage_service_id){
            Scope.app.storage_service_id = Scope.defaultStorageID;
            Scope.app.storage_container = "applications";
        }


        Scope.loadStorageContainers();
        if(!Scope.app.launch_url ){
            Scope.app.native = true;
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
        }
        if(Scope.app.is_url_external == 1){
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
        }
        $('#button_holder').hide();
        $('#file-manager').hide();
        $('#app-preview').hide();
        $('#step1').show();
        $('#create_button').hide();
        $('#update_button').show();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.app.id).addClass('info');
    }
    Scope.isAppInRole = function () {
        var inGroup = false;
        if (Scope.app) {
            var id = this.role.id;
            var assignedRoles = Scope.app.roles;
            assignedRoles = $(assignedRoles);

            assignedRoles.each(function (index, val) {
                if (val.id == id) {
                    inGroup = true;
                }
            });

        }
        return inGroup;
    };
    Scope.addRoleToApp = function (checked) {

        if (checked == true) {
            Scope.app.roles.push(this.role);
        } else {
            Scope.app.roles = removeByAttr(Scope.app.roles, 'id', this.role.id);
        }
    };

    Scope.reload = function () {
        Scope.Apps = AppsRelated.get();
    }
    $(window).resize();
};

