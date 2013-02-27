var SchemaCtrl = function ($scope, Schema, DB) {
    $("#grid-container").hide();
    Scope = $scope;
    Scope.tableData = [];
    Scope.columnDefs = [];
    Scope.browseOptions = {data:'tableData', displaySelectionCheckbox:false, columnDefs:'columnDefs'};

    Scope.Schemas = Schema.get(function (data) {
        Scope.schemaData = data.resource;
    });
    Scope.showData = function () {
        $("#grid-container").show();
        $("#create-form").hide();
        Scope.browseOptions = {};
        Scope.tableData = [];
        DB.get({name:this.table.name}, function (data) {
            if(data.record.length > 0){
            Scope.tableData = data.record;
            }else{
            Scope.tableData = [{"error":"No Data"}];
            }
            Scope.columnDefs = Scope.buildColumns();
        });
    };
    Scope.buildColumns = function(){
      var columns = Object.keys(Scope.tableData[0]);
      var columnDefs = [];
      var column = {};
      columns.forEach(function(name){
          column.field = name;
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
    removeByAttr = function(arr, attr, value){
        var i = arr.length;
        while(i--){
            if(arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )){
                arr.splice(i,1);
            }
        }
        return arr;
    };
};

