var SwaggerCtrl = function ($rootScope, $timeout, $scope) {

    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });

    // Tabbable Nav Current Tab indicator
    $scope.currentTab = 'swagger-pane';

    // Sets current tab
    $scope.showTab = function(tab) {
        $scope.currentTab = tab;
    };



    $("#swagctrl, #swagger, #swagger iframe").css('display', 'none');
    $rootScope.loadSwagger = function (hash) {


        $("#swagger iframe").attr('src', '');

        var appendURL = "";
        if (hash) {
            appendURL = "/#!/" + hash;
        }


        $timeout(function () {
            $("#swagger iframe").css('height', $('.main').height() - 220).css('width', '100%').attr("src", CurrentServer + '/public/admin/swagger/' + appendURL).show();
            $("#swagger").css({
                'height': $('.main').height() - 200,
                'width': '95%'
            }).show();
            $("#swagctrl").show();
        }, 1000);

        $(window).resize(function () {
            $('#swagger').css({
                "height" : $('.main').height() - 200,
                "width" : '95%'
            });
            $("#swagger iframe").css('height', $(window).height() -230).css('width', '96%');
        });
    }


    $rootScope.loadSDK = function (hash) {

        $('#docs').css({
            "display" : "block"
        });


        $('#docs iframe').attr({
            "src" : ""
        });


        $timeout(function() {
            $('#docs iframe').css({
                "height" : $('.main').height() - 200,
                "width" : "100%",
                "display" : "block"
            }).attr("src" , CurrentServer + '/public/admin/docs/').show();
            $("#swagctrl").show();
        }, 1000);

        $(window).resize(function() {
            $('#docs').css({
                "height" : $('.main').height() - 200,
                "width" : "100%",
            });

            $('#docs iframe').css({
                "height" : $('.main').height() - 200,
                "width" : "100%"
            });
        });

    }

    if(!$scope.action)
    {
        $rootScope.loadSwagger();
        $rootScope.loadSDK();
    }

    else {



        $('#swagbar').hide();
        $('#swagtabs').hide();
        $('#swagctrl').removeClass('well');


    }

    $(function(){
        var height = $(window).height();


        $('.main').css({'height' :height - 40 , 'margin-bottom': 0, 'padding-bottom':0});
        var mainheight = $('.main').height();
        $('#docs').css({
            "height" : $('.main').height() - 220,
            "width" : "100%",
        });

        $('#docs iframe').css({
            "height" :$('.main').height() - 220,
            "width" : "100%"
        });
    });

    $(window).resize(function(){
        var height = $(window).height();

        $('.main').css({'height' :height - 40, 'margin-bottom': 0, 'padding-bottom':0});

        $('#docs').css({
            "height" : $('.main').height() - 220,
            "width" : "100%"
        });

        $('#docs iframe').css({
            "height" : $('.main').height() - 220,
            "width" : "100%"
        });

    });
};