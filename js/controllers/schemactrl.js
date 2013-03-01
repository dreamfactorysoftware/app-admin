var SchemaCtrl = function ($scope, Schema, DB) {
    $("#grid-container").hide();
    Scope = $scope;
    Scope.tableData = [];
    var customRowTemplate = '<div ng-repeat="col in visibleColumns()" class="myCustomClass ngCell {{columnClass($index)}} col{{$index}} {{col.cellClass}}" ng-cell></div>';
    var inputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
    var customHeaderTemplate = '<div class="ngHeaderCell">Save</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var buttonTemplate = '<div><a id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></a></div>';
    Scope.columnDefs = [];
    Scope.browseOptions = {data:'tableData', headerRowTemplate:customHeaderTemplate, canSelectRows:false, displaySelectionCheckbox:false, columnDefs:'columnDefs'};

    Scope.Schemas = Schema.get(function (data) {
        Scope.schemaData = data.resource;
    });
    Scope.showData = function () {
        $("#grid-container").show();
        $(".detail-view").show();
        $("#json_upload").hide();
        $("#create-form").hide();
        Scope.currentTable = this.table.name;
        Scope.browseOptions = {};
        Scope.tableData = [];
        DB.get({name:this.table.name}, function (data) {
            if (data.record.length > 0) {
                Scope.tableData = data.record;
            } else {
                Scope.tableData = [
                    {"error":"No Data"}
                ];
            }
            Scope.columnDefs = Scope.buildColumns();
        });
    };
    Scope.buildColumns = function () {
        var columns = Object.keys(Scope.tableData[0]);
        var columnDefs = [];
        var saveColumn = {};
        saveColumn.field = '';
        saveColumn.cellTemplate =buttonTemplate;
        columnDefs.push(saveColumn);
        var column = {};
        columns.forEach(function (name) {
            column.field = name;
            if (name != 'id') {
                //column.cellTemplate = inputTemplate;
                column.editableCellTemplate = inputTemplate;
                column.enableFocusedCellEdit = true;
                column.minWidth = 100;
            }
            columnDefs.push(column);
            column = {};
        });

        return columnDefs;
    };
    Scope.showForm = function () {
        $("#grid-container").hide();
        $("#create-form").show();
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
        //Scope.newTable.table.name = Scope.schema.table.name;
        //Scope.newTable.table.field.push(Scope.schema.table.field);
        //Scope.schema.table.field = {};
        // console.log(this);
        Scope.newTable.table.field = removeByAttr(Scope.newTable.table.field, 'name', this.field.name);

    };
    Scope.create = function () {
        Schema.save(Scope.newTable, function (data) {
            //Scope.schemaData.push(data.table);
            Scope.schemaData.push(Scope.newTable.table);
        });
    };
    Scope.delete = function () {
        var name = this.table.name;
        Schema.delete({ name:name }, function () {
            $("#row_" + name).fadeOut();
        });
    };
    removeByAttr = function (arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )) {
                arr.splice(i, 1);
            }
        }
        return arr;
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
    Scope.showJSON = function(){
        $(".detail-view").hide();
        $("#json_upload").show();
    }
    Scope.postJSON = function(){
        var json = $('#source').val();
        Schema.save(json, function(data){
            if(!data.table){
                Scope.schemaData.push(data);
            }else{
                data.table.forEach(function(table){
                    Scope.schemaData.push(table);
                })
            }

        });

    }
    Scope.promptForNew = function () {
        Scope.action = "Create";
        Scope.schema = {};
        $(".detail-view").show();
        $("#json_upload").hide();
    };
    Scope.enableSave = function(){
        $("#save_" + this.row.rowIndex).attr('disabled', false);
        //console.log(this);
    };
    Scope.saveRow = function(){
        var newRecord = {table:this.row.entity};
        DB.update({name:Scope.currentTable}, newRecord);

    }
};


