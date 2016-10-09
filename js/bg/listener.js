function Listener() {
    this.focusSeconds = 8;
    this.pollingRateSeconds = 2;
    this.currentSite = new Site("");
    this.user = new BrowserState();
    this.dexie = new DexieWrapper();
}

Listener.prototype.checkBrowserFocus = function () {
    var self = this;
    return function () {
        if (self.currentSite.validDomain) {
            if (self.user.isActive) {
                self.currentSite.timer.stop();
                self.currentSite.timer.start();
            }
            chrome.storage.local.set({"currentSite": self.currentSite});
        }
        chrome.windows.getCurrent(self.getCurrentWindowCallback());
    }
};

Listener.prototype.getCurrentWindowCallback = function () {
    var self = this;
    return function (browser) {
        if (!chrome.runtime.lastError) {
            if (browser.state == "minimized") {
                self.user.focused = false;
            } else if (browser.focused) {
                self.user.focused = true;
                self.user.afkTally = 0;
            } else if (self.user.afkTally >= self.focusThreshold) {
                self.user.focused = false;
            } else {
                self.user.afkTally += 1;
                self.user.focused = true;
            }
            self.user.isActive ? self.currentSite.timer.start() : self.currentSite.timer.stop();
        }
    }
};

Listener.prototype.addToDB = function (listener, newUrl, favIconUrl) {
    var self = listener;
    self.currentSite.timer.stop();

    if (self.currentSite.validDomain) {
        self.dexie.addSite(self.currentSite);
    }

    self.currentSite = new Site(newUrl, favIconUrl);
    self.currentSite.timer.start();
};

Listener.prototype.tabUpdated = function () {
    var self = this;
    return function tabUpdated(tabID, changeInfo, tab) {
        if (!chrome.runtime.lastError && tab.url != undefined && tab.status == "complete") {
            self.currentSite.timer.start();
            var newUrl = new URL(tab.url).hostname;

            if (newUrl.startsWith("www")) {
                var idx = newUrl.indexOf(".");
                newUrl = newUrl.slice(idx + 1);
            }

            if (self.currentSite.domain != newUrl) {
                self.addToDB(self, newUrl, tab.favIconUrl)
            } else if (tab.favIconUrl != "undefined") {
                self.currentSite.favicon = tab.favIconUrl;
            }
        }
    }
};

Listener.prototype.getTabInfoCallback = function () {
    var self = this;
    return function (tab) {
        if (!chrome.runtime.lastError) {
            self.currentSite.timer.start();
            var newUrl = new URL(tab.url).hostname;
            if (newUrl.startsWith("www")) {
                var idx = newUrl.indexOf(".");
                newUrl = newUrl.slice(idx + 1);
            }
            if (self.currentSite.domain != newUrl) {
                self.addToDB(self, newUrl, tab.favIconUrl)
            }
        }
    }
};

Listener.prototype.tabActivated = function () {
    var self = this;
    return function (activeInfo) {
        chrome.tabs.get(activeInfo.tabId, self.getTabInfoCallback());
    }
};

Listener.prototype.windowFocusChange = function () {
    var self = this;
    return function () {
        chrome.tabs.query({currentWindow: true, active: true}, self.tabQueryCallback());
    }
};

Listener.prototype.tabQueryCallback = function () {
    var self = this;
    return function (tab) {
        if (!chrome.runtime.lastError && tab.length > 0) {
            self.currentSite.timer.start();
            var newUrl = new URL(tab[0].url).hostname;
            if (newUrl.startsWith("www")) {
                var idx = newUrl.indexOf(".");
                newUrl = newUrl.slice(idx + 1);
            }
            //changed sites, add previous site to the db
            if (self.currentSite.domain != newUrl) {
                self.addToDB(self, newUrl, tab[0].favIconUrl)
            }
        }
    }
};

Listener.prototype.idleStateChange = function () {
    var self = this;
    return function (newState) {
        self.user.machine = newState;
        self.user.isActive ? self.currentSite.timer.start() : self.currentSite.timer.stop();
    }
};

Listener.prototype.getLocalStorage = function () {
    var self = this;
    return function (site) {
        if (site.hasOwnProperty("currentSite") && site.currentSite.domain.indexOf(".") != -1) {
            var s = site.currentSite;
            var time = s.timer.time;
            s.timer = new Stopwatch();
            s.timer.time = time;
            self.dexie.addSite(s);
        }
    }
};

Listener.prototype.optionsChange = function () {
    var self = this;
    return function (val) {
        if (val.hasOwnProperty("idleTimeOutSeconds") && val.idleTimeOutSeconds.hasOwnProperty("newValue")) {
            var newVal = val.idleTimeOutSeconds.newValue;
            if (newVal >= 15 && newVal < 3600) {
                chrome.idle.setDetectionInterval(newVal);
            }
        }
        if (val.hasOwnProperty("focusTimeOutSeconds") && val.focusTimeOutSeconds.hasOwnProperty("newValue")) {
            newVal = val.focusTimeOutSeconds.newValue;
            if (newVal > 1 && newVal < 1800) {
                self.focusSeconds = newVal;
            }
        }
    }
};

Object.defineProperty(Listener.prototype, 'focusThreshold', {
    get: function () {
        return this.focusSeconds / this.pollingRateSeconds;
    }
});