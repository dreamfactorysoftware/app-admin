var SwaggerCtrl = function ($rootScope, $timeout, $scope) {

    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    $scope.currentTab = 'swagger-pane';
    $scope.showTab = function (tab) {
        $scope.currentTab = tab;
    };

    var swaggerIframe = $("#swaggerFrame");
    var swaggerDiv = $('#swagger');
    var docsIframe = $('#docsFrame');
    var apiContainer = $('#swagctrl');
    var docsDiv = $('#docs');
    var mainDiv = $('.main');

    swaggerIframe.hide();
    swaggerDiv.hide();
    apiContainer.hide();

    $rootScope.loadSwagger = function (hash) {


        swaggerIframe.attr('src', '');

        var appendURL = "";
        if (hash) {
            appendURL = "/#!/" + hash;
        }


        $timeout(function () {
            swaggerIframe.css('height', mainDiv.height() - 230).css('width', '100%').attr("src", CurrentServer + '/public/admin/swagger/' + appendURL).show();
            swaggerDiv.css({
                'height': $('.main').height() - 220,
                'width': '95%'
            }).show();
            apiContainer.show();
        }, 1000);
    };


    $rootScope.loadSDK = function (hash) {

        docsDiv.css({
            "display": "block"
        });


        docsIframe.attr({
            "src": ""
        });


        $timeout(function () {
            docsIframe.css({
                "height": mainDiv.height() - 200,
                "width": "95%",
                "display": "block"
            }).attr("src", CurrentServer + '/public/admin/docs/').show();
            apiContainer.show();
        }, 1000);
    };

    if (!$scope.action) {
        $rootScope.loadSwagger();
        $rootScope.loadSDK();
    }

    else {


        $('#swagbar').hide();
        $('#swagtabs').hide();
        apiContainer.removeClass('well');


    }

    $(function () {
        var height = $(window).height();


        mainDiv.css({'height': height - 40, 'margin-bottom': 0, 'padding-bottom': 0});
        var mainheight = mainDiv.height();
        docsDiv.css({
            "height": mainDiv.height() - 220,
            "width": "95%"
        });

        docsIframe.css({
            "height": mainDiv.height() - 220,
            "width": "100%"
        });
    });

    $(window).resize(function () {
        var height = $(window).height();

        mainDiv.css({'height': height - 40, 'margin-bottom': 0, 'padding-bottom': 0});

        docsDiv.css({
            "height": mainDiv.height() - 220,
            "width": "95%"
        });
        swaggerDiv.css({
            "height": mainDiv.height() - 220,
            "width": "95%"
        });

        docsIframe.css({
            "height": mainDiv.height() - 220,
            "width": "100%"
        });
        swaggerIframe.css({
            "height": mainDiv.height() - 220,
            "width": "100%"
        });

    });
};