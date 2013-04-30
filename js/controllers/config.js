var ConfigCtrl = function ($scope, Config, Role) {
    Scope = $scope;
    Scope.Config = Config.get(function(){}, function(response){
        var code = response.status;
        if(code == 401){
            window.top.Actions.doSignInDialog("stay");
            return;
        }
        var error = response.data.error;
        $.pnotify({
            title: 'Error' ,
            type: 'error',
            hide:false,
            addclass: "stack-bottomright",
            text: error[0].message
        });



    });
    Scope.Roles = Role.get(function(){}, function(response){
        var code = response.status;
        if(code == 401){
            window.top.Actions.doSignInDialog("stay");
            return;
        }
        var error = response.data.error;
        $.pnotify({
            title: 'Error' ,
            type: 'error',
            hide:false,
            addclass: "stack-bottomright",
            text: error[0].message
        });



    });
    Scope.save = function () {
        Config.update(Scope.Config, function() {
                $.pnotify({
                    title: 'Configuration',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function(response){
                var code = response.status;
                if(code == 401){
                    window.top.Actions.doSignInDialog("stay");
                    return;
                }
                var error = response.data.error;
                $.pnotify({
                    title: 'Error' ,
                    type: 'error',
                    hide:false,
                    addclass: "stack-bottomright",
                    text: error[0].message
                });


            });
    };
}
