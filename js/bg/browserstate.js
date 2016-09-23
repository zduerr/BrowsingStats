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