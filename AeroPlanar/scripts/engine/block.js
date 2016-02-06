// Block: a Frame and a set of Polygons
"use strict"

window.e58 = window.e58 || {};

e58.block = {};

(function () {	
	function _Block (options) {
		var _instance = this;
        _instance.className = "e58.block";
		_instance.universe = options.universe;
		_instance.frame = options.frame || e58.frame.getNew();
        _instance.alwaysDraw = Boolean(options.extendedOptions.alwaysDraw);
        _instance.detailLevel = 0;
		_instance.polygons = [];		
		_instance.velocityInOwnFrame = e58.point.getNewXYZ(0, 0, 0);
		_instance.xMax = 0;
        _instance.yMax = 0;
        _instance.zMax = 0;
        _instance.rMax = 0;
	}

	e58.block.getNew = function (
		universe,
		frame,
        options) {
		return new _Block({
			universe: universe,
			frame: frame,
            extendedOptions: options || {}
		});
	};

    _Block.prototype.getPolygon = function (name) {
        var i;
        for (i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].name == name) {
                return this.polygons[i];
            }
        }
        return null;
    };

    _Block.prototype.getVelocityInUniverse = function () {
        return this.velocityInOwnFrame.getRotatedInToFrame(this.frame, 1);
    };

    _Block.prototype.setVelocityInUniverse = function (velocityInUniverse) {
        this.velocityInOwnFrame = velocityInUniverse.getRotatedInToFrame(this.frame, -1);
    };

    _Block.prototype.addPolygon = function (name, lineColour, fillColour, points, detailLevel) {
        var i, j;
        var polygon = e58.polygon.getNew(this, name, lineColour, fillColour, points, detailLevel);
        this.polygons.push(polygon);
        for (i = 0; i < this.polygons.length; i++) {
            for (j = 0; j < this.polygons[i].points.length; j++) {
                (this.xMax >= Math.abs(this.polygons[i].points[j].x))
                        || (this.xMax = Math.abs(this.polygons[i].points[j].x));
                (this.yMax >= Math.abs(this.polygons[i].points[j].y))
                        || (this.yMax = Math.abs(this.polygons[i].points[j].y));
                (this.zMax >= Math.abs(this.polygons[i].points[j].z))
                        || (this.zMax = Math.abs(this.polygons[i].points[j].z));
                (this.rMax >= this.polygons[i].points[j].r)
                        || (this.rMax = this.polygons[i].points[j].r);
            }
        }
        return polygon;
    };

    _Block.prototype.getCanvasPolygons = function (camera, canvas) {
        var i;
        if (!this.alwaysDraw) {
            if (this.frame.origin.getDistance(camera.frame.origin)
                        + this.rMax > e58.vars.drawDistance) {
                // console.log("block beyond draw distance");
                return [];
            }
            var originInCameraFrame = this.frame.origin.getPointInFrame(camera.frame);
            if (originInCameraFrame.z > this.rMax) {
                // console.log("block behind camera");
                return [];
            }
            if (originInCameraFrame.z < 0
                    && originInCameraFrame.r > this.rMax
                    && s58.radToDeg(originInCameraFrame.phi) < 180 - e58.vars.drawYaw) {
                // console.log("block beyond draw yaw angle");
                // return [];
            }
        }

        var canvasPolygons = [];
        for (i = 0; i < this.polygons.length; i++) {
            if (this.detailLevel >= this.polygons[i].detailLevel) {
                canvasPolygons.push(this.polygons[i].getCanvasPolygon(camera, canvas));
            }
        }
        return canvasPolygons;
    };

    _Block.prototype.updateLogic = function (control) {
        var translation = e58.point.getNewXYZ(
            this.velocityInOwnFrame.x * control.msSinceLastLogic,
            this.velocityInOwnFrame.y * control.msSinceLastLogic,
            this.velocityInOwnFrame.z * control.msSinceLastLogic);
        this.frame.translateInOwnFrame(translation.x, translation.y, translation.z, 1);
    };
})();
