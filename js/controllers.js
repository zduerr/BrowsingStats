app.controller('navigator', function ($scope) {
    $scope.current = 'today';
    chrome.storage.local.get("toolTips", function(val){
        if (val.hasOwnProperty("toolTips")) {
            $scope.tips = val.toolTips;
        } else {
            $scope.tips = true;
        }
    });
});

app.controller('todayView', function ($scope, dexie, chrome, util) {
    $scope.util = util;
    $scope.date = new Date().toDateString().slice(0, -5);
    dexie.getToday().then(function (result) {
        $scope.list = result.list;
        $scope.timeString = util.secToStr(result.totalSeconds);
        $scope.$apply();
    });

    $scope.addToFilter = function (idx, val) {
        $scope.list.splice(idx, 1);
        dexie.addSiteToFilter(val[0]);
        dexie.getToday().then(function (result) {
            $scope.timeString = util.secToStr(result.totalSeconds);
            $scope.$apply();
        });
    };
});

app.controller('weekView', function ($scope, dexie, chrome, util) {
    $scope.util = util;
    $scope.date = new Date(new Date() - (7 * 86400000)).toDateString().slice(0, -5) + " - " +
        new Date().toDateString().slice(0, -5);
    dexie.getWeek().then(function (result) {
        $scope.list = result.list;
        $scope.totalSeconds = result.totalSeconds;
        $scope.timeString = util.secToStr($scope.totalSeconds);
        $scope.$apply();
    });
    $scope.addToFilter = function (idx, val) {
        $scope.list.splice(idx, 1);
        dexie.addSiteToFilter(val[0]);
        dexie.getToday().then(function (result) {
            $scope.timeString = util.secToStr(result.totalSeconds);
            $scope.$apply();
        });
    };
});

app.controller('monthView', function ($scope, dexie, util) {
    $scope.util = util;
    $scope.date = new Date(new Date() - (31 * 86400000)).toDateString().slice(0, -5) + " - " +
        new Date().toDateString().slice(0, -5);
    dexie.getMonth().then(function (result) {
        $scope.list = result.list;
        $scope.totalSeconds = result.totalSeconds;
        $scope.timeString = util.secToStr($scope.totalSeconds);
        $scope.$apply();
    });
    $scope.addToFilter = function (idx, val) {
        $scope.list.splice(idx, 1);
        dexie.addSiteToFilter(val[0]);
        dexie.getToday().then(function (result) {
            $scope.timeString = util.secToStr(result.totalSeconds);
            $scope.$apply();
        });
    };
});

app.controller('options', function ($scope, dexie, chrome, util) {
    chrome.storage.local.get({idleTimeOutSeconds: 300, focusTimeOutSeconds: 8}, function (val) {
        if (val.hasOwnProperty("idleTimeOutSeconds")) {
            $scope.idle = val.idleTimeOutSeconds;
        } else {
            $scope.idle = 300;
        }

        if (val.hasOwnProperty("focusTimeOutSeconds")) {
            $scope.focus = val.focusTimeOutSeconds * 100;
        } else {
            $scope.focus = 8 * 100;
        }
    });

    $scope.cleared = false;
    $scope.deleteCheckbox = false;
    $scope.filtered = dexie.getSortedFilterArray();
    $scope.tips = $scope.$parent.tips;

    $scope.focusDisplay = function () {
        return util.secToStr($scope.focus / 100)
    };
    $scope.idleDisplay = function () {
        return util.secToStr($scope.idle)
    };

    $scope.remove = function (idx) {
        dexie.removeSiteFromFilter($scope.filtered[idx]);
        $scope.filtered.splice(idx, 1);
    };

    $scope.checkboxToggle = function () {
        $scope.deleteCheckbox = !$scope.deleteCheckbox;
    };

    $scope.tipsToggle = function () {
        console.log($scope.tips);
        $scope.$parent.tips = $scope.tips;
        chrome.storage.local.set({toolTips: $scope.tips});
    };

    $scope.setOptions = function () {
        chrome.extension.getBackgroundPage().listener.focusSeconds = $scope.focus / 100;
        chrome.extension.getBackgroundPage().updateIdle($scope.idle)
    };

    //clear database
    $scope.clear = function () {
        $scope.cleared = true;
        chrome.extension.getBackgroundPage().listener.currentSite.domain = "";
        dexie.clearDB();
    };

    $scope.$watch('focus',
        function () {
            var scaled = $scope.focus / 100;
            chrome.storage.local.set({focusTimeOutSeconds: scaled});
        }
    );

    $scope.$watch('idle',
        function () {
            chrome.storage.local.set({idleTimeOutSeconds: $scope.idle});
        }
    );
});