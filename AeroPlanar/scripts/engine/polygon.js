// Polygon
// A simple convex polygon in 3D space, belonging to a Block

"use strict";

window.e58 = window.e58 || {};

e58.polygon = {};

(function () {
	function _Polygon (options) {
		var _instance = this;
        _instance.className = "e58.polygon";

		_instance.block = options.block;
        _instance.name = options.name;
		_instance.lineColour = options.lineColour;
		_instance.fillColour = options.fillColour;
        _instance.detailLevel = options.detailLevel || 0;
		
		_instance.points = (function () {
			var i;
			var points = options.points || [];
			for (i = 0; i < points.length; i++) {
				points[i] = e58.point.getXYZSafe(points[i]);
			}
			return points;
		})();
	}

	e58.polygon.getNew = function (
		block,
        name,
		lineColour,
		fillColour,
		points,
        detailLevel) {
		return new _Polygon({
			block: block,
            name: name,
			lineColour: lineColour,
			fillColour: fillColour,
			points: points,
            detailLevel: detailLevel
		});
	};

    _Polygon.prototype.getUniversePoints = function () {
        var i;
        var universePoints = [];
        for (i = 0; i < this.points.length; i++) {
            universePoints.push(this.points[i].getUniversePoint(this.block.frame));
        }
        return universePoints;
    };

    _Polygon.prototype.getCanvasPolygon = function (camera, canvas) {
        return e58.canvasPolygon.getNew(this, camera, canvas);
    };
})();
