/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 2/7/13
 * Time: 4:23 AM
 * To change this template use File | Settings | File Templates.
 */
var ServiceCtrl = function ($scope, Service, $rootScope) {
    Scope = $scope;
    Scope.promptForNew = function () {
        Scope.action = "Create";
        $('#step1').show();
        Scope.service = {};
        Scope.tableData = [];
        Scope.headerData = [];
        $("#swagger, #swagger iframe").hide();
        $('#save_button').show();
        $('#update_button').hide();
        $("tr.info").removeClass('info');
        Scope.service.type = "Remote Web Service";
        Scope.showFields();
        Scope.service.storage_type = "aws s3";
        Scope.aws = {};
        Scope.azure = {};
        Scope.service.is_active=true;
        $(window).scrollTop(0);
    };


    var inputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
    //var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-click="deleteRow()"><li class="icon-remove"></li></button></div>';
    var headerInputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableHeaderSave()" />';
    //var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var headerButtonTemplate = '<div><button id="header_save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveHeaderRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-click="deleteHeaderRow()"><li class="icon-remove"></li></button></div>';

    Scope.columnDefs = [
        {field:'name', width:100},
        {field:'value', enableFocusedCellEdit:true, width:200, enableCellSelection:true, editableCellTemplate:inputTemplate },
        {field:'Update', cellTemplate:buttonTemplate, width:80}
    ];
    Scope.browseOptions = {data:'tableData', width:500, columnDefs:'columnDefs', canSelectRows:false, displaySelectionCheckbox:false};
    Scope.headerColumnDefs = [
        {field:'name', width:100},
        {field:'value', enableFocusedCellEdit:true, width:200, enableCellSelection:true, editableCellTemplate:inputTemplate },
        {field:'Update', cellTemplate:headerButtonTemplate, width:80}
    ];
    Scope.headerOptions = {data:'headerData', width:500, columnDefs:'headerColumnDefs', canSelectRows:false, displaySelectionCheckbox:false};

    Scope.service = {};
    Scope.Services = Service.get();
    Scope.action = "Create";

    Scope.remoteOptions = [
        {name:"Amazon S3", value:"aws s3"},
        {name:"Windows Azure Storage", value:"azure blob"}
    ];
    Scope.service.storage_type = "aws s3";
    Scope.serviceOptions = [
        {name:"Remote Web Service"},
        {name:"Local SQL DB"},
        {name:"Remote SQL DB"},
        {name:"Local SQL DB Schema"},
        {name:"Remote SQL DB Schema"},
        {name:"Local File Storage"},
        {name:"Remote File Storage"},
        {name:"Local Email Service"}
    ];
    Scope.serviceCreateOptions = [
        {name:"Remote Web Service"},
        {name:"Remote SQL DB"},
        {name:"Remote SQL DB Schema"},
        {name:"Local File Storage"},
        {name:"Remote File Storage"}
    ];
    $('#update_button').hide();

    Scope.save = function () {
        if (Scope.service.type == "Remote SQL DB") {
            Scope.service.credentials = {dsn:Scope.service.dsn, user:Scope.service.user, pwd:Scope.service.pwd};
            Scope.service.credentials = JSON.stringify(Scope.service.credentials);

        }
        if (Scope.service.type == "Remote File Storage") {
            switch (Scope.service.storage_type) {
                case "aws s3":
                    Scope.service.credentials = {access_key:Scope.aws.access_key, secret_key:Scope.aws.secret_key, bucket_name:Scope.aws.bucket_name};
                    break;
                case "azure blob":
                    Scope.service.credentials = {account_name:Scope.azure.account_name, account_key:Scope.azure.account_key};
                    break;
            }
            Scope.service.credentials = JSON.stringify(Scope.service.credentials);
        }
        Scope.service.parameters = Scope.tableData;
        Scope.service.headers = Scope.headerData;
        var id = Scope.service.id;
        Service.update({id:id}, Scope.service, function (data) {
            updateByAttr(Scope.Services.record, 'id', id, data)
            Scope.promptForNew();
            window.top.Actions.showStatus("Updated Successfully");
        }, function (data) {
            alert(data.error[0].message);
        });

    };
    Scope.create = function () {
        Scope.service.parameters = Scope.tableData;
        Scope.service.headers = Scope.headerData;
        if (Scope.service.type == "Remote SQL DB") {
            if (Scope.service.credentials) {
                Scope.service.credentials = {dsn:Scope.service.dsn, user:Scope.service.user, pwd:Scope.service.pwd};
                Scope.service.credentials = JSON.stringify(Scope.service.credentials);
            }
        }
        if (Scope.service.type == "Remote File Storage") {
            switch (Scope.service.storage_type) {
                case "aws s3":
                    Scope.service.credentials = {access_key:Scope.aws.access_key, secret_key:Scope.aws.secret_key, bucket_name:Scope.aws.bucket_name};
                    break;
                case "azure blob":
                    Scope.service.credentials = {account_name:Scope.azure.account_name, account_key:Scope.azure.account_key};
                    break;
            }
            Scope.service.credentials = JSON.stringify(Scope.service.credentials);
        }
        Service.save(Scope.service, function (data) {
            Scope.promptForNew();
            window.top.Actions.showStatus("Created Successfully");
            Scope.Services.record.push(data);
        });
    };

    Scope.showFields = function () {

        switch (Scope.service.type) {
            case "Local SQL DB":
                $(".base_url, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format,.user, .pwd, .dsn").hide();
                // $(".user, .pwd, .dsn").show();
                break;
            case "Remote SQL DB":
                $(".base_url, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format").hide();
                $(".user, .pwd, .dsn").show();
                break;
            case "Remote SQL DB Schema":
                $(".base_url, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format").hide();
                $(".user, .pwd, .dsn").show();
                break;
            case "Remote Web Service":
                $(".user, .pwd, .dsn ,.storage_name, .storage_type, .credentials, .native_format").hide();
                $(".base_url, .parameters, .headers").show();
                break;
            case "Local File Storage":
                $(".user, .pwd,.base_url, .parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format").hide();
                $(".storage_name").show();
                break;
            case "Remote File Storage":
                $(".user, .pwd,.base_url, .parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format").hide();
                $(".storage_name, .storage_type").show();
                break;
            default:
                $(".base_url, .user, .pwd, .dsn ,.parameters, .headers, .storage_name, .storage_type, .credentials, .native_format").hide();
        }
    };
    Scope.showSwagger = function () {
        $rootScope.loadSwagger(this.service.api_name)
        Scope.action = "Explore ";
        $('#step1').hide();
    };
    Scope.delete = function () {
        var which = this.service.name;
        if (!which || which == '') {
            which = "the service?";
        } else {
            which = "the service '" + which + "'?";
        }
        if (!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.service.id;
        var api_name = this.service.api_name;

        Service.delete({ id:id }, function () {
            Scope.promptForNew();
            window.top.Actions.showStatus("Deleted Successfully");
            $("#row_" + id).fadeOut();
        });
    };

    Scope.showDetails = function () {
        $('#step1').show();
        $("#swagger, #swagger iframe").hide();
        Scope.service = angular.copy(this.service);
        if (Scope.service.type == "Remote SQL DB") {
            if (Scope.service.credentials) {
                var cString = Scope.service.credentials;
                Scope.service.dsn = cString.dsn;
                Scope.service.user = cString.user;
                Scope.service.pwd = cString.pwd;
            }
        }
        if (Scope.service.type == "Remote File Storage") {
            Scope.aws = {};
            Scope.azure = {};
            if (Scope.service.credentials) {
                var fString = Scope.service.credentials;
                switch (Scope.service.storage_type) {
                    case "aws s3":
                        Scope.aws.access_key = fString.access_key;
                        Scope.aws.secret_key = fString.secret_key;
                        Scope.aws.bucket_name = fString.bucket_name;
                        break;
                    case "azure blob":
                        Scope.azure.account_name = fString.account_name;
                        Scope.azure.account_key = fString.account_key;
                        break;
                }
            }
        }
        Scope.action = "Update";
        $('#save_button').hide();
        $('#update_button').show();
        Scope.showFields();
        Scope.tableData = Scope.service.parameters;
        Scope.headerData = Scope.service.headers;
        $("tr.info").removeClass('info');
        $('#row_' + Scope.service.id).addClass('info');
    }
    Scope.updateParams = function () {
        $("#error-container").hide();
        if (!Scope.param) {
            return false;
        }
        if (!Scope.param.name || !Scope.param.value) {
            $("#error-container").html("Both name and value are required").show();
            return false;
        }
        if (checkForDuplicate(Scope.tableData, 'name', Scope.param.name)) {
            $("#error-container").html("Parameter already exists").show();
            $('#param-name, #param-value').val('');
            return false;
        }
        var newRecord = {};
        newRecord.name = Scope.param.name;
        newRecord.value = Scope.param.value;
        Scope.tableData.push(newRecord);
        Scope.param = null;
        $('#param-name, #param-value').val('');
    }
    Scope.updateHeaders = function () {
        $("#header-error-container").hide();
        if (!Scope.header) {
            return false;
        }
        if (!Scope.header.name || !Scope.header.value) {
            $("#header-error-container").html("Both name and value are required").show();
            return false;
        }
        if (checkForDuplicate(Scope.headerData, 'name', Scope.header.name)) {
            $("#header-error-container").html("Header already exists").show();
            $('#header-name, #header-value').val('');
            return false;
        }
        var newRecord = {};
        newRecord.name = Scope.header.name;
        newRecord.value = Scope.header.value;
        Scope.headerData.push(newRecord);
        Scope.header = null;
        $('#header-name, #header-value').val('');
    }
    Scope.deleteRow = function () {
        var name = this.row.entity.name;
        Scope.tableData = removeByAttr(Scope.tableData, 'name', name);

    }
    Scope.deleteHeaderRow = function () {
        var name = this.row.entity.name;
        Scope.headerData = removeByAttr(Scope.headerData, 'name', name);

    }
    Scope.saveRow = function () {
        var index = this.row.rowIndex;
        var newRecord = this.row.entity;
        var name = this.row.entity.name;
        updateByAttr(Scope.tableData, "name", name, newRecord);
        $("#save_" + index).prop('disabled', true);
    };
    Scope.saveHeaderRow = function () {
        var index = this.row.rowIndex;
        var newRecord = this.row.entity;
        var name = this.row.entity.name;
        updateByAttr(Scope.headerData, "name", name, newRecord);
        $("#header_save_" + index).prop('disabled', true);
    };
    Scope.enableSave = function () {
        $("#save_" + this.row.rowIndex).prop('disabled', false);
    };
    Scope.enableHeaderSave = function () {
        $("#header_save_" + this.row.rowIndex).prop('disabled', false);
    };

    $("#param-value").keyup(function (event) {
        if (event.keyCode == 13) {

            $("#param-update").click();
        }
    });
    $("#header-value").keyup(function (event) {
        if (event.keyCode == 13) {

            $("#header-update").click();
        }
    });
    angular.element(document).ready(function () {
        Scope.promptForNew();
    });
    $("#swagger, #swagger iframe").hide();
};