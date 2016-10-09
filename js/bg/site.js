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