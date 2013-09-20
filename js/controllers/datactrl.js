var DataCtrl = function ($scope, Schema, DB, $http) {
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    $("#grid-container").hide();
    Scope = $scope;
    Scope.tableData = [];
    Scope.selectedRow = [];
    Scope.booleanOptions = [
        {value: true, text: 'true'},
        {value: false, text: 'false'}
    ];
    Scope.typeOptions = [
        {value: "id", text: "id"},
        {value: "string", text: "string"},
        {value: "integer", text: "integer"},
        {value: "text", text: "text"},
        {value: "boolean", text: "boolean"},
        {value: "binary", text: "binary"},
        {value: "blob", text: "blob"},
        {value: "float", text: "float"},
        {value: "decimal", text: "decimal"},
        {value: "datetime", text: "datetime"},
        {value: "date", text: "date"},
        {value: "time", text: "time"}
    ]
    var booleanTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in booleanOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
    var inputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
    //var inputTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><input class="ngCellText colt{{$index}}" ng-change="enableSave()"/></div>';
    var schemaInputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableSchemaSave()" />';
    var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
    var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-disabled="this.row.entity.dfnew == true"ng-click="deleteRow()"><li class="icon-remove"></li></button></div>';
    var schemaButtonTemplate = '<div ><button id="add_{{row.rowIndex}}" class="btn btn-small btn-primary" disabled=true ng-show="this.row.entity.dfnew" ng-click="schemaAddField()"><li class="icon-save"></li></button>' +
        '<button id="save_{{row.rowIndex}}" ng-show="!this.row.entity.dfnew" class="btn btn-small btn-inverse" disabled=true ng-click="schemaSaveRow()"><li class="icon-save"></li></button>' +
        '<button class="btn btn-small btn-danger" ng-show="!this.row.entity.dfnew" ng-click="schemaDeleteField()"><li class="icon-remove"></li></button>' +
        '<button class="btn btn-small btn-danger" ng-show="this.row.entity.dfnew" disabled=true ng-click="schemaDeleteField(true)"><li class="icon-remove"></li></button></div>';
    var typeTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in typeOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
    Scope.columnDefs = [];
    Scope.browseOptions = {};
    Scope.browseOptions = {data: 'tableData', enableCellSelection: true, selectedItems: Scope.selectedRow, enableCellEdit: true, multiSelect: false, displaySelectionCheckbox: false, columnDefs: 'columnDefs'};
    Scope.Schemas = Schema.get(function (data) {
        Scope.schemaData = data.resource;
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
    Scope.showData = function () {
        $("#grid-container").show();
        $(".detail-view").show();
        $("#splash").hide();
        //$("#json_upload").hide();
        //$("#create-form").hide();
        Scope.currentTable = this.table.name;
        Scope.browseOptions = {};
        Scope.tableData = [];
        Scope.columnDefs = [];
        Scope.currentSchema = [];

        DB.get({name: Scope.currentTable}, function (data) {

            Scope.tableData = data.record;
            Scope.tableData.unshift({"dfnew": true});


            Scope.relatedOptions = data.meta.schema.related;
            Scope.currentSchema = data.meta.schema.field;
            Scope.currentIdentity = data.meta.schema.primary_key;
            Scope.buildColumns();

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

        $("tr.info").removeClass('info');
        $('#row_' + Scope.currentTable).addClass('info');

    };
    Scope.showRelated = function () {
        var ref_table = this.option.ref_table;
        var ref_field = this.option.ref_field;
        var field = this.option.field;
        var type = this.option.type;

        var related_url;
        if (type == "has_many") {
            related_url = "/" + ref_table + "?app_name=admin&include_schema=true&filter=" + ref_field + "=" + Scope.selectedRow[0][field]
        } else if (type == "belongs_to") {
            related_url = "/" + ref_table + "?filter=" + ref_field + "=" + Scope.selectedRow[0][field] + "&app_name=admin&include_schema=true";
        }
        Scope.currentTable = ref_table;
        Scope.browseOptions = {};
        Scope.tableData = [];
        Scope.columnDefs = [];
        Scope.currentSchema = [];
        Scope.relatedOptions = null;

        $http({method: 'GET', url: '/rest/db' + related_url}).
            success(function (data, status, headers, config) {
                Scope.tableData = data.record;
                Scope.tableData.unshift({"dfnew": true});
                Scope.currentSchema = data.meta.schema.field;
                Scope.buildColumns();
                $("tr.info").removeClass('info');
                $('#row_' + Scope.currentTable).addClass('info');
            }).
            error(function (data, status, headers, config) {
                var code = data.status;
                if (code == 401) {
                    window.top.Actions.doSignInDialog("stay");
                    return;
                }
                var error = data.data.error;
                $.pnotify({
                    title: 'Error',
                    type: 'error',
                    hide: false,
                    addclass: "stack-bottomright",
                    text: error[0].message
                });
            });


    };
    Scope.buildColumns = function () {
        var columnDefs = [];
        var saveColumn = {};
        saveColumn.field = '';
        saveColumn.cellTemplate = buttonTemplate;
        saveColumn.width = '70px';
        columnDefs.push(saveColumn);
        var column = {};
        Scope.currentSchema.forEach(function (field) {
            column.field = field.name;
            switch (field.type) {
                case "boolean":
                    column.cellTemplate = booleanTemplate;
                    //column.enableFocusedCellEdit = true;
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

        Scope.columnDefs = columnDefs;
        Scope.browseOptions.data = Scope.tableData;

    }
    Scope.showForm = function () {
        $("#grid-container").hide();
        $("#create-form").show();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
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
    Scope.schemaAddField = function () {
        var table = this.tableSchema.name;
        var row = this.row.entity;
        $http.put('/rest/schema/' + table + '/?app_name=admin', row).success(function (data) {
            Scope.tableData = removeByAttr(Scope.tableData, 'dfnew', true);
            Scope.tableData.unshift(data);
            Scope.tableData.unshift({"dfnew": true});
        });

    };
    Scope.schemaDeleteField = function (gridOnly) {
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
        if (!gridOnly) {
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

        });

    }
    Scope.enableSave = function () {
        $("#save_" + this.row.rowIndex).attr('disabled', false);

    };
    Scope.enableSchemaSave = function () {
        $("#add_" + this.row.rowIndex).attr('disabled', false);
        $("#delete_" + this.row.rowIndex).attr('disabled', false);
        $("#save_" + this.row.rowIndex).attr('disabled', false);

    };
    Scope.saveRow = function () {

        var index = this.row.rowIndex;

        var newRecord = this.row.entity;

        if (newRecord.dfnew) {
            delete newRecord.dfnew;
            DB.save({name: Scope.currentTable}, newRecord, function (data) {
                $("#save_" + index).attr('disabled', true);
                Scope.tableData = removeByAttr(Scope.tableData, 'dfnew', true);
                Scope.tableData.unshift(data);
                Scope.tableData.unshift({"dfnew": true});
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
        } else {
            DB.update({name: Scope.currentTable}, newRecord, function () {
                $("#save_" + index).attr('disabled', true);
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
        }


    }
    Scope.deleteRow = function () {
        var id = this.row.entity[Scope.currentIdentity];
        $http.delete('/rest/db/' + Scope.currentTable + '/' + id + '?app_name=admin').success(function () {
            //Scope.tableData = DB.get({name: Scope.currentTable});
            Scope.tableData = removeByAttr(Scope.tableData, Scope.currentIdentity, id);

        });//


    }
};


