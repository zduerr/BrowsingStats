function Site(domain, favicon) {
    this.domain = domain;
    this.timer = new Stopwatch();
    this.favicon = favicon;
    this.dateISOStr = new Date().toISOString();
}

Object.defineProperty(Site.prototype, 'validDomain', {
    get: function () {
        return this.domain.indexOf(".") != -1;
    }
});

function Listener () {
    var self = this;
    this.tabUpdated = function tabUpdated(tabID, changeInfo, tab) {
        if (!chrome.runtime.lastError && tab.url != undefined && tab.status == "complete") {
            currentSite.timer.start();
            var newUrl = new URL(tab.url).hostname;
            if (newUrl.startsWith("www")) {
                var idx = newUrl.indexOf(".");
                newUrl = newUrl.slice(idx + 1);
            }
            //changed sites, add previous site to the db
            if (currentSite.domain != newUrl) {
                currentSite.timer.stop();

                if (currentSite.validDomain) {
                    addSite(currentSite);
                }

                //update currentSite
                currentSite = new Site(newUrl, tab.favIconUrl);
                currentSite.timer.start();
            } else if (tab.favIconUrl != "undefined") {
                currentSite.favicon = tab.favIconUrl;
            }
        }
    };

    this.tabActivated = function (activeInfo) {
        chrome.tabs.get(activeInfo.tabId, function (tab) {
            if (!chrome.runtime.lastError) {
                currentSite.timer.start();
                var newUrl = new URL(tab.url).hostname;
                if (newUrl.startsWith("www")) {
                    var idx = newUrl.indexOf(".");
                    newUrl = newUrl.slice(idx + 1);
                }
                //changed sites, add previous site to the db
                if (currentSite.domain != newUrl) {
                    currentSite.timer.stop();

                    if (currentSite.validDomain) {
                        addSite(currentSite);
                    }

                    //update currentSite
                    currentSite = new Site(newUrl, tab.favIconUrl);
                    currentSite.timer.start();
                }
            }
        });
    };

    this.windowFocusChange = function () {
        chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
            if (!chrome.runtime.lastError && tab.length > 0) {
                currentSite.timer.start();
                var newUrl = new URL(tab[0].url).hostname;
                if (newUrl.startsWith("www")) {
                    var idx = newUrl.indexOf(".");
                    newUrl = newUrl.slice(idx + 1);
                }
                //changed sites, add previous site to the db
                if (currentSite.domain != newUrl) {
                    currentSite.timer.stop();

                    if (currentSite.validDomain) {
                        addSite(currentSite);
                    }

                    //update currentSite
                    currentSite = new Site(newUrl, tab[0].favIconUrl);
                    currentSite.timer.start();
                }
            }
        });
    };

    this.idleStateChange = function (newState) {
        user.machine = newState;
        user.isActive ? currentSite.timer.start() : currentSite.timer.stop();
    };


    this.bankTime = function () {
        if (currentSite.validDomain) {
            if (user.isActive) {
                currentSite.timer.stop();
                currentSite.timer.start();
            }
            chrome.storage.local.set({"currentSite": currentSite});
        }
    };

    this.checkBrowserFocus = function () {
        self.bankTime();
        chrome.windows.getCurrent(function (browser) {
            if (!chrome.runtime.lastError) {
                if (browser.state == "minimized") {
                    user.focused = false;
                } else if (browser.focused) {
                    user.focused = true;
                    user.afkTally = 0;
                } else if (user.afkTally >= 2) {   //3rd time afk
                    user.focused = false;
                } else {
                    user.afkTally += 1;
                    user.focused = true;
                }
                user.isActive ? currentSite.timer.start() : currentSite.timer.stop();
            }
        })
    };

    this.getLocalStorage = function (site) {
        if (site.hasOwnProperty("currentSite") && site.currentSite.domain.indexOf(".") != -1) {
            var s = site.currentSite;
            var time = s.timer.time;
            s.timer = new Stopwatch();
            s.timer.time = time;
            addSite(s);
        }
    }
}