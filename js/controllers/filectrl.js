var FileCtrl = function ($scope, $location, $timeout) {
    Scope = $scope;
    Scope.importPackageFile = function () {
        document.forms["import-file-form"].submit();
    };
    Scope.importPackageUrl = function () {
        document.forms["import-url-form"].submit();
    }
    $("#root-file-manager").css('height', $(window).height()).css('width', '100%').show();
    $("#root-file-manager iframe").css('height', $(window).height()).css('width', '100%').attr("src", CurrentServer + '/public/admin/filemanager/?path=/&allowroot=true').show();
    $(window).resize(function () {
        $('#root-file-manager').css('height', $(window).height()).css('width', '100%').css('width', '100%');
        $("#root-file-manager iframe").css('height', $(window).height()).css('width', '100%');
    });
};

function checkResults(iframe) {

    var str = $(iframe).contents().text();
    if(str && str.length > 0) {
        if (isErrorString(str)) {
            var response = {};
            response.responseText = str;
            window.top.Actions.showStatus(getErrorString(response), "error");
        } else {
            window.top.Actions.showStatus("The app was imported successfully!");
        }
    }
}