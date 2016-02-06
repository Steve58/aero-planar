// Universe
// Wraps a collection of blocks and cameras

"use strict";

window.e58 = window.e58 || {};

e58.universe = {};

(function () {
	function _Universe () {
		var _instance = this;
        _instance.className = "e58.universe";
		
		_instance.frame = e58.frame.getNew();
		_instance.blocks = [];
		_instance.cameras = [];
	}
	
	e58.universe.getNew = function () {
		return new _Universe();
	};

    _Universe.prototype.addBlock = function (origin, theta1Deg, phiYDeg, theta2Deg, options) {
        var blockFrame = e58.frame.getNew(origin, theta1Deg, phiYDeg, theta2Deg);
        var block = e58.block.getNew(this, blockFrame, options);
        this.blocks.push(block);
        return block;
    };

    _Universe.prototype.addCamera = function (origin, theta1Deg, phiYDeg, theta2Deg, zoom) {
        var camera = e58.camera.getNew(origin, theta1Deg, phiYDeg, theta2Deg, zoom);
        this.cameras.push(camera);
        return camera;
    };

    _Universe.prototype.render = function (camera, canvas) {
        var i, j, swapPolygon;

        canvas.clear();

        var canvasPolygons = [];
        for (i = 0; i < this.blocks.length; i++) {
            canvasPolygons = canvasPolygons.concat(this.blocks[i].getCanvasPolygons(camera, canvas));
        }			
        for (i = 0; i < canvasPolygons.length; i++) {
            for (j = i + 1; j < canvasPolygons.length; j++) {
                if (canvasPolygons[i].distanceToCamera < canvasPolygons[j].distanceToCamera) {
                    swapPolygon = canvasPolygons[i];
                    canvasPolygons[i] = canvasPolygons[j];
                    canvasPolygons[j] = swapPolygon;
                }
            }
        }			
        for (i = 0; i < canvasPolygons.length; i++) {
            canvasPolygons[i].render();
        }

        if (e58.vars.shading.enable) {
            canvas.renderShade(camera.frame.getUprightAngles());
        }
    };

    _Universe.prototype.updateLogic = function (control) {
        var i;
        for (i = 0; i < this.blocks.length; i++) {
            this.blocks[i].updateLogic(control);
        }
        for (i = 0; i < this.cameras.length; i++) {
            this.cameras[i].updateLogic(control);
        }
    };
})();
