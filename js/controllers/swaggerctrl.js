var SwaggerCtrl = function ($scope, $timeout) {
    Scope = $scope;

    Scope.loadSwagger = function(hash){
        $("#swagger iframe").attr('src', '');
        var appendURL = "";
        if(hash){
            appendURL = "/#!/" + hash;
        }
        $("#swagger").css('height', $(window).height()).css('width', '100%').show();

        $timeout(function(){
            $("#swagger iframe").css('height', $(window).height()).css('width', '100%').attr("src", 'http://' + location.host + '/public/admin/swagger/' + appendURL).show();

        },1000);

        $(window).resize(function () {
            $('#swagger').css('height', $(window).height()).css('width', '100%').css('width', '100%');
            $("#swagger iframe").css('height', $(window).height()).css('width', '100%');
        });
    }
    if(!Scope.action){
        Scope.loadSwagger();
    }
}