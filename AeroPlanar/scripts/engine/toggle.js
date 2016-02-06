// Toggle
// Handles limiting changes to a variable to a maximum rate/interval

"use strict";

window.e58 = window.e58 || {};

e58.toggle = {};

(function () {
	function _Toggle (options) {
		var _instance = this;
        _instance.className = "e58.toggle";
        _instance.value = options.value || false;
        _instance.lastToggleMs = new Date().valueOf();
	}
	
	e58.toggle.getNew = function (
		value) {
		return new _Toggle({
            value: value
		});
	};

    _Toggle.prototype.toggle = function (newValue) {
        var nowUtcMs = new Date().valueOf();
        if (this.lastToggleMs <= nowUtcMs - e58.vars.control.toggleMs) {
            this.value = (newValue == null) ? !this.value : newValue;
            this.lastToggleMs = nowUtcMs;
        }
    };

    _Toggle.prototype.set = function (newValue) {
        this.toggle(newValue || false);
    };
})();
