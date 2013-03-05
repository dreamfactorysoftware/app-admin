var SwaggerCtrl = function ($scope) {
    Scope = $scope;


    $("#swagger").css('height', $(window).height()).css('width', '100%').show();
    $("#swagger iframe").css('height', $(window).height()).css('width', '100%').attr("src", 'http://' + location.host + '/public/admin/swagger/').show();
    $(window).resize(function () {
        $('#swagger').css('height', $(window).height()).css('width', '100%').css('width', '100%');
        $("#swagger iframe").css('height', $(window).height()).css('width', '100%');
    });
}