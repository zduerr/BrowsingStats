function DexieWrapper() {
    //db setup
    this.db = new Dexie("testDB");
    this.db.version(1).stores({
        siteHistory: '++id, domain, minutesElapsed, date'
    });
    this.db.open().catch(function (e) {
        alert("Open failed: " + e);
    });

    this.addSite = function (currentSite) {
        this.db.siteHistory.add({
            domain: currentSite.domain,
            minutesElapsed: currentSite.timer.getTime('s'),
            date: new Date(currentSite.dateISOStr),
            favicon: currentSite.favicon
        });
    }
}