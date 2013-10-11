var QuickStartCtrl = function ($scope, App, Config, Service) {
    setCurrentApp('getting_started');
    Scope = $scope;
    Scope.Config = Config.get();
    Scope.allVerbs = ["GET","POST", "PUT", "MERGE", "PATCH", "DELETE", "COPY"];
    Scope.Services = Service.get(function(){

        Scope.Services.record.forEach(function(service){
            if (service.type.indexOf("Local File Storage") != -1){
                Scope.defaultStorageID = service.id;
            }

        });
    });
    Scope.step = 1;
    Scope.setStep = function(step){
        if(step == 2 && Scope.app.native =='1'){
            Scope.step = 4;
            Scope.create();
            var height = $(window).height();
            $('.well.main').css('height', height + 400);
            return;
        }
        Scope.step = step;
    }
    Scope.launchApp = function(){
        window.open(location.protocol + '//' + location.host + '/rest/app/applications/' + Scope.app.api_name+ '/index.html', "df-new");
    }
    Scope.downloadSDK = function(){
        $("#sdk-download").attr('src', location.protocol + '//' + location.host + '/rest/system/app/' + Scope.app.id + '?sdk=true')
    }
    Scope.addHost = function () {
        Scope.Config.allowed_hosts.push(Scope.CORS.host);
        Scope.CORS.host = "";
    }
    Scope.removeHost = function () {
        var index = this.$index;
        Scope.Config.allowed_hosts.splice(index, 1);
    }
    Scope.selectAll = function($event){

        if($event.target.checked){
            this.host.verbs = Scope.allVerbs;
        }else{
            this.host.verbs = [];
        }

    }
    Scope.toggleVerb = function () {

        var index = this.$parent.$index;
        if (Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb) === -1) {
            Scope.Config.allowed_hosts[index].verbs.push(this.verb);
        } else {
            Scope.Config.allowed_hosts[index].verbs.splice(Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb), 1);
        }
    };
    Scope.promptForNew = function(){
        var newhost = {};
        newhost.verbs = Scope.allVerbs;
        newhost.host = "";
        newhost.is_enabled = true;
        Scope.Config.allowed_hosts.unshift(newhost);
    }
    Scope.showCORS = function(){
        $("#cors-section").show();
        var height = $(window).height();
        $('.well.main').css('height', height + 400);
    }
    Scope.saveConfig = function () {
        Config.update(Scope.Config, function () {
                $.pnotify({
                    title: 'Configuration',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function (response) {
                var code = response.status;
//                if (code == 401) {
//                    if(window.top.Actions){
//
//                    }
//                    window.top.Actions.doSignInDialog("stay");
//                    return;
//                }
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

        if (Scope.app.native == '1') {
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
            Scope.app.launch_url = "";


        }else if(Scope.app.storage_service_id == 0){
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;

        }else{
            Scope.app.storage_service_id = Scope.defaultStorageID;
            Scope.app.storage_container = "applications"
        }
        Scope.app.name = Scope.app.api_name;
        App.save(Scope.app, function (data) {
                //Scope.Apps.record.push(data);
                Scope.app.id = data.id;
                //Scope.app = data;
                if(window.top.Actions){
                    window.top.Actions.updateSession("update");
                }
                $.pnotify({
                    title: Scope.app.api_name,
                    type: 'success',
                    text: 'Created Successfully'
                });

//                if (!Scope.app.native) {
//                    Scope.showAppPreview(data.launch_url);
//                }
            },
            function (response) {
                var code = response.status;
                if (code == 401) {
                    if(window.top.Actions){
                        window.top.Actions.doSignInDialog("stay");
                        return;
                    }
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
    $(function(){
        var height = $(window).height();
        var width = window.innerWidth - 300;
        $('#app-preview').css('height', height - 300).css('width', width);
        $('.well.main').css('height', height);
    });

    $(window).resize(function(){
        var height = $(window).height();
        var width = window.innerWidth - 300;
        $('#app-preview').css('height', height - 300).css('width', width);
        $('.well.main').css('height', height);

    });
};