// Buffer
// handles changes to a variable, with a minimum change threshold and change constant/coefficient.

"use strict";

window.e58 = window.e58 || {};
e58.buffer = {};

(function () {
	function _Buffer (options) {
		var _instance = this;
        _instance.className = "e58.buffer";

        _instance.defaultValueAccessor = "value";
		_instance.limit = options.limit;
        _instance.constant = options.constant;

        _instance.values =
            typeof options.initialValues == "number" ?
            { value: options.initialValues }:
            options.initialValues || {};
	}
	
	e58.buffer.getNew = function (
		limit,
        constant,
        initialValues) {
		return new _Buffer({
            limit: limit,
            constant: constant,
            initialValues: initialValues
		});
	};

    _Buffer.prototype.applyValue = function(value, valueAccessorOrAction, action) {
        var valueAccessor = this.defaultValueAccessor;
        if (typeof valueAccessorOrAction == "function") {
            action = valueAccessorOrAction;
        }
        else {
            valueAccessor = valueAccessorOrAction;
        }

        this.values[valueAccessor] = this.values[valueAccessor] || 0;

        var delta = value - this.values[valueAccessor];

        if (Math.abs(delta) > Math.abs(this.limit)) {
            var appliedDelta = this.constant * delta - s58.getSign(delta) * this.limit;
            this.values[valueAccessor] += appliedDelta;
            action && action(appliedDelta);
        }
    };

    _Buffer.prototype.apply = function(delta, valueAccessorOrAction, action) {
        var valueAccessor = this.defaultValueAccessor;
        if (typeof valueAccessorOrAction == "function") {
            action = valueAccessorOrAction;
        }
        else {
            valueAccessor = valueAccessorOrAction;
        }

        this.values[valueAccessor] = this.values[valueAccessor] || 0;
        this.values[valueAccessor] += delta;
        if (Math.abs(this.values[valueAccessor]) > Math.abs(this.limit)) {
            var appliedDelta = this.constant * (this.values[valueAccessor] - s58.getSign(this.values[valueAccessor]) * this.limit);
            this.values[valueAccessor] -= appliedDelta;
            action && action(appliedDelta);
        }
    };

    _Buffer.prototype.reset = function() {
        this.values = {};
    };
})();
