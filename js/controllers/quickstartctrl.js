var QuickStartCtrl = function ($scope, App, Config, Service) {
    Scope = $scope;
    $scope.Config = Config.get();
    $scope.Services = Service.get(function(){

        $scope.Services.record.forEach(function(service){
            if (service.type.indexOf("Local File Storage") != -1){
                $scope.defaultStorageID = service.id;
            }

        });
    });
    $scope.step = 1;
    $scope.setStep = function(step){
        if(step == 2 && $scope.app.native =='1'){
            $scope.step = 4;
            $scope.create();
            return;
        }
        $scope.step = step;
    }
    $scope.create = function () {
        if ($scope.app.native == '1') {
            $scope.app.storage_service_id = null;
            $scope.app.storage_container = null;
            $scope.app.launch_url = "";


        }else{
            $scope.app.storage_service_id = $scope.defaultStorageID;
            $scope.app.storage_container = "applications"
        }
        $scope.app.name = $scope.app.api_name;
        App.save($scope.app, function (data) {
                //Scope.Apps.record.push(data);
                //Scope.app.id = data.id;
                //Scope.app = data;
            if(window.top.Actions){
                window.top.Actions.updateSession("update");
            }
                $.pnotify({
                    title: $scope.app.api_name,
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
};