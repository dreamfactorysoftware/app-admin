/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 2/7/13
 * Time: 4:23 AM
 * To change this template use File | Settings | File Templates.
 */
var GroupCtrl = function ($scope, Group, App, $timeout) {
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    Scope = $scope;
    Scope.group = {apps:[]};
    Scope.Groups = Group.get();
    Scope.Apps = App.get();
    Scope.action = "Create";
    $('#update_button').hide();

    Scope.save = function () {

        var id = Scope.group.id;
        Group.update({id:id}, Scope.group, function(){
            Scope.promptForNew();
            window.top.Actions.updateSession("update");
            /*
            $timeout(function(){
                window.top.Actions.showStatus("Updated Successfully");
            },1000);
            */
            $.pnotify({
                title: 'App Groups',
                type: 'success',
                text: 'Updated Successfully.'
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

    };
    Scope.create = function () {

        Group.save(Scope.group, function(data){
            Scope.Groups.record.push(data);
            Scope.promptForNew();
            window.top.Actions.updateSession("update");
            /*
            $timeout(function(){
                window.top.Actions.showStatus("Created Successfully");
            },1000);
            */
            $.pnotify({
                title: 'App Groups',
                type: 'success',
                text: 'Created Successfully.'
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
    };
    Scope.isAppInGroup = function(){
        if(Scope.group){
            var id = this.app.id;
            var assignedApps = Scope.group.apps;
            assignedApps = $(assignedApps);
            var inGroup =false;
            assignedApps.each(function(index, val){
                if(val.id == id){
                    inGroup = true;
                }
            });

        }
        return inGroup;
    };
    Scope.addAppToGroup = function (checked) {

        if(checked == true){
            Scope.group.apps.push(this.app);
        }else{
            Scope.group.apps = removeByAttr(Scope.group.apps, 'id', this.app.id);
        }
    };
    Scope.delete = function () {
        var which = this.group.name;
        if (!which || which == '') {
            which = "the group?";
        } else {
            which = "the group '" + which + "'?";
        }
        if(!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.group.id;
        Group.delete({ id:id }, function () {
            Scope.promptForNew();
            //window.top.Actions.showStatus("Deleted Successfully");
            $.pnotify({
                title: 'App Groups',
                type: 'success',
                text: 'Deleted Successfully.'
            });

            $("#row_" + id).fadeOut();
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
    };
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.group = {apps:[]};
        $('#save_button').show();
        $('#update_button').hide();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
    };
    Scope.showDetails = function(){
        Scope.action = "Update";
        Scope.group = this.group;
        $('#save_button').hide();
        $('#update_button').show();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.group.id).addClass('info');
    }

};