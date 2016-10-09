app.config(function ($routeProvider, chrome) {
    $routeProvider

        .when('/', {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'todayView'
        })

        .when('/week', {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'weekView'
        })

        .when('/month', {
            templateUrl: chrome.runtime.getURL('views/sites.html'),
            controller: 'monthView'
        })

        .when('/options', {
            templateUrl: chrome.runtime.getURL('views/options.html'),
            controller: 'options'
        })
});