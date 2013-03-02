var SchemaCtrl = function ($scope, Schema, DB) {
    $("#grid-container").hide();
    Scope = $scope;
    Scope.tableData = [];
    Scope.booleanOptions = [{value:true, text:'true'},{value:false, text:'false'}];
    var booleanTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in booleanOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
    var inputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
    var customHeaderTemplate = '<div class="ngHeaderCell">Save</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button></div>';
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
        Scope.currentSchema = [];
        Schema.get({name:this.table.name}, function (data) {
            data.table.field.forEach(function(field){
                Scope.currentSchema.push(field)
            });
            DB.get({name:Scope.currentTable}, function (data) {
                if (data.record.length > 0) {
                    Scope.tableData = data.record;
                } else {
                    Scope.tableData = [{"error":"No Data"} ];
                }
                Scope.columnDefs = Scope.buildColumns();
            });
        });

    };
    Scope.buildColumns = function () {
        var columnDefs = [];
        var saveColumn = {};
        saveColumn.field = '';
        saveColumn.cellTemplate =buttonTemplate;
        saveColumn.width = '40px';
        columnDefs.push(saveColumn);
        var column = {};
        Scope.currentSchema.forEach(function (field) {
            column.field = field.name;
            switch(field.type)
            {
                case "boolean":
                    column.editableCellTemplate = booleanTemplate;
                    column.enableFocusedCellEdit = true;
                    column.minWidth = '100px';
                    column.width = '50px';
                    break;
                case "id":
                    column.width = '50px';
                    break;
                case "string":
                    column.editableCellTemplate = inputTemplate;
                    column.enableFocusedCellEdit = true;
                    column.width = '100px';
                    break;
                default:
                    column.editableCellTemplate = inputTemplate;
                    column.enableFocusedCellEdit = true;
                    column.width = '100px';
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

        var index = this.row.rowIndex;
        var newRecord =this.row.entity;
        DB.update({name:Scope.currentTable},newRecord , function(){
            $("#save_" + index).attr('disabled', true);
        });

    }
};


