var listener = new Listener();

chrome.storage.local.get(["idleTimeOutSeconds", "focusTimeOutSeconds", "toolTips"], function (val) {
    var pollingRate = 2000;
    listener.pollingRateSeconds = pollingRate / 1000;
    var idle = 600;

    if (val.hasOwnProperty("idleTimeOutSeconds")) {
        idle = val.idleTimeOutSeconds;
    } else {
        chrome.storage.local.set({idleTimeOutSeconds: 600});
    }

    if (val.hasOwnProperty("focusTimeOutSeconds")) {
        listener.focusSeconds = val.focusTimeOutSeconds;
    } else {
        chrome.storage.local.set({focusTimeOutSeconds: 8});
    }

    if (!val.hasOwnProperty('toolTips')) {
        chrome.storage.local.set({toolTips: true});
    }
    
    chrome.idle.setDetectionInterval(idle);
    chrome.storage.local.get("currentSite", listener.getLocalStorage());
    chrome.tabs.onActivated.addListener(listener.tabActivated());
    chrome.tabs.onUpdated.addListener(listener.tabUpdated());
    chrome.idle.onStateChanged.addListener(listener.idleStateChange());
    chrome.windows.onFocusChanged.addListener(listener.windowFocusChange());
    chrome.storage.onChanged.addListener(listener.optionsChange());
    window.setInterval(listener.checkBrowserFocus(), pollingRate);
});

function updateIdle(seconds) {
    chrome.idle.setDetectionInterval(seconds);
}

