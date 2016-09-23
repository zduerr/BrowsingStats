//db setup
var db = new Dexie("testDB");
db.version(1).stores({
    siteHistory: '++id, domain, minutesElapsed, date'
});
db.open().catch(function (e) {
    alert ("Open failed: " + e);
});

function addSite(currentSite) {
    db.siteHistory.add({
        domain: currentSite.domain,
        minutesElapsed: currentSite.timer.getTime('s'),
        date: new Date(currentSite.dateISOStr),
        favicon: currentSite.favicon
    });
}