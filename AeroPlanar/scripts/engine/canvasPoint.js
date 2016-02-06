// CanvasPoint
// Defines a 2D point on a Canvas for rendering

"use strict";

window.e58 = window.e58 || {};

e58.canvasPoint = {};

(function () {
	function _CanvasPoint (options) {
		var _instance = this;
        _instance.className = "e58.point";
		
		_instance.pointInCameraFrame = options.universePoint.getPointInFrame(options.camera.frame);
		
		_instance.canvasX = _calculateCanvasCoordinate(
            s58.getOrientCoordX(_instance.pointInCameraFrame.x, _instance.pointInCameraFrame.y),
            _instance.pointInCameraFrame.z,
            options.camera.zoom,
            options.canvas.width);

		_instance.canvasY = _calculateCanvasCoordinate(
            -s58.getOrientCoordY(_instance.pointInCameraFrame.y, _instance.pointInCameraFrame.x),
            _instance.pointInCameraFrame.z,
            options.camera.zoom,
            options.canvas.height);
	}

	e58.canvasPoint.getNew = function (camera, canvas, universePoint) {
		return new _CanvasPoint({
			camera: camera,
			canvas: canvas,
			universePoint: universePoint
		});
	};
	
    function _calculateCanvasCoordinate(coordInCameraFrame, zInCameraFrame, cameraZoom, canvasDimension) {
        var sign = -s58.getSign(zInCameraFrame);
        return 0.5 * canvasDimension
            + sign
                * cameraZoom
                * e58.vars.pixelToCoordScale
                * coordInCameraFrame
                * e58.vars.cameraScreenDistance
                / -zInCameraFrame;
    }
})();
