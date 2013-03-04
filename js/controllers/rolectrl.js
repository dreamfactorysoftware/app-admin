var RoleCtrl = function ($scope, RolesRelated, User, App, Service, $http) {
    Scope = $scope;
    Scope.role = {users:[], apps:[]};
    Scope.action = "Create new ";
    $('#update_button').hide();
    Scope.components = [{name:"*", label:"All"}];
    Scope.component = '*';
    Scope.AllUsers = User.get();
    Scope.Apps = App.get();
    Scope.service = {service_id:null,access:"Full Access", component: "*"};
    Scope.selectServices = {};
    Scope.Services = Service.get(function(data){
        var services = data.record;
        services.forEach(function(service){
            if(service.type.contains("SQL")){
                $http.get('/rest/'+ service.api_name + '/?app_name=admin&fields=*').success(function(data){
                    service.components = data.resource;
                    Scope.selectServices[service.id] = data.resource;
                    var allRecord = {name:'*', label:'All', plural: 'All'};
                    Scope.selectServices[service.id].unshift(allRecord);

                });
            }
        });
        if(Scope.Services.record){
            Scope.Services.record.push({id: null, name: "All"})
        }
    });
    Scope.Roles = RolesRelated.get();
    Scope.save = function () {
        var id = this.role.id;
        RolesRelated.update({id:id}, Scope.role, function () {
        });
    };
    Scope.create = function () {
        RolesRelated.save(Scope.role, function (data) {
            Scope.Roles.record.push(data);
        });
    };
    Scope.isUserInRole = function(){
        var inRole = false;
        if(Scope.role.users.length > 0){
            if(this.user.role_id == Scope.role.id){
                inRole = true;
            }
            return inRole;
        }
    };
    Scope.isAppInRole = function(){
        var inGroup =false;
        if(Scope.role){
            var id = this.app.id;
            var assignedApps = Scope.role.apps;
            assignedApps = $(assignedApps);

            assignedApps.each(function(index, val){
                if(val.id == id){
                    inGroup = true;
                }
            });
        }
        return inGroup;
    };
    Scope.addAppToRole = function (checked) {
        if(checked == true){
            Scope.role.apps.push(this.app);
        }else{
            Scope.role.apps = removeByAttr(Scope.role.apps, 'id', this.app.id);
        }
    };
    $scope.updateUserToRole = function (checked) {
        if(checked == true){
            Scope.role.users.push(this.user);
        }else{
            Scope.role.users = removeByAttr(Scope.role.users, 'id', this.user.id);
        }
    };
    Scope.loadComponents = function(){
        Scope.components = [];
        Scope.components.push({ name:"*", label:"All"});
        Scope.components = Scope.selectServices[Scope.service.service_id];
    };
    Scope.loadIndComponents = function(){
        this.components = [];
        this.components.push({ name:"*", label:"All"});
        this.components = Scope.selectServices[this.service_access.service_id];
    };

    Scope.removeAccess = function(){
        Scope.role.role_service_accesses = removeByAttrs(Scope.role.role_service_accesses, 'service_id', this.service_access.service_id, 'component', this.service_access.component);
    };
    Scope.addServiceAccess = function(){
        $("#alert-container").empty().hide();
        if(checkForDuplicates(Scope.role.role_service_accesses, 'service_id', Scope.service.service_id, 'component', Scope.service.component)){
            $("#alert-container").html("<b>Service access already exits.</b>").show();
        }else{
            Scope.role.role_service_accesses.push(Scope.service);
            Scope.service = {service_id:null,access:"Full Access", component: "*"};
        }
    }

    removeByAttr = function (arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )) {
                arr.splice(i, 1);
            }
        }
        return arr;
    };
    removeByAttrs = function(arr, attr1, value1, attr2, value2){
        var i = arr.length;
        while(i--){
            if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){
                if(arr[i][attr2] && (arguments.length > 2 && arr[i][attr2] === value2)){
                    arr.splice(i,1);
                }

            }
        }
        return arr;
    };
    checkForDuplicates = function(arr, attr1, value1, attr2, value2){
        var i = arr.length;
        var found=false;
        while(i--){
            if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){
                if(arr[i][attr2] && (arguments.length > 2 && arr[i][attr2] === value2)){
                    found=true;
                }

            }
        }
        return found;
    };

    $scope.delete = function () {
        var id = this.role.id;
        RolesRelated.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
        });
        Scope.promptForNew();
    };
    $scope.promptForNew = function () {
        Scope.action = "Create new";
        Scope.role = {users:[], apps:[]};
        $('#save_button').show();
        $('#update_button').hide();
        $("#alert-container").emptpy().hide();
    };
    $scope.showDetails = function () {
        Scope.action = "Edit this ";
        Scope.role = this.role;
        Scope.service.role_id = this.role.id;
        Scope.users = this.role.users;
        $('#save_button').hide();
        $('#update_button').show();
    }

};