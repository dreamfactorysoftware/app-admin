var FileCtrl = function ($scope, $location, $timeout) {
    Scope = $scope;
    Scope.uploadPackageFile = function () {
        document.forms["upload-file-form"].submit();
        $timeout(function () {
            $location.path('/app');
        }, 1000);

    };
    function uploadPackageUrl() {
        document.forms["upload-url-form"].submit();
        $timeout(function () {
            $location.path('/app');
        }, 1000);
    }

    $("#root-file-manager").css('height', $(window).height()).css('width', '100%').show();
    $("#root-file-manager iframe").css('height', $(window).height()).css('width', '100%').attr("src", 'http://' + location.host + '/public/admin/filemanager/?path=/app/&allowroot=true').show();
    $(window).resize(function () {
        $('#root-file-manager').css('height', $(window).height()).css('width', '100%').css('width', '100%');
        $("#root-file-manager iframe").css('height', $(window).height()).css('width', '100%');
    });
};