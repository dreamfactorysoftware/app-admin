var ConfigCtrl = function ($scope, Config, Role) {
    Scope = $scope;
    Scope.allVerbs = ["GET","POST", "PUT", "MERGE", "PATCH", "DELETE", "COPY"];
    Scope.Config = Config.get(function () {
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
    Scope.addHost = function () {
        Scope.Config.allowed_hosts.push(Scope.CORS.host);
        Scope.CORS.host = "";
    }
    Scope.save = function () {
        Config.update(Scope.Config, function () {
                $.pnotify({
                    title: 'Configuration',
                    type: 'success',
                    text: 'Updated Successfully'
                });
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
        newhost.is_active = true;
        Scope.Config.allowed_hosts.unshift(newhost);
    }
}
