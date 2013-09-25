var SwaggerCtrl = function ($rootScope, $timeout, $scope) {



    // Tabbable Nav Current Tab indicator
    $scope.currentTab = 'swagger-pane';

    // Sets current tab
    $scope.showTab = function(tab) {
        $scope.currentTab = tab;
    };



    $("#swagger, #swagger iframe").css('display', 'none');
    $rootScope.loadSwagger = function (hash) {


        $("#swagger iframe").attr('src', '');

        var appendURL = "";
        if (hash) {
            appendURL = "/#!/" + hash;
        }


        $timeout(function () {
            $("#swagger iframe").css('height', $(window).height() -40).css('width', '100%').attr("src", CurrentServer + '/public/admin/swagger/' + appendURL).show();
            $("#swagger").css({
                'height': $(window).height(),
                'width': '95%'
            }).show();
        }, 1000);

        $(window).resize(function () {
            $('#swagger').css({
                "height" : $(window).height(),
                "width" : '95%'
            });
            $("#swagger iframe").css('height', $(window).height() -40).css('width', '96%');
        });
    }


    $rootScope.loadSDK = function (hash) {

        $('#docs').css({
            "display" : "block"
        });


        $('#docs iframe').attr({
            "src" : ""
        });

        var appendURL = "";
        if (hash) {
            appendURL = "/#!/" + hash;
        }

        $timeout(function() {
            $('#docs iframe').css({
                "height" : $(window).height() - 40,
                "width" : "100%",
                "display" : "block"
            }).attr({
                    "src" : CurrentServer + '/public/admin/docs' + appendURL
                }).show();
        }, 1000);

        $(window).resize(function() {
            $('#docs').css({
                "height" : $(window).height(),
                "width" : "100%",
            });

            $('#docs iframe').css({
                "height" : $(window).height() -40,
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


};