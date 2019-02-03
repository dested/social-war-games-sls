"use strict";
exports.__esModule = true;
var Timer = /** @class */ (function () {
    function Timer() {
        this.times = [];
        this.startTime = +new Date();
    }
    Timer.prototype.add = function (name) {
        this.times.push({
            key: name,
            time: +new Date() - this.startTime
        });
    };
    Timer.prototype.print = function () {
        return this.times.map(function (a) { return a.key + ':' + a.time; }).join(' | ');
    };
    return Timer;
}());
exports.Timer = Timer;
