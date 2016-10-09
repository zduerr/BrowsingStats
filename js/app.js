var app = angular.module('myApp', ['ngRoute', 'ngMaterial'])
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]).config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('light-blue');
    });

angular.module('myApp').constant('chrome', window.chrome);
angular.module('myApp').constant('Dexie', window.Dexie);