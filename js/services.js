app.service('util', function () {
    var self = this;
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
    
    this.toCsv = function (array) {
        var s = "SITE, TIME, TIME IN SECONDS, PERCENT OF TOTAL\n";
        for (var i = 0; i < array.length; i++) {
            s  += [array[i][0], array[i][1], array[i][4], array[i][3], "\n"].join(', ');
        }
        return s;
    };

    this.downloadCSV = function (list, fileName, e) {
        var csvList = self.toCsv(list);
        var blob = new Blob([csvList]);
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
});


app.factory('dexie', function (util) {
    var FILTER_STORE = "filterList";

    //factory init, opens db connection and sets indexes if not set already
    var db = new Dexie("testDB");
    db.version(1).stores({
        siteHistory: '++id, domain, minutesElapsed, date',
    });
    db.open().catch(function (e) {
        alert("Open failed: " + e);
    });

    //initialize the filter
    var siteFilterList = new Set();
    chrome.storage.local.get(FILTER_STORE, function (val) {
        if (!chrome.runtime.lastError && val.hasOwnProperty(FILTER_STORE)) {
            for (var i = 0; i < val.filterList.length; i++) {
                siteFilterList.add(val.filterList[i]);
            }
        }
    });

    //delete data older than 31 days
    deleteExpiredSites();


    function deleteExpiredSites() {
        var midnightToday = new Date(new Date().setHours(0, 0, 0, 0));
        var startTime = new Date(midnightToday.getTime() - (31 * 24 * 60 * 60 * 1000));
        db.siteHistory
            .where('date')
            .belowOrEqual(startTime)
            .primaryKeys(function (result) {
                db.siteHistory.bulkDelete(result);
            });
    }

    function populateTimeStats(aryData) {
        var list = aryData.list;
        for (var i = 0; i < list.length; i++) {
            list[i].push(((list[i][1] * 100) / aryData.totalSeconds).toFixed(2));
            list[i].push(list[i][1]);
            list[i][1] = util.secToStr(list[i][1]);
        }
    }

    function toDictionary(ary, aryData) {
        var dict = {};
        var currentSite = chrome.extension.getBackgroundPage().listener.currentSite;
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
                if (dict[ary[i].domain][1] == undefined && ary[i].favicon != undefined) {
                    dict[ary[i].domain][1] = ary[i].favicon;
                }
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

    function processResults(results) {
        var processedResults = {};

        //remove domains that are on the user defined filter list
        var filtered = results.filter(function (element) {
            return !(siteFilterList.has(element.domain));
        });

        toDictionary(filtered, processedResults);
        sortDict(processedResults);
        populateTimeStats(processedResults);
        return processedResults;
    }

    //build public API functions
    var dexie = {};
    dexie.getToday = function () {
        var startTime = new Date(new Date().setHours(0, 0, 0, 0));
        return db.siteHistory
            .where('date')
            .aboveOrEqual(startTime)
            .toArray(function (result) {
                return processResults(result);
            });
    };

    dexie.getWeek = function () {
        var midnightToday = new Date(new Date().setHours(0, 0, 0, 0));
        var startTime = new Date(midnightToday.getTime() - (7 * 24 * 60 * 60 * 1000));
        return db.siteHistory
            .where('date')
            .aboveOrEqual(startTime)
            .toArray(function (result) {
                return processResults(result);
            });
    };

    dexie.getMonth = function () {
        var midnightToday = new Date(new Date().setHours(0, 0, 0, 0));
        var startTime = new Date(midnightToday.getTime() - (31 * 24 * 60 * 60 * 1000));
        return db.siteHistory
            .where('date')
            .aboveOrEqual(startTime)
            .toArray(function (result) {
                return processResults(result);
            });
    };

    dexie.getStartDate = function () {
        return db.siteHistory
            .toCollection('date')
            .first(function (result) {
                return result.date.toDateString().slice(0, -5);
            });
    };

    dexie.addSiteToFilter = function (domain) {
        var duplicate = siteFilterList.has(domain);
        siteFilterList.add(domain);

        //update storage
        chrome.storage.local.get(FILTER_STORE, function (val) {
            if (!chrome.runtime.lastError) {
                if (val.hasOwnProperty(FILTER_STORE) && val.filterList.indexOf(domain) == -1) {
                    val.filterList.push(domain);
                    chrome.storage.local.set(val);
                } else if (!val.hasOwnProperty(FILTER_STORE)) {
                    chrome.storage.local.set({filterList: [domain]});
                }
            }
        });

        return !duplicate;
    };

    dexie.removeSiteFromFilter = function (domain) {
        var exists = siteFilterList.has(domain);
        if (exists) {
            siteFilterList.delete(domain);
            chrome.storage.local.get(FILTER_STORE, function (val) {
                if (!chrome.runtime.lastError && val.hasOwnProperty(FILTER_STORE)) {
                    var idx = val.filterList.indexOf(domain);
                    if (idx != -1) {
                        val.filterList.splice(idx, 1);
                        chrome.storage.local.set(val);
                    }
                }
            });
        }
        return exists;
    };

    dexie.getSortedFilterArray = function () {
        return Array.from(siteFilterList).sort();
    };

    dexie.clearDB = function () {
        db.siteHistory.clear();
    };

    return dexie;
});