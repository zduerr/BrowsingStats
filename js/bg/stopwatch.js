function Stopwatch() {
    this.running = false;
    this.time = 0;
    this.lap = 0;
}

Stopwatch.prototype.start = function () {
    if (!this.running) {
        this.running = true;
        this.lap = performance.now();
    }
};

Stopwatch.prototype.stop = function () {
    if (this.running) {
        var stopTime = performance.now();
        this.running = false;
        this.time += stopTime - this.lap;
        this.lap = 0;
    }

    return Math.round(this.time / 1000);
};

Stopwatch.prototype.reset = function () {
    this.running = false;
    this.time = 0;
    this.lap = 0;
};

Stopwatch.prototype.getTime = function (units) {
    var divisor = 1000;
    if (units !== undefined) {
        var u = String(units).toLowerCase();
        if (u == 'h') {
            divisor *= 60 * 60;
        }
        else if (u == 'm') {
            divisor *= 60;
        }
    }
    if (!this.running) {
        return Math.round(this.time / divisor)
    }
    else {
        var curTime = performance.now();
        return Math.round((this.time + curTime - this.lap) / divisor)
    }
};