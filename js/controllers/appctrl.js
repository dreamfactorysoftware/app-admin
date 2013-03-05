var AppCtrl = function ($scope, AppsRelated, Role, $location) {

    $('#alert_container').empty();
    Scope = $scope;
    Scope.alerts =[];

    Scope.action = "Create";
    setCurrentApp('applications');
    Scope.app = {is_url_external:'0',roles:[]};
    $('#update_button').hide();
    $('.external').hide();
    Scope.currentServer = window.location.host;
    Scope.Apps = AppsRelated.get();
    Scope.Roles = Role.get();

    Scope.formChanged = function () {
        $('#save_' + this.app.id).removeClass('disabled');
    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.app = {roles:[]};
        $('#context-root').show();
        $('#file-manager').hide();
        $('#app-preview').hide();
        $('#step1').show();
        $('#create_button').show();
        $('#update_button').hide();
    };
    Scope.save = function () {

        var id = Scope.app.id;
        AppsRelated.update({id:id}, Scope.app, function () {
            $('#save_' + id).addClass('disabled');

        });
    };
    Scope.goToImport = function(){
        $location.path('/import');
    }
    Scope.create = function () {

        AppsRelated.save(Scope.app, function (data) {
                Scope.Apps.record.push(Scope.app);
                Scope.app.id = data.id;
                //Scope.app = data;
                window.top.Actions.updateSession();
                Scope.showAppPreview();
            },
            function(response){
                var errors = response.data.error;
                errors.forEach(function(){
                    //Scope.alerts.push(val);
                    console.log(this);
                }, this);
                //Scope.alerts.push(response.data.error);
            });


    };

    Scope.delete = function () {
        var id = this.app.id;
        AppsRelated.delete({ id:id }, function () {
            $("#row_" + id).fadeOut();
        });
    };
    Scope.postFile = function(target){
        console.log(target);
    }
    Scope.showLocal = function(){
        $('.local').show();
        $('.external').hide();
    };
    Scope.hideLocal = function(){
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
        $("#file-manager iframe").css('height', $(window).height() - 200).attr("src", 'http://' + location.host + '/public/admin/filemanager/?path=' + this.app.api_name).show();
    };
    Scope.showAppPreview = function () {
        var path = "";
        Scope.action = "Preview ";
        $('#step1').hide();

        $("#app-preview").show();
        if(this.app.is_url_external == '0'){
            path =  'http://' + location.host + '/app/' + this.app.api_name + '/' + this.app.url;
        }else{
            path = this.app.url;
        }
        $("#app-preview  iframe").css('height', $(window).height() - 200).attr("src", path ).show();
        //$("#file-manager iframe").css('height', $(window).height() - 200).attr("src", 'http://' + location.host + '/public/admin/filemanager/?path=' + name).show();
        $('#create_button').hide();
        $('#update_button').hide();
        $('#file-manager').hide();
    };

    Scope.showDetails = function () {
        Scope.action = "Update";
        Scope.app = this.app;
        if(Scope.app.is_url_external == 1){
            Scope.hideLocal();
        }else{
            Scope.showLocal();
        }
        $('#button_holder').hide();
        $('#context-root').hide();
        $('#file-manager').hide();
        $('#app-preview').hide();
        $('#step1').show();
        $('#create_button').hide();
        $('#update_button').show();
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

    Scope.reload = function(){
        Scope.Apps = AppsRelated.get();
    }

};