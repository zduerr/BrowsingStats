//classes
function Site(domain) {
    this.domain = domain;
    this.timer = new Stopwatch();
    this.dateISOStr = new Date().toISOString();
}

Object.defineProperty(Site.prototype, 'validDomain', {
    get: function () {
        return this.domain.indexOf(".") != -1;
    }
});

function BrowserState() {
    this.machine = 'active';
    this.focused = true;
    this.afkTally = 0;
}

Object.defineProperty(BrowserState.prototype, 'isActive', {
    get: function () {
        return (this.focused && (this.machine == 'active'));
    }
});

//vars
var currentSite = new Site("");

chrome.storage.local.get("currentSite", getLocalStorage);
function getLocalStorage(site) {
    if (site.hasOwnProperty("currentSite") && site.currentSite.domain.indexOf(".") != -1) {
        var s = site.currentSite;
        var time = s.timer.time;
        s.timer = new Stopwatch();
        s.timer.time = time;
        addSite(s);
    }
}

var user = new BrowserState();

//options
var idleTimeOutSecs = 300;
chrome.idle.setDetectionInterval(idleTimeOutSecs);


//listeners
chrome.tabs.onActivated.addListener(tabActivated);
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.idle.onStateChanged.addListener(idleStateChange);
chrome.windows.onFocusChanged.addListener(windowFocusChange);
chrome.browserAction.onClicked.addListener(function () {
    console.log("poop");
});

//functions
function tabUpdated(_, changeInfo) {
    if (!chrome.runtime.lastError && changeInfo.url != undefined) {
        currentSite.timer.start();
        var newUrl = new URL(changeInfo.url).hostname;

        //changed sites, add previous site to the db
        if (currentSite.domain != newUrl) {
            currentSite.timer.stop();

            if (currentSite.validDomain) {
                addSite(currentSite);
            }

            //update currentSite
            currentSite = new Site(newUrl);
            currentSite.timer.start();
        }
    }
}

function tabActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (!chrome.runtime.lastError) {
            currentSite.timer.start();
            var newUrl = new URL(tab.url).hostname;

            //changed sites, add previous site to the db
            if (currentSite.domain != newUrl) {
                currentSite.timer.stop();

                if (currentSite.validDomain) {
                    addSite(currentSite);
                }

                //update currentSite
                currentSite = new Site(newUrl);
                currentSite.timer.start();
            }
        }
    });
}

function windowFocusChange() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
        if (!chrome.runtime.lastError && tab.length > 0) {
            currentSite.timer.start();
            var newUrl = new URL(tab[0].url).hostname;

            //changed sites, add previous site to the db
            if (currentSite.domain != newUrl) {
                currentSite.timer.stop();

                if (currentSite.validDomain) {
                    addSite(currentSite);
                }

                //update currentSite
                currentSite = new Site(newUrl);
                currentSite.timer.start();
            }
        }
    });
}

function idleStateChange(newState) {
    user.machine = newState;
    user.isActive ? currentSite.timer.start() : currentSite.timer.stop();
}

window.setInterval(bankTime, 5000);
function bankTime() {
    if (currentSite.validDomain) {
        if (user.isActive) {
            currentSite.timer.stop();
            currentSite.timer.start();
        }
        chrome.storage.local.set({"currentSite": currentSite});
    }
}

window.setInterval(checkBrowserFocus, 3000);
function checkBrowserFocus() {
    chrome.windows.getCurrent(function (browser) {
        if (!chrome.runtime.lastError) {
            if (browser.focused) {
                user.focused = true;
                user.afkTally = 0;
            } else if (user.afkTally >= 4) {   //5th time afk
                user.focused = false;
            } else {
                user.afkTally += 1;
                user.focused = true;
            }
            user.isActive ? currentSite.timer.start() : currentSite.timer.stop();
        }
    })
}