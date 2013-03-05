/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 1/28/13
 * Time: 12:17 PM
 * To change this template use File | Settings | File Templates.
 */
var AdminApp = angular.module("AdminApp", ["ngResource", "ngGrid"]).
    config(function ($routeProvider) {
        $routeProvider.when('/app', { controller:AppCtrl, templateUrl:'applications.html' });
        $routeProvider.when('/user', { controller:UserCtrl, templateUrl:'users.html' });
        $routeProvider.when('/role', { controller:RoleCtrl, templateUrl:'roles.html' });
        $routeProvider.when('/group', { controller:GroupCtrl, templateUrl:'groups.html' });
        $routeProvider.when('/schema', { controller:SchemaCtrl, templateUrl:'schema.html' });
        $routeProvider.when('/service', { controller:ServiceCtrl, templateUrl:'services.html' });
        $routeProvider.when('/import', { controller:FileCtrl, templateUrl:'import.html' });

    }).
    directive('uiValidateEquals', function() {

        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {

                function validateEqual(myValue, otherValue) {
                    if (myValue === otherValue) {
                        ctrl.$setValidity('equal', true);
                        return myValue;
                    } else {
                        ctrl.$setValidity('equal', false);
                        return undefined;
                    }
                }

                scope.$watch(attrs.uiValidateEquals, function(otherModelValue) {
                    validateEqual(ctrl.$viewValue, otherModelValue);
                });

                ctrl.$parsers.unshift(function(viewValue) {
                    return validateEqual(viewValue, scope.$eval(attrs.uiValidateEquals));
                });

                ctrl.$formatters.unshift(function(modelValue) {
                    return validateEqual(modelValue, scope.$eval(attrs.uiValidateEquals));
                });
            }
        };
    });
AdminApp.factory('AppsRelated', function ($resource) {
    return $resource('/rest/system/app/:id/?app_name=admin&fields=*&related=roles', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('App', function ($resource) {
    return $resource('/rest/system/app/:id/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('User', function ($resource) {
    return $resource('/rest/system/user/:id/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('Role', function ($resource) {
    return $resource('/rest/system/role/:id/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('RolesRelated', function ($resource) {
    return $resource('/rest/system/role/:id/?app_name=admin&fields=*&related=users,apps,role_service_accesses', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('Service', function ($resource) {
    return $resource('/rest/system/service/:id/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('Schema', function ($resource) {
    return $resource('/rest/schema/:name/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('DB', function ($resource) {
    return $resource('/rest/db/:name/?app_name=admin&fields=*', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('Group', function ($resource) {
    return $resource('/rest/system/app_group/:id/?app_name=admin&fields=*&related=apps', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
AdminApp.factory('Group', function ($resource) {
    return $resource('/rest/system/app_group/:id/?app_name=admin&fields=*&related=apps', {}, { update:{ method:'PUT' }, query:{
        method:'GET',
        isArray:false
    } });
});
var setCurrentApp = function(currentApp){
    $('.active').removeClass('active');
    $("#nav_" + currentApp).addClass("active");
};
$(document).ready(function () {
    $('#app-container').css('height', ($(window).height()-44));
    // $('#grid-table').css('max-height', ($(window).height()-56)).css('height', ($(window).height()-56));

    $(window).resize(function () {
        $('#app-container').css('height', ($(window).height()-44));
        // $('#grid-table').css('max-height', ($(window).height()-56)).css('height', ($(window).height()-56));
    });
});
