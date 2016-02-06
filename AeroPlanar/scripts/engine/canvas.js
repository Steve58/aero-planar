// Canvas
// Wraps an html5 canvas with features for rendering Universe and Blocks etc.

"use strict";

window.e58 = window.e58 || {};

e58.canvas = {};

(function () {
	function _Canvas(options) {
		var _instance = this;
        _instance.className = "e58.canvas";

		_instance.htmlElement = document.getElementById(options.htmlId);
		_instance.htmlElement.requestPointerLock =
			_instance.htmlElement.requestPointerLock ||
			_instance.htmlElement.mozRequestPointerLock ||
			_instance.htmlElement.webkitRequestPointerLock;
		
		_instance.width = null;
		_instance.height = null;
		_instance.clearColour = options.clearColour || "#ffffff";
				
		_instance.updateDimensions = function() {
			_instance.width = _instance.htmlElement.clientWidth;
			_instance.height = _instance.htmlElement.clientHeight;
			_instance.htmlElement.setAttribute("width", _instance.width);
			_instance.htmlElement.setAttribute("height", _instance.height);
			_instance.htmlElement.width = _instance.width;
			_instance.htmlElement.height = _instance.height;
            if (s58.vars.autoOrient) {
                s58.vars.orient = (_instance.width >= _instance.height) ? 0: 90;
            }
		};
		
		_instance.getContext = function (strokeStyle, fillStyle, lineWidth) {
			var context = _instance.htmlElement.getContext("2d");
			context.lineWidth = lineWidth || (e58.vars.integerPixels ? 1: 0.5);
            context.strokeStyle = strokeStyle || _instance.clearColour;
			context.fillStyle = fillStyle || _instance.clearColour;
			context.lineCap = "round";
			context.lineJoin = "round";
			return context;
		};
		
		_instance.clear = function () {
			var context = _instance.getContext();
			context.fillRect(0, 0, _instance.width, _instance.height);
		};
		
        _instance.renderShade = function (uprightAngles) {
            if (!e58.vars.shading.enable) {
                return;
            }
            var hypotoneuse = Math.sqrt(_instance.width * _instance.width +  _instance.height * _instance.height);
            var context = _instance.getContext(s58.rgba(0, 0));
            var vGradient = context.createLinearGradient(
                0.5 * (_instance.width - hypotoneuse * Math.sin(s58.degToRad(uprightAngles.xFlatDeg - s58.vars.orient))),
                0.5 * (_instance.height - hypotoneuse * Math.cos(s58.degToRad(uprightAngles.xFlatDeg - s58.vars.orient))),
                0.5 * (_instance.width + hypotoneuse * Math.sin(s58.degToRad(uprightAngles.xFlatDeg - s58.vars.orient))),
                0.5 * (_instance.height + hypotoneuse * Math.cos(s58.degToRad(uprightAngles.xFlatDeg - s58.vars.orient))));
            var halfShade = e58.vars.shading.halfShade;
            var midShade = halfShade * (1 + Math.sin(s58.degToRad(uprightAngles.zFlatDeg)) * (Math.abs(uprightAngles.xFlatDeg) <= 90 ? 1: -1));
            var pitchFactor = Math.cos(s58.degToRad(uprightAngles.zFlatDeg)) * Math.cos(s58.degToRad(uprightAngles.zFlatDeg));
            var lightShade = midShade + halfShade * pitchFactor;
            (lightShade <= halfShade * 2) || (lightShade = halfShade * 2);
            var darkShade = midShade - halfShade * pitchFactor;
            (darkShade >= 0) || (darkShade = 0);
            vGradient.addColorStop(0, s58.rgba(Math.ceil(255 * lightShade), e58.vars.shading.transparency));
            vGradient.addColorStop(1, s58.rgba(Math.ceil(255 * darkShade), e58.vars.shading.transparency));
            context.fillStyle = vGradient;
            context.fillRect(0, 0, _instance.width, _instance.height);
        };

        function _isPointerLockedOnElement() {
            return _instance.htmlElement == (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement);
        }

		function _pointerLockChangeHandler(event, lockedHandler, unlockedHandler) {
            if(_isPointerLockedOnElement()) {
				// console.log("Pointer locked");
				document.getElementsByTagName("body")[0].className = e58.vars.activeBodyClassName;
				_instance.updateDimensions();
                _instance.htmlElement.removeEventListener("click", _requestPointerLockHandler);
				lockedHandler(event);
			}
			else {
				// console.log("Pointer unlocked");
				document.getElementsByTagName("body")[0].className = e58.vars.inactiveBodyClassName;
				_instance.updateDimensions();
                _instance.htmlElement.addEventListener("click", _requestPointerLockHandler);
				unlockedHandler(event);
			}
		}

        function _requestPointerLockHandler(event) {
            // Request camera first to allow confirming before mouse is locked
            if(e58.webcam.initialised && !e58.webcam.starting && !e58.webcam.running) {
                e58.webcam.start();
            }

            // Temporarily remove handler to allow clicking to confirm mouse capture on Firefox
            _instance.htmlElement.removeEventListener("click", _requestPointerLockHandler);
            _instance.htmlElement.requestPointerLock();
            setTimeout(function () {
                if (!_isPointerLockedOnElement()) {
                    _instance.htmlElement.addEventListener("click", _requestPointerLockHandler);
                }
            }, e58.vars.requestPointerLockDelayMs);
        }

		_instance.requestPointerLockOnClick = function (lockedHandler, unlockedHandler) {
            function pointerLockChangeHandlerWrapper(event) {
				_pointerLockChangeHandler(event, lockedHandler, unlockedHandler);
			}
			document.addEventListener("pointerlockchange", pointerLockChangeHandlerWrapper);
			document.addEventListener("mozpointerlockchange", pointerLockChangeHandlerWrapper);
			document.addEventListener("webkitpointerlockchange", pointerLockChangeHandlerWrapper);
			_instance.htmlElement.addEventListener("click", _requestPointerLockHandler);
		};
		
        function _touchStartStartControlHandlerWrapper (event) {
            _instance.htmlElement.removeEventListener("touchstart", _touchStartStartControlHandlerWrapper);
            _instance.htmlElement.addEventListener("touchend", _touchEndStartControlHandlerWrapper);
            _instance.htmlElement.removeEventListener("click", _requestPointerLockHandler);
        }

		var _touchEndStartControlHandlerWrapper = null;
		function _touchStartControlHandler(event, touchStartHandler) {
			// s58.pageConsoleWrite("touch mode started");
			_instance.htmlElement.removeEventListener("touchend", _touchEndStartControlHandlerWrapper);
			console.log("Touch start");
			document.getElementsByTagName("body")[0].className = e58.vars.activeBodyClassName;
            _instance.updateDimensions();
            touchStartHandler(event);
		}

        var _touchStopControlHandlerWrapper = null;
        function _touchStopControlHandler (event, touchStopControlHandler) {
            document.getElementsByTagName("body")[0].className = e58.vars.inactiveBodyClassName;
            _instance.updateDimensions();
			_instance.htmlElement.addEventListener("touchstart", _touchStartStartControlHandlerWrapper);
            touchStopControlHandler(event);
        }

		_instance.startOnTouch = function (touchStartHandler, touchStopControlHandler) {
            _touchEndStartControlHandlerWrapper = function (event) {
                // Request camera first
                if(e58.webcam.initialised && !e58.webcam.starting && !e58.webcam.running) {
                    e58.webcam.start();
                }

                // alert("touch end");
                setTimeout(function () {
                    _touchStartControlHandler(event, touchStartHandler);
                }, e58.startDelayMs);
			};
            _touchStopControlHandlerWrapper = function (event) {
                setTimeout(function () {
                    _touchStopControlHandler(event, touchStopControlHandler);
                }, e58.startDelayMs);
            };
			_instance.htmlElement.addEventListener("touchstart", _touchStartStartControlHandlerWrapper);
		};

        _instance.touchStopControl = function (stopControlHandler) {
            _touchStopControlHandlerWrapper && _touchStopControlHandlerWrapper();
        };
		
        _instance.getStandardZoom = function () {
            return s58.getOrientCoordX(_instance.width, _instance.height) / e58.vars.standardWidthZoomRatio;
        };


        _instance.context = null;
        _instance.startContext = function (strokeStyle, fillStyle, lineWidth) {
            _instance.context = _instance.getContext(strokeStyle, fillStyle, lineWidth);
            return _instance.context;
        };

        _instance.setLineWidth = function (lineWidth) {
            _instance.context.lineWidth = e58.integerPixels ? Math.ceil(lineWidth): lineWidth;
        };

        _instance.setLineColour = function (strokeStyle) {
            _instance.context.strokeStyle = strokeStyle;
        };

        _instance.setFillColour = function (fillStyle) {
            _instance.context.fillStyle = fillStyle;
        };

        _instance.beginPath = function () {
            _instance.context.beginPath();
        };
        _instance.closePath = function () {
            _instance.context.closePath();
        };
        _instance.stroke = function () {
            _instance.context.stroke();
        };
        _instance.fill = function () {
            _instance.context.fill();
        };
        _instance.moveTo = function (x, y) {
            var drawPoint = getDrawPoint(x, y);
            _instance.context.moveTo(drawPoint.x, drawPoint.y);
        };
        _instance.lineTo = function (x, y) {
            var drawPoint = getDrawPoint(x, y);
            _instance.context.lineTo(drawPoint.x, drawPoint.y);
        };
        _instance.arc = function (x, y, radius, startRad, endRad) {
            var drawPoint = getDrawPoint(x, y);
            var orientRad = s58.degToRad(s58.vars.orient);
            _instance.context.arc(drawPoint.x, drawPoint.y, radius, startRad + orientRad, endRad + orientRad);
        };

        _instance.fillText = function (text, sizePx, align, baseline) {
            _instance.context.font = ""
                + e58.vars.fontWeight + " "
                + e58.utils.pixel(sizePx || e58.vars.fontSizePx) + "px "
                + e58.vars.fontFamily;
            _instance.context.textAlign = align || "center";
            _instance.context.textBaseline = baseline || "middle";
            var drawPoint = getDrawPoint(0, 0);

            // TODO: handle orient 180 and 270 cases
            switch (s58.vars.orient) {
                case 90:
                    _instance.context.rotate(s58.HALFPI);
                    _instance.context.translate(drawPoint.y, -drawPoint.x);
                    _instance.context.fillText(text, 0, 0);
                    _instance.context.translate(-drawPoint.y, drawPoint.x);
                    _instance.context.rotate(-s58.HALFPI);
                    break;
                default:
                    _instance.context.fillText(text, drawPoint.x, drawPoint.y);
                    break;
            }
        };

        _instance.getDimensions = function () {
            var w = _instance.width;
            var h = _instance.height;
            return {
                w: w,
                h: h,
                x: s58.getOrientDimension(w, h),
                y: s58.getOrientDimension(h, w),
                min: (w < h) ? w: h,
                max: (w > h) ? w: h
            };
        };

        _instance.drawOrigin = { x: 0, y: 0 };
        _instance.setDrawOrigin = function (x, y, xo, yo) {
            xo = xo || 0;
            yo = yo || 0;

            // TODO: 180 and 270 cases
            switch (s58.vars.orient) {
                case 90:
                    _instance.drawOrigin = {
                        x: 0.5 * _instance.height * (1 + xo) + x,
                        y: 0.5 * _instance.width  * (1 + yo) + y
                    };
                    break;
                default:
                    _instance.drawOrigin = {
                        x: 0.5 * _instance.width  * (1 + xo) + x,
                        y: 0.5 * _instance.height * (1 - yo) - y
                    };
                    break;
            }
        };

        function getDrawPoint(x, y) {
            var drawX = +s58.getOrientCoordX(x, y) + s58.getOrientCoordX(_instance.drawOrigin.x, _instance.drawOrigin.y);
            var drawY = -s58.getOrientCoordY(y, x) + s58.getOrientDimension(_instance.drawOrigin.y, _instance.drawOrigin.x);
            return {
                x: e58.utils.pixel(drawX),
                y: e58.utils.pixel(drawY)
            };
        }

		_instance.updateDimensions();
	}

	e58.canvas.getNew = function (htmlId, clearColour) {
		return new _Canvas({
			htmlId: htmlId,
			clearColour: clearColour
		});
	};
})();

