var FileCtrl = function ($scope, $location, $timeout) {
    Scope = $scope;

    Scope.uploadPackage = function () {
        document.forms["upload-form"].submit();
        $timeout(function() {
            $location.path('/app');
        }, 1000);

    };

};