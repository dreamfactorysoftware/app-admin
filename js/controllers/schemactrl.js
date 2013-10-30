var SchemaCtrl = function ($scope, Schema, DB, $http) {
    $("#grid-container").hide();
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    Scope = $scope;
    Scope.tableData = [];
    Scope.booleanOptions = [
        {value: true, text: 'true'},
        {value: false, text: 'false'}
    ];
    Scope.typeOptions = [
        {value:"id", text: "id"},
        {value:"string", text: "string"},
        {value:"integer", text: "integer"},
        {value:"text", text: "text"},
        {value:"boolean", text: "boolean"},
        {value:"binary", text: "binary"},
        {value:"float", text: "float"},
        {value:"decimal", text: "decimal"},
        {value:"datetime", text: "datetime"},
        {value:"date", text: "date"},
        {value:"time", text: "time"},
        {value:"reference", text: "reference"}
    ]
    var booleanTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in booleanOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
    var inputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
    var schemaInputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSchemaSave()" />';
    var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-disabled="!this.row.entity.id"ng-click="deleteRow()"><li class="icon-remove"></li></button></div>';
    var schemaButtonTemplate = '<div ><button id="add_{{row.rowIndex}}" class="btn btn-small btn-primary" disabled=true ng-show="this.row.entity.new" ng-click="schemaAddField()"><li class="icon-save"></li></button>' +
        '<button id="save_{{row.rowIndex}}" ng-show="!this.row.entity.new" class="btn btn-small btn-inverse" disabled=true ng-click="schemaUpdateField()"><li class="icon-save"></li></button>' +
        '<button class="btn btn-small btn-danger" ng-show="!this.row.entity.new" ng-click="schemaDeleteField()"><li class="icon-remove"></li></button>' +
        '<button class="btn btn-small btn-danger" ng-show="this.row.entity.new" disabled=true ng-click="schemaDeleteField(true)"><li class="icon-remove"></li></button></div>';
    var typeTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in typeOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
    Scope.columnDefs = [];
    Scope.browseOptions = {};
    Scope.browseOptions = {data: 'tableData', enableCellEdit:true, canSelectRows: false, displaySelectionCheckbox: false, columnDefs: 'columnDefs'};
    Scope.Schemas = Schema.get(function (data) {
        Scope.schemaData = data.resource;
    });

    Scope.showForm = function () {
        $("#grid-container").hide();
        $("#json_upload").hide();
        $(".detail-view").show();
        $("#create-form").show();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
    }
    Scope.showSchema = function () {
        $("#create-form").hide();
        $("#json_upload").hide();
        $(".detail-view").show();
        var columnDefs = [];
        Scope.browseOptions = {};
        Scope.tableData = [];
        Scope.columnDefs = [];
        Scope.currentSchema = [];
        Schema.get({ name: this.table.name }, function(data){
            Scope.tableSchema = data;
            var saveColumn = {};
            saveColumn.field = '';
            saveColumn.cellTemplate = schemaButtonTemplate;
            saveColumn.width = '70px';
            columnDefs.push(saveColumn);
            var column = {};
            //console.log(Scope);
            var keys  = Object.keys(Scope.tableSchema.field[0]);
            keys.forEach(function (key) {
                    if(key == 'type'){
                        column.cellTemplate = typeTemplate;

                    }else{
                        column.editableCellTemplate = schemaInputTemplate;
                        column.enableFocusedCellEdit = true;
                    }



                    //column.enableFocusedCellEdit = true;
                    column.width = '100px';
                    column.field = key;
                    columnDefs.push(column);
                    column = {};
                }

            );
            Scope.columnDefs = columnDefs;
            //console.log(Scope.columnDefs);
            Scope.browseOptions.enableCellEdit = true;
            Scope.tableData = Scope.tableSchema.field;
            Scope.tableData.unshift({"new":true});

        }, function(response){
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

        //console.log(this);
        Scope.action = "Alter";
        $("#grid-container").show();



        $("tr.info").removeClass('info');
        $('#row_' + this.table.name).addClass('info');
        //console.log(this);
    }
    Scope.newTable = {};
    Scope.newTable.table = {};
    Scope.newTable.table.field = [];
    Scope.addField = function () {

        Scope.newTable.table.name = Scope.schema.table.name;
        Scope.newTable.table.field.push(Scope.schema.table.field);
        Scope.schema.table.field = {};
    };
    Scope.removeField = function () {
        Scope.newTable.table.field = removeByAttr(Scope.newTable.table.field, 'name', this.field.name);

    };
    Scope.schemaAddField = function(){
        var table = this.tableSchema.name;
        var row = this.row.entity;
        $http.put('/rest/schema/' + table + '/?app_name=admin', row).success(function(data){
            Scope.tableData = removeByAttr(Scope.tableData, 'new', true);
            Scope.tableData.unshift(data);
            Scope.tableData.unshift({"new":true});
        });

    };
    Scope.schemaUpdateField = function(){
        var table = this.tableSchema.name;
        var row = this.row.entity;
        var index = this.row.rowIndex;
        $http.put('/rest/schema/' + table + '/?app_name=admin', row).success(function(data){
            $("#save_" + index).attr('disabled', true);
        });

    };
    Scope.schemaDeleteField = function(gridOnly){
        var table = this.tableSchema.name;
        var name = this.row.entity.name;
        which = name;
        if (!which || which == '') {
            which = "the field?";
        } else {
            which = "the field '" + which + "'?";
        }
        if (!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        if(!gridOnly){
            $http.delete('/rest/schema/' + table + '/' + name + '?app_name=admin');
        }
        Scope.tableData = removeByAttr(Scope.tableData, 'name', name);
        //Scope.tableData.shift();
        //Scope.tableData.unshift({"new":true});
    };

    Scope.create = function () {
        Schema.save(Scope.newTable, function (data) {
            $.pnotify({
                title: Scope.newTable.table.name,
                type: 'success',
                text: 'Created Successfully'
            });
            Scope.showForm();
            //window.top.Actions.showStatus("Created Successfully");
            Scope.schemaData.push(Scope.newTable.table);
        }, function(response){
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
    Scope.delete = function () {
        var name = this.table.name;
        which = name;
        if (!which || which == '') {
            which = "the table?";
        } else {
            which = "the table '" + which + "'?";
        }
        if (!confirm("Are you sure you want to drop " + which)) {
            return;
        }
        Schema.delete({ name: name }, function () {
            $.pnotify({
                title: name,
                type: 'success',
                text: 'Dropped Successfully'
            });
            Scope.showForm();
            //window.top.Actions.showStatus("Deleted Successfully");
            $("#row_" + name).fadeOut();
        }, function(response){
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

    Scope.validateJSON = function () {
        try {
            var result = jsonlint.parse(document.getElementById("source").value);
            if (result) {
                document.getElementById("result").innerHTML = "JSON is valid!";
                document.getElementById("result").className = "pass";
                if (document.getElementById("reformat").checked) {
                    document.getElementById("source").value = JSON.stringify(result, null, "  ");
                }
            }
        } catch (e) {
            document.getElementById("result").innerHTML = e;
            document.getElementById("result").className = "fail";
        }
    };
    Scope.showJSON = function () {
        $(".detail-view").hide();
        $("#json_upload").show();
    }
    Scope.postJSON = function () {
        var json = $('#source').val();
        Schema.save(json, function (data) {
            if (!data.table) {
                Scope.schemaData.push(data);
            } else {
                data.table.forEach(function (table) {
                    Scope.schemaData.push(table);
                })
            }

        }, function(response){
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

    }
    Scope.enableSave = function () {
        $("#save_" + this.row.rowIndex).attr('disabled', false);
        //console.log(this);
    };
    Scope.enableSchemaSave = function () {
        $("#add_" + this.row.rowIndex).attr('disabled', false);
        $("#delete_" + this.row.rowIndex).attr('disabled', false);
        $("#save_" + this.row.rowIndex).attr('disabled', false);
        //console.log(this);
    };
    Scope.saveRow = function () {

        var index = this.row.rowIndex;
        var newRecord = this.row.entity;
        if (!newRecord.id) {
            DB.save({name: Scope.currentTable}, newRecord, function (data) {
                $("#save_" + index).attr('disabled', true);
                Scope.tableData.push(data);
            }, function () {
                window.top.Actions.showStatus("An Error has occurred", "error");
            });
        } else {
            DB.update({name: Scope.currentTable}, newRecord, function () {
                $("#save_" + index).attr('disabled', true);
            });
        }


    }
    Scope.schemaSaveRow = function () {


        var table = this.tableSchema.name;
        var row = this.row.entity;
        $http.put('/rest/schema/' + table + '/?app_name=admin', row).success(function(data){
            Scope.tableData = removeByAttr(Scope.tableData, 'new', true);
            Scope.tableData.unshift(data);
            Scope.tableData.unshift({"new":true});
        });


    }
    Scope.deleteRow = function () {
        var id = this.row.entity.id;
        DB.delete({name: Scope.currentTable}, {id: id});
        Scope.tableData = removeByAttr(Scope.tableData, 'id', id);

    }
};


