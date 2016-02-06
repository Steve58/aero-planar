// Point
// Defines a point in 3D space in a Frame

"use strict";

window.e58 = window.e58 || {};

e58.point = {};

(function () {
	function _Point (options) {
        var _instance = this;
		_instance.className = "e58.point";
		
		_instance.x = options.x;
		_instance.y = options.y;
		_instance.z = options.z;
		_instance.r = options.r;
		_instance.theta = options.theta;
		_instance.phi = options.phi;
				
		if (options.cartesian) {
			_instance.r = Math.sqrt(_instance.x * _instance.x + _instance.y * _instance.y + _instance.z * _instance.z);
			_instance.theta = Math.atan2(_instance.y, _instance.x);
			_instance.phi = Math.atan2(Math.sqrt(_instance.x * _instance.x + _instance.y * _instance.y), _instance.z);
		}
		else if (options.polar) {
			_instance.x = _instance.r * Math.cos(_instance.theta) * Math.sin(_instance.phi);
			_instance.y = _instance.r * Math.sin(_instance.theta) * Math.sin(_instance.phi);;
			_instance.z = _instance.r * Math.cos(_instance.phi);
		}
	}
	
	e58.point.getNewPolar = function (r, theta, phi) {
		return new _Point({ polar: true, r: r, theta: theta, phi: phi });
	};
		
	e58.point.getNewXYZ = function (x, y, z) {
		return new _Point({ cartesian: true, x: x, y: y, z: z });
	};
	
	function _getNewSafe(arrayFunction, pointParam, defaultPoint) {
		if (pointParam && pointParam.className == "e58.point") {
			return pointParam;
		}		
		if (pointParam && pointParam.length == 3) {
			return arrayFunction(pointParam[0], pointParam[1], pointParam[2]);
		}
		return _getNewSafe(arrayFunction, defaultPoint, e58.point.getOrigin());
	};
	
	// Returns a point - either the instance passed in, or a new instance if an array of three coords is passed
	e58.point.getXYZSafe = function (pointParam, defaultPoint) {
		return _getNewSafe(e58.point.getNewXYZ, pointParam, defaultPoint);
	};
	
	// Returns a point - either the instance passed in, or a new instance if an array of three coords is passed
	e58.point.getPolarSafe = function (pointParam, defaultPoint) {
		return _getNewSafe(e58.point.getNewPolar, pointParam, defaultPoint);
	};
	
	e58.point.getOrigin = function () { return e58.point.getNewXYZ(0, 0, 0); };
	e58.point.getUnitX = function () { return e58.point.getNewXYZ(1, 0, 0); };
	e58.point.getUnitY = function () { return e58.point.getNewXYZ(0, 1, 0); };
	e58.point.getUnitZ = function () { return e58.point.getNewXYZ(0, 0, 1); };

    _Point.prototype.getUnitVector = function () {
        if (!this.r) {
            return e58.point.getUnitZ();
        }
        return e58.point.getNewPolar(1, this.theta, this.phi);
    };

    _Point.prototype.getRotatedInToFrame = function (frame, sign) {
        sign = (sign && sign > 0) ? 1 : -1;
        var rotatedPoint = this;
        if (sign > 0) {
            rotatedPoint = rotatedPoint.getRotated(frame.phiXY * sign, frame.phiXyAxis);
        }
        rotatedPoint = rotatedPoint.getRotated(frame.thetaZ * sign, frame.zAxis);
        if (sign < 0) {
            rotatedPoint = rotatedPoint.getRotated(frame.phiXY * sign, frame.phiXyAxis);
        }
        return rotatedPoint;
    }

    _Point.prototype.getPointInFrame = function (frame, sign) {
        sign = (sign && sign > 0) ? 1 : -1;
        var pointInFrame = this;
        if (sign < 0) {
            pointInFrame = pointInFrame.getTranslated(frame.origin, sign);
        }
        pointInFrame = pointInFrame.getRotatedInToFrame(frame, sign);
        if (sign > 0) {
            pointInFrame = pointInFrame.getTranslated(frame.origin, sign);
        }
        return pointInFrame;
    };

    _Point.prototype.getRotated = function (angle, axis) {
        var axisUnit = axis.getUnitVector();
        var axUX = axisUnit.x;
        var axUY = axisUnit.y;
        var axUZ = axisUnit.z;
        var cosA = Math.cos(angle);
        var sinA = Math.sin(angle);
        var oneMinusCosA = 1 - cosA;

        var rotatedX = (cosA + axUX * axUX * oneMinusCosA) * this.x
            + (axUX * axUY * oneMinusCosA - axUZ * sinA) * this.y
            + (axUX * axUZ * oneMinusCosA + axUY * sinA) * this.z;
        var rotatedY = (axUY * axUX * oneMinusCosA + axUZ * sinA) * this.x
            + (cosA + axUY * axUY * oneMinusCosA) * this.y
            + (axUY * axUZ * oneMinusCosA - axUX * sinA) * this.z;
        var rotatedZ = (axUZ * axUX * oneMinusCosA - axUY * sinA) * this.x
            + (axUZ * axUY * oneMinusCosA + axUX * sinA) * this.y
            + (cosA + axUZ * axUZ * oneMinusCosA) * this.z;

        return e58.point.getNewXYZ(rotatedX, rotatedY, rotatedZ);
    };

    _Point.prototype.getDistance = function (toPoint) {
        return Math.sqrt(((this.x - toPoint.x) * (this.x - toPoint.x))
            + ((this.y - toPoint.y) * (this.y - toPoint.y))
            + ((this.z - toPoint.z) * (this.z - toPoint.z)));
    };

    _Point.prototype.getTranslated = function (translationPoint, sign) {
        translationPoint = e58.point.getXYZSafe(translationPoint);
        sign = (sign && sign < 0) ? -1 : 1;
        return e58.point.getNewXYZ(
            this.x + translationPoint.x * sign,
            this.y + translationPoint.y * sign,
            this.z + translationPoint.z * sign
        );
    };

    _Point.prototype.getUniversePoint = function (frame) {
        return this.getPointInFrame(frame, 1);
    };

    _Point.prototype.clone = function () {
        return e58.point.getNewXYZ(this.x, this.y, this.z);
    };
})();
