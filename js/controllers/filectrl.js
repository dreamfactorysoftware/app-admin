var FileCtrl = function ($scope, $location, $timeout) {
    Scope = $scope;
    Scope.uploadPackageFile = function () {
        document.forms["upload-file-form"].submit();
        /*$timeout(function () {
            $location.path('/app');
        }, 1000);*/

    };
    Scope.uploadPackageUrl = function () {
        document.forms["upload-url-form"].submit();
        /*$timeout(function () {
            $location.path('/app');
        }, 1000);*/
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
            alertErr(response);
        } else {
            alert("The app was imported successfully!");
        }
    }
}