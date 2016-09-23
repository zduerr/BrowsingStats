//vars
var currentSite = new Site("");
var user = new BrowserState();
var listener = new Listener();

//options
var idleTimeOutSecs = 300;
chrome.idle.setDetectionInterval(idleTimeOutSecs);

//listeners
chrome.storage.local.get("currentSite", listener.getLocalStorage);
chrome.tabs.onActivated.addListener(listener.tabActivated);
chrome.tabs.onUpdated.addListener(listener.tabUpdated);
chrome.idle.onStateChanged.addListener(listener.idleStateChange);
chrome.windows.onFocusChanged.addListener(listener.windowFocusChange);
window.setInterval(listener.checkBrowserFocus, 2000);