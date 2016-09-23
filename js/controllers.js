var app = angular.module('myApp', ['ngRoute'])
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);


angular.module('myApp').constant('chrome', window.chrome);
angular.module('myApp').constant('Dexie', window.Dexie);


app.config(function ($routeProvider, chrome) {
    $routeProvider

        .when('/', {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'todayView'
        })

        .when('/week' , {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'weekView'
        })

        .when('/all' , {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'allView'
        })

        .when('/options' , {
            templateUrl: chrome.runtime.getURL('views/options.html'),
            controller: 'options'
        })
});

app.controller('navigator', function ($scope) {
    var d = $('.drawer');
    d.drawer();
    $scope.close = function() {
        d.drawer('close');
    }
});


app.controller('todayView', function ($scope, dexie, chrome, util) {
    $scope.util = util;
    $scope.date = new Date().toDateString().slice(0,-5);
    $scope.title = 'Today ';
    dexie.getToday().then(function(result){
        $scope.list = result.list;
        $scope.totalSeconds = result.totalSeconds;
        $scope.timeString = util.secToStr($scope.totalSeconds);
        $scope.$apply();
    });
});

app.controller('weekView', function ($scope, dexie, chrome, util) {
    $scope.util = util;
    $scope.date = new Date(new Date() - (new Date().getDay())*86400000).toDateString().slice(0,-5) + " - " +
        new Date().toDateString().slice(0,-5);
    $scope.title = 'Week ';
    dexie.getWeek().then(function(result){
        $scope.list = result.list;
        $scope.totalSeconds = result.totalSeconds;
        $scope.timeString = util.secToStr($scope.totalSeconds);
        $scope.$apply();
    });
});

app.controller('allView', function ($scope, dexie, chrome, util) {
    $scope.util = util;
    $scope.title = 'Since ';
    dexie.getAllTime().then(function(result){
        $scope.list = result.list;
        $scope.totalSeconds = result.totalSeconds;
        $scope.timeString = util.secToStr($scope.totalSeconds);
        $scope.$apply();
    });
    dexie.getStartDate().then(function(result){
        $scope.date = result;
        $scope.$apply();
    });
});

app.controller('options', function ($scope, chrome) {

});