// Frame
// Defines a Cartesian xyz frame in a Universe.

"use strict";

window.e58 = window.e58 || {};

e58.frame = {};

(function () {
	function _Frame (options) {
		var _instance = this;
        _instance.className = "e58.frame";

        // Origin is a Point in the Universe frame
 		_instance.origin = e58.point.getXYZSafe(options.origin, [0, 0, 0]);		

        // Axes are defined as unit vector (from the origin) points in the Universe frame
 		_instance.xAxis = e58.point.getUnitX();

        // Axes are defined as unit vector (from the origin) points in the Universe frame
 		_instance.yAxis = e58.point.getUnitY();

        // Axes are defined as unit vector (from the origin) points in the Universe frame
 		_instance.zAxis = e58.point.getUnitZ();

		_rotateAxes(_instance, options.rotation1ZRad || 0, e58.point.getUnitZ());
		_rotateAxes(_instance, options.rotation2YRad || 0, _instance.yAxis.clone());
		_rotateAxes(_instance, options.rotation3ZRad || 0, _instance.zAxis.clone());

        // First rotation angle used to rotate points into this frame
		_instance.phiXY = null;

        // Rotation axis used to rotate points into this frame
		_instance.phiXyAxis = null;

        // Second rotation angle used to rotate points into this frame
		_instance.thetaZ = null;

        // Calculate rotation angles and axis
		_instance.calculateRotations();
	}
	
    // Returns a new frame, at the specified origin, rotated from universe Frame:
    // 1. About own Z axis
    // 2. About own Y axis
    // 3. About own Z axis
	e58.frame.getNew = function (origin, rotation1ZDeg, rotation2YDeg, rotation3ZDeg) {
		return new _Frame({
			origin: origin,
			rotation1ZRad: s58.degToRad(rotation1ZDeg),
			rotation2YRad: s58.degToRad(rotation2YDeg),
			rotation3ZRad: s58.degToRad(rotation3ZDeg)
		});
	};

    function _rotateAxes(frame, angle, axis) {
        frame.xAxis = frame.xAxis.getRotated(angle, axis);
        frame.yAxis = frame.yAxis.getRotated(angle, axis);
        frame.zAxis = frame.zAxis.getRotated(angle, axis);
    }

    _Frame.prototype.rotate = function (angle, axis) {
        _rotateAxes(this, angle, axis);
        this.calculateRotations();
        return this;
    };

    _Frame.prototype.rotateInOwnFrameX = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), this.xAxis);
        return this;
    };
    _Frame.prototype.rotateInOwnFrameY = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), this.yAxis);
        return this;
    };
    _Frame.prototype.rotateInOwnFrameZ = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), this.zAxis);
        return this;
    };

    _Frame.prototype.rotateInUniverseX = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), e58.point.getUnitX());
        return this;
    };
    _Frame.prototype.rotateInUniverseY = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), e58.point.getUnitY());
        return this;
    };
    _Frame.prototype.rotateInUniverseZ = function (angleDeg) {
        this.rotate(s58.degToRad(angleDeg), e58.point.getUnitZ());
        return this;
    };

    // Calculate/recalculate rotation angles and axis used to rotate points into this frame
    _Frame.prototype.calculateRotations = function() {
        // rotate from universe z axis onto frame z
        if (this.zAxis.x == 0 && this.zAxis.y == 0) {
            this.phiXyAxis = e58.point.getUnitX();
        }
        else {
            this.phiXyAxis =  e58.point.getNewXYZ(-this.zAxis.y, this.zAxis.x, 0).getUnitVector();
        }
        this.phiXY = Math.atan2(
            Math.sqrt(this.zAxis.x * this.zAxis.x + this.zAxis.y * this.zAxis.y),
            this.zAxis.z);

        var reversePhiXYRotatedXAxis = this.xAxis.getRotated(-this.phiXY, this.phiXyAxis).getUnitVector();

        // rotate reverse phi xy rotated universe x axis onto universe x
        this.thetaZ = Math.atan2(reversePhiXYRotatedXAxis.y, reversePhiXYRotatedXAxis.x);

        return this;
    };

    _Frame.prototype.clone = function () {
        var cloneFrame = e58.frame.getNew(this.origin, 0, 0, 0);
        cloneFrame.xAxis = this.xAxis.clone();
        cloneFrame.yAxis = this.yAxis.clone();
        cloneFrame.zAxis = this.zAxis.clone();
        cloneFrame.phiXY = this.phiXY;
		cloneFrame.thetaZ = this.thetaZ;
		cloneFrame.phiXyAxis = this.phiXyAxis.clone();
        return cloneFrame;
    };

    _Frame.prototype.translateInOwnFrame = function (x, y, z, sign) {
        this.origin = this.origin.getTranslated(
            e58.point.getXYZSafe([x, y, z]).getRotatedInToFrame(this, 1),
            sign);
        return this;
    };

    _Frame.prototype.translateInUniverse = function (x, y, z, sign) {
        this.origin = this.origin.getTranslated([x, y, z], sign);
        return this;
    };

    // Returns angles describing Frame orientation
    _Frame.prototype.getUprightAngles = function () {
        var yVertDeg = s58.radToDeg(s58.radPiToPi(Math.atan2(
            Math.sqrt(this.yAxis.x * this.yAxis.x + this.yAxis.z * this.yAxis.z),
            this.yAxis.y)));
        var yVertSign = -s58.getSign(this.xAxis.y);

        var zFlatDeg = s58.radToDeg(s58.radPiToPi(Math.atan2(
            Math.sqrt(this.zAxis.x * this.zAxis.x + this.zAxis.z * this.zAxis.z),
            this.zAxis.y)));
        zFlatDeg = (zFlatDeg + 360 - 90 + 180) % 360 - 180;
        var zFlatSign = s58.getSign(this.yAxis.y);

        var compassDeg = -s58.radToDeg(s58.radPiToPi(Math.atan2(this.zAxis.x, this.zAxis.z)));


        var xFlatDeg = s58.radToDeg(s58.radPiToPi(Math.atan2(
            Math.sqrt(this.xAxis.x * this.xAxis.x + this.xAxis.z * this.xAxis.z),
            this.xAxis.y)));
        xFlatDeg = (xFlatDeg * zFlatSign + 360 - 90 + 180) % 360 - 180;


        var measuringFrame = e58.frame.getNew();
        measuringFrame.rotateInOwnFrameY(-compassDeg);
        measuringFrame.rotateInOwnFrameX(-zFlatDeg);
        var xAxisInMeasuringFrame = this.xAxis.getRotatedInToFrame(measuringFrame, -1);
        var rollDeg = -s58.radToDeg(s58.radPiToPi(Math.atan2(xAxisInMeasuringFrame.y, xAxisInMeasuringFrame.x)));


        return {
            xFlatDeg: xFlatDeg,
            yVertDeg: yVertSign * yVertDeg,
            zFlatDeg: zFlatSign * zFlatDeg,
            compassDeg: compassDeg,
            rollDeg: rollDeg
        };
    };
})();
