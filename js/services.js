app.service('util', function () {
    this.secToStr = function (sec) {
        var days = Math.floor(sec / 86400);
        var hours = Math.floor(sec / 3600) % 24;
        var minutes = Math.floor(sec / 60) % 60;
        var seconds = sec % 60;
        var timeString = "";
        if (days != 0) {
            timeString += days.toString() + "d ";
        } else {
            days = "";
        }
        if (hours != 0) {
            hours < 10 ? timeString += "0" + hours.toString() + "h " : timeString += hours.toString() + "h ";
        } else if (days != "") {
            timeString += "00h ";
        }
        minutes < 10 ? timeString += "0" + minutes.toString() + "m " : timeString += minutes.toString() + "m ";
        seconds < 10 ? timeString += "0" + seconds.toString() + "s" : timeString += seconds.toString() + "s";
        return timeString;
    };

    this.linkClick = function (e) {
        e.preventDefault();
        var link = e.target.textContent;
        chrome.tabs.create({
            url: "http://" + link
        });
    };
});


app.factory('dexie', function (util) {
    //factory init, opens db connection and sets indexes if not set already
    var db = new Dexie("testDB");
    db.version(1).stores({
        siteHistory: '++id, domain, minutesElapsed, date'
    });
    db.open().catch(function (e) {
        alert("Open failed: " + e);
    });

    function populateTimeStats(aryData) {
        var list = aryData.list;
        for (var i = 0; i < list.length; i++) {
            list[i].push(((list[i][1] * 100) / aryData.totalSeconds).toFixed(2));
            list[i][1] = util.secToStr(list[i][1]);
        }
    }

    function toDictionary(ary, aryData) {
        var dict = {};
        var currentSite = chrome.extension.getBackgroundPage().currentSite;
        var sumArySeconds = 0;
        if (currentSite.validDomain) {
            dict[currentSite.domain] = [currentSite.timer.getTime("s")];
            dict[currentSite.domain].push(currentSite.favicon);
            sumArySeconds += currentSite.timer.getTime("s");
        }

        for (var i = 0; i < ary.length; i++) {
            if (dict.hasOwnProperty(ary[i].domain)) {
                dict[ary[i].domain][0] += ary[i].minutesElapsed;
                sumArySeconds += ary[i].minutesElapsed;
            }
            else {
                dict[ary[i].domain] = [ary[i].minutesElapsed];
                dict[ary[i].domain].push(ary[i].favicon);
                sumArySeconds += ary[i].minutesElapsed;
            }
        }

        aryData.totalSeconds = sumArySeconds;
        aryData.list = dict;
    }

    function sortDict(aryData) {
        var dict = aryData.list;
        var ary = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                ary.push([key, dict[key][0], dict[key][1]]);
            }
        }
        aryData.list = ary.sort(function (a, b) {
            return b[1] - a[1];
        });
    }

    function processResults (results) {
        var processedResults = {};
        toDictionary(results, processedResults);
        sortDict(processedResults);
        populateTimeStats(processedResults);
        return processedResults;
    }

    //build public API functions
    var dexie = {};
    dexie.getToday = function () {
        var startTime = new Date(new Date().setHours(0,0,0,0));
        return db.siteHistory
                 .where('date')
                 .aboveOrEqual(startTime)
                 .toArray(function (result) {
                     return processResults(result);
                 });
    };

    dexie.getWeek = function () {
        var startTime = new Date(new Date().setHours(0,0,0,0) - ((new Date().getDay())*86400000));
        return db.siteHistory
                 .where('date')
                 .aboveOrEqual(startTime)
                 .toArray(function (result){
                     return processResults(result);
                 });
    };

    dexie.getAllTime = function () {
        return db.siteHistory
                 .toArray(function (result) {
                     return processResults(result);
                 });
    };

    dexie.getStartDate = function () {
        return db.siteHistory
                 .toCollection('date')
                 .first(function (result) {
                     return result.date.toDateString().slice(0,-5);
                 });
    };

    return dexie;
});