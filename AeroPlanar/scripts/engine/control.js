// control
// Control features

"use strict";

window.e58 = window.e58 || {};
e58.control = {};

window.addEventListener("load", function() {
	document.getElementsByTagName("body")[0].className = e58.vars.inactiveBodyClassName;
});

(function () {
    var control = e58.control;

    control.log = {
        msCounts: {
            pollInterval: [],
            logicInterval: [],
            webcamInterval: [],
            renderInterval: [],
            audioInterval: [],
            pollDuration: [],
            logicDuration: [],
            webcamDuration: [],
            renderDuration: [],
            audioDuration: [],
        },
        record: function (msCountName, ms) {
            if (e58.vars.control.logEnabled && (ms || ms == 0)) {
                control.log.msCounts[msCountName][ms] =
                        (control.log.msCounts[msCountName][ms] || 0) + 1;
            }
        },
        recordMsSince: function (msCountName, utcMs) {
            if (e58.vars.control.logEnabled && (utcMs || utcMs == 0)) {
                control.log.record(msCountName, new Date().valueOf() - utcMs);
            }
        },
        write: function () {
            var i, j, countName;
            var msCountLengths = [];
            var headersText = "ms";
            for (countName in control.log.msCounts) {
                msCountLengths.push(control.log.msCounts[countName].length);
                headersText += "\t" + countName;
            }
            var dataText = "";
            for (i = 0; i < s58.max(msCountLengths); i++) {
                dataText += "\n" + i;
                for (countName in control.log.msCounts) {
                    dataText +=
                        control.log.msCounts[countName][i] ?
                            "\t" + control.log.msCounts[countName][i] :
                            "\t" + "0";
                }
            }
            console.log(headersText + dataText);
        }
    };

    control.queuedSounds = [];
    control.loopedSounds = [];

    control.queueSound = function (sound, options) {
        var i;
        options = options || {};
        options.tag = options.tag || e58.audio.defaultTag;
        var soundToQueue = { sound: sound, options: options };

        for (i = 0; i < control.queuedSounds.length; i++) {
            if (control.queuedSounds[i].sound.name == sound.name
                    && control.queuedSounds[i].options.tag == options.tag) {
                control.queuedSounds[i] = soundToQueue;
                // console.log(sound.name + " " + options.tag + " refreshed in queue");
                return;
            }
        }
        control.queuedSounds.push(soundToQueue);
        // console.log(sound.name + " " + options.tag + " queued");
    };

    control.stopSound = function (name, tag) {
        var i;
        tag = tag || e58.audio.defaultTag;
        for (i = 0; i < control.loopedSounds.length; i++) {
            if (control.loopedSounds[i].sound.name == name
                    && control.loopedSounds[i].options.tag == tag) {
                control.loopedSounds[i].sound.stopLoop(tag);
                control.loopedSounds.splice(i, 1);
                // console.log(name + " " + tag + " sound stopped");
                return;
            }
        }
    };

    control.stopAllSounds = function (name, tag) {
        var i;
        for (i = 0; i < control.loopedSounds.length; i++) {
            control.loopedSounds[i].sound.stopLoop(control.loopedSounds[i].options.tag);
        }
        control.loopedSounds = [];
        control.queuedSounds = [];
    };

    var _keyMap = (function () {
        var i;
        var keyMap = [];
        for (i = 0; i < 26; i++) {
            keyMap[i + 65] = "abcdefghijklmnopqrstuvwxyz"[i];
        }
        for (i = 0; i < 10; i++) {
            keyMap[i + 48] = keyMap[i + 96] = "0123456789"[i];
        }

        keyMap[37] = "left";
        keyMap[38] = "up";
        keyMap[39] = "right";
        keyMap[40] = "down";

        keyMap[109] = keyMap[189] = keyMap[173] = "-";
        keyMap[107] = keyMap[187] = keyMap[61] = "+";
        keyMap[32] = " ";
        keyMap[110] = keyMap[190] = ".";
        keyMap[192] = keyMap[223] = "`";
        keyMap[163] = keyMap[222] = "#";
        return keyMap;
    })();

    var _touchCanvas;
    var _pollIntervalId;
    var _mouseMove = { x: 0, y: 0};
    var _touchMove = { x: 0, y: 0};
    var _currentTouches = [];
    var _mousesDown = { left: false, middle: false, right: false };
    var _rotation = { active: false, alpha: 0, beta: 0, gamma: 0 };
    var _orientation = { active: false, alpha: 0, beta: 0, gamma: 0 };
    var _derivedOrientation = { active: false, pitch: 0, roll: 0, absoluteFactor: 0.2};
    var _keys = {
        keysDown: [],
        isDown: function (keyString) {
            return _keys.keysDown.indexOf(keyString) >= 0;
        },
        anyDown: function (keysString) {
            var i;
            for (i = 0; i < keysString.length; i++) {
                if (_keys.isDown(keysString[i])) {
                    return true;
                }
            }
            return false;
        },
        numberDown: function () {
            var i;
            for (i = 0; i < 10; i++) {
                if (_keys.isDown("9876543210"[i])) {
                    return parseInt("9876543210"[i], 10);
                }
            }
            return null;
        }
    };

    var _derivedOrientationAbsoluteBuffer = e58.buffer.getNew(
        e58.vars.control.derivedOrientationAbsoluteBuffer.limit,
        e58.vars.control.derivedOrientationAbsoluteBuffer.constant);
        // { pitch: 0, roll: 0});

    var _derivedOrientationRelativeBuffer = e58.buffer.getNew(
        e58.vars.control.derivedOrientationRelativeBuffer.limit,
        e58.vars.control.derivedOrientationRelativeBuffer.constant);
        // { pitch: 0, roll: 0});

    var _lastPollUtcMs, _lastLogicUpdateUtcMs, _lastWebcamUtcMs, _lastRenderUtcMs, _lastPlaySoundsUtcMs, _lastMotionUtcMs;
    var _totalElapsedMs = 0;
    var _msSinceLastResumed = 0;
    var _logicUpdateFunction, _renderFunction;

    function _pollIfDue() {
        var nowUtcMs = new Date().valueOf();
        if (nowUtcMs - _lastPollUtcMs >= e58.vars.control.pollIntervalMs) {
            _poll(nowUtcMs);
        }
    }

    function _poll(nowUtcMs) {
        nowUtcMs = nowUtcMs || new Date().valueOf();
        control.log.record("pollInterval", nowUtcMs - _lastPollUtcMs);
        _lastPollUtcMs = nowUtcMs;

        var msSinceLastLogic = nowUtcMs - _lastLogicUpdateUtcMs;
        if (msSinceLastLogic >= e58.vars.control.logicUpdateIntervalMs) {
            _runLogicUpdateFunction(nowUtcMs, msSinceLastLogic);
            control.log.record("logicInterval", msSinceLastLogic);
            control.log.recordMsSince("logicDuration", nowUtcMs);
        }

        if (e58.webcam.running) {
            nowUtcMs = new Date().valueOf();
            var msSinceLastWebcam = nowUtcMs - _lastWebcamUtcMs;
            if (msSinceLastWebcam >= e58.vars.control.webcamIntervalMs) {
                _runWebcamFunction(nowUtcMs, msSinceLastWebcam);
                control.log.record("webcamInterval", msSinceLastWebcam);
                control.log.recordMsSince("webcamDuration", nowUtcMs);
            }
        }

        nowUtcMs = new Date().valueOf();
        var msSinceLastRender = nowUtcMs - _lastRenderUtcMs;
        if (msSinceLastRender >= e58.vars.control.renderIntervalMs) {
            _runRenderFunction(nowUtcMs, msSinceLastRender);
            control.log.record("renderInterval", msSinceLastRender);
            control.log.recordMsSince("renderDuration", nowUtcMs);
        }

        nowUtcMs = new Date().valueOf();
        var msSinceLastPlaySounds = nowUtcMs - _lastPlaySoundsUtcMs;
        if (msSinceLastPlaySounds >= e58.vars.control.playSoundsIntervalMs) {
            _playSounds(nowUtcMs);
            control.log.record("audioInterval", msSinceLastPlaySounds);
            control.log.recordMsSince("audioDuration", nowUtcMs);
        }
    }

    function _runLogicUpdateFunction (nowUtcMs, msSinceLastLogic) {
        _removeOldTouches();
        _totalElapsedMs += msSinceLastLogic;
        _msSinceLastResumed += msSinceLastLogic;

        // s58.pageConsoleWrite("" +
            // "orientation: " +
            // "<br/>" + s58.floor(_orientation.alpha, 2) +
            // "<br/>" + s58.floor(_orientation.beta, 2) +
            // "<br/>" + s58.floor(_orientation.gamma, 2) +
            // "<br/>" +
            // "rotation: " +
            // "<br/>" + s58.floor(_rotation.alpha, 2) +
            // "<br/>" + s58.floor(_rotation.beta, 2) +
            // "<br/>" + s58.floor(_rotation.gamma, 2) +
            // "");

        if (_derivedOrientation.active || (_orientation.active && _rotation.active)) {
            _derivedOrientation.active = true;

            if (_orientation.pitch == null) {
                _derivedOrientationRelativeBuffer.apply(_rotation.alpha, "pitch", function (appliedDelta) {
                    _derivedOrientation.pitch = (_derivedOrientation.pitch + appliedDelta + 360 + 180) % 360 - 180;
                });
            }
            else {
                var pitchDelta = _orientation.pitch - _derivedOrientation.pitch;
                (_orientation.pitch < -90 && _derivedOrientation.pitch > 90) && (pitchDelta += 360);
                (_orientation.pitch > 90 && _derivedOrientation.pitch < -90) && (pitchDelta -= 360);

                _derivedOrientationAbsoluteBuffer.apply(pitchDelta * _derivedOrientation.absoluteFactor, "pitch", function (appliedDelta) {
                    _derivedOrientation.pitch = (_derivedOrientation.pitch + appliedDelta + 360 + 180) % 360 - 180;
                });
            }

            if (_orientation.roll == null) {
                _derivedOrientationRelativeBuffer.apply(_rotation.gamma, "roll", function (appliedDelta) {
                    _derivedOrientation.roll = (_derivedOrientation.roll - appliedDelta + 360 + 180) % 360 - 180;
                });
            }
            else {
                var rollDelta = _orientation.roll - _derivedOrientation.roll;
                (_orientation.roll > 90 && _derivedOrientation.roll < -90) && (rollDelta -= 360);
                (_orientation.roll < -90 && _derivedOrientation.roll > 90) && (rollDelta += 360);

                _derivedOrientationAbsoluteBuffer.apply(rollDelta * _derivedOrientation.absoluteFactor, "roll", function (appliedDelta) {
                    _derivedOrientation.roll = (_derivedOrientation.roll + appliedDelta + 360 + 180) % 360 - 180;
                });
            }
        }

        _logicUpdateFunction({
            totalElapsedMs: _totalElapsedMs,
            msSinceLastResumed: _msSinceLastResumed,
            msSinceLastLogic: msSinceLastLogic,
            mouseMove: _mouseMove,
            touchMove: _touchMove,
            move: {
                x: _mouseMove.x || _touchMove.x || 0,
                y: _mouseMove.y || _touchMove.y || 0
            },
            mousesDown: _mousesDown,
            keys: _keys,
            orientation: _orientation,
            rotation: _rotation,
            touchCount: _currentTouches.length,
            touches: _currentTouches,
            derivedOrientation: _derivedOrientation,
            webcam: { maxima: e58.webcam.maxima }
        });

        _lastLogicUpdateUtcMs = nowUtcMs;
        _mouseMove.x = _mouseMove.y = _touchMove.x = _touchMove.y = 0;
        _rotation.alpha = _rotation.beta = _rotation.gamma = 0;
    }

    function _runWebcamFunction (nowUtcMs, msSinceLastWebcam) {
        e58.webcam.refreshMaxima();
        _lastWebcamUtcMs = nowUtcMs;
    }

    function _runRenderFunction (nowUtcMs, msSinceLastRender) {
        window.requestAnimationFrame(_renderFunction); // _renderFunction();
        _lastRenderUtcMs = nowUtcMs;
    }

    function _playSounds(nowUtcMs) {
        _lastPlaySoundsUtcMs = nowUtcMs;
        var i, queuedSound;
        while(control.queuedSounds.length) {
            queuedSound = control.queuedSounds.pop();
            queuedSound.sound.play(queuedSound.options);
            if (queuedSound.options.loop) {
                control.loopedSounds.push(queuedSound);
            }
        }
    }

    control.start = function (logicRefreshFunction, renderFunction, touchCanvas) {
        setTimeout(function () {
            _start(logicRefreshFunction, renderFunction, touchCanvas);
        }, e58.vars.control.startDelayMs);
    };

    function _start(logicRefreshFunction, renderFunction, touchCanvas) {
        (_pollIntervalId || _pollIntervalId == 0) && clearInterval(_pollIntervalId);
        _logicUpdateFunction = logicRefreshFunction;
        _renderFunction = renderFunction;		

        _touchCanvas = touchCanvas;
        if (_touchCanvas) {			
            _touchCanvas.htmlElement.addEventListener("touchstart", _touchStartHandler);
            _touchCanvas.htmlElement.addEventListener("touchend", _touchEndHandler);
            _touchCanvas.htmlElement.addEventListener("touchcancel", _touchCancelHandler);
            _touchCanvas.htmlElement.addEventListener("touchleave", _touchLeaveHandler);
            _touchCanvas.htmlElement.addEventListener("touchmove", _touchMoveHandler);
            window.addEventListener("deviceorientation", _orientationHandler);
            window.addEventListener("devicemotion", _motionHandler);
        }
        else {
            document.addEventListener("mousemove", _mouseMoveHandler);
            document.addEventListener("mousedown", _mouseDownHandler);
            document.addEventListener("mouseup", _mouseUpHandler);
            document.addEventListener("keydown", _keyDownHandler);
            document.addEventListener("keyup", _keyUpHandler);			
        }

        _mouseMove.x = _mouseMove.y = _touchMove.x = _touchMove.y = 0;

        var nowUtcMs = new Date().valueOf();
        _lastPollUtcMs = nowUtcMs;
        _lastWebcamUtcMs = nowUtcMs;
        _lastMotionUtcMs = nowUtcMs;
        _runLogicUpdateFunction(nowUtcMs, /*msSinceLastLogic:*/ 0);
        _runRenderFunction(nowUtcMs, /*msSinceLastRender:*/ 0);
        _lastPlaySoundsUtcMs = nowUtcMs;
        _pollIntervalId = setInterval(_pollIfDue, e58.vars.control.pollIntervalMs);
    };

    control.stop = function () {
        _msSinceLastResumed = 0;
        _keys.keysDown = [];
        _mousesDown = { left: false, middle: false, right: false };
        _currentTouches = [];
        if (_touchCanvas) {			
            _touchCanvas.htmlElement.removeEventListener("touchstart", _touchStartHandler);
            _touchCanvas.htmlElement.removeEventListener("touchend", _touchEndHandler);
            _touchCanvas.htmlElement.removeEventListener("touchcancel", _touchCancelHandler);
            _touchCanvas.htmlElement.removeEventListener("touchleave", _touchLeaveHandler);
            _touchCanvas.htmlElement.removeEventListener("touchmove", _touchMoveHandler);
            window.removeEventListener("deviceorientation", _orientationHandler);
            window.removeEventListener("devicemotion", _motionHandler);
        }
        else {
            document.removeEventListener("mousemove", _mouseMoveHandler);
            document.removeEventListener("mousedown", _mouseDownHandler);
            document.removeEventListener("mouseup", _mouseUpHandler);
            document.removeEventListener("keydown", _keyDownHandler);
            document.removeEventListener("keyup", _keyUpHandler);
        }
        _touchCanvas = null;
        clearInterval(_pollIntervalId);

        if (e58.vars.control.logEnabled) {
            e58.control.log.write();
        }
    };

    function _removeOldTouches() {
        var upToDateTouches = [];
        _currentTouches.forEach(function (touch, i) {
            if (!touch.endedAtTotalElapsedMs || touch.endedAtTotalElapsedMs == _totalElapsedMs) {
                upToDateTouches.push(touch);
            }
        });
        _currentTouches = upToDateTouches;
    }


    // event handlers and related functions
    function _mouseMoveHandler(event) {
        event.preventDefault();
        var movementX = event.movementX || event.mozMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || 0;
        _mouseMove.x += movementX;
        _mouseMove.y += movementY;
        // console.log("movement x: " + movementX + ", movement y: " + movementY);

        if (s58.isChrome && event.which) {
            // call poll manually - moving mouse with select button down can prevent interval in Chrome
            _pollIfDue();
        }
    }

    function _mouseDownHandler(event) {
        event.preventDefault();
        _setMouseDown(event.button, /*down:*/ true);
    }

    function _mouseUpHandler(event) {
        event.preventDefault();
        _setMouseDown(event.button, /*down:*/ false);
    }

    function _setMouseDown(buttonIndex, down) {
        switch (buttonIndex) {
            case 0 :
                _mousesDown.left = down;
                break;
            case 1 :
                _mousesDown.middle = down;
                break;
            case 2 :
                _mousesDown.right = down;
                break;
            default :
                break;
        }
    }

    function _keyDownHandler(event) {
        if (_keys.keysDown.indexOf(_keyMap[event.keyCode]) < 0) {
            _keys.keysDown.push(_keyMap[event.keyCode]);
        }
        // console.log("key down " + event.keyCode + ", mapped as " + _keyMap[event.keyCode]);
    }

    function _keyUpHandler(event) {
        var keyDownIndex;
        do {
            keyDownIndex = _keys.keysDown.indexOf(_keyMap[event.keyCode]);
            (keyDownIndex >= 0) && _keys.keysDown.splice(keyDownIndex, 1);
        } while (keyDownIndex >= 0);
        // console.log(_keys.keysDown.length + " keys down");
    }

    function _touchStartHandler(event) {
        event.preventDefault();
        _doForEachChangedTouch(event, function (changedTouch) {
            _currentTouches.push(changedTouch);
        });

        // var touchesLog = "";
        // _currentTouches.forEach(function(touch, i) {
            // touchesLog += "[" + touch.identifier + "], (" + touch.pageX + ", " + touch.pageY + ")" + "<br/>";
        // });
        // s58.pageConsoleWrite("" +
            // "touch start: " +
            // "<br/>" + touchesLog +
            // "");
        // s58.pageConsoleWrite("touch start, current touches count: " + _currentTouches.length);
    }

    function _touchEndHandler(event) {
        event.preventDefault();
        // var eventTouchesLog = "";
        _doForEachChangedTouch(event, function (changedTouch) {
            var currentTouchIndex = _getCurrentTouchIndexById(changedTouch.identifier);
            if (currentTouchIndex >= 0) {
                _currentTouches[currentTouchIndex].endedAtTotalElapsedMs = _totalElapsedMs;
            }
            // var touchPropName;
            // var separator = "";
            // eventTouchesLog += "{ ";
            // for (touchPropName in changedTouch) {
                // eventTouchesLog += separator + touchPropName + ": " + changedTouch[touchPropName];
                // separator = ", "
            // }
            // eventTouchesLog += " }" + "<br/>";
        });
        // var touchesLog = "";
        // _currentTouches.forEach(function(touch, i) {
            // touchesLog += "[" + touch.identifier + "], (" + touch.pageX + ", " + touch.pageY + ")" + "<br/>";
        // });
        // s58.pageConsoleWrite("" +
            // "touch end: " +
            // "<br/>" + touchesLog +
            // "<br/>" + eventTouchesLog +
            // "");
        // s58.pageConsoleWrite("touch end, current touches count: " + _currentTouches.length);
    }

    function _touchCancelHandler(event) {
        event.preventDefault();
        _doForEachChangedTouch(event, function (changedTouch) {
            var currentTouchIndex = _getCurrentTouchIndexById(changedTouch.identifier);
            if (currentTouchIndex >= 0) {
                _currentTouches[currentTouchIndex].endedAtTotalElapsedMs = _totalElapsedMs;
            }
        });
        // s58.pageConsoleWrite("touch cancel, current touches count: " + _currentTouches.length);
    }

    function _touchLeaveHandler(event) {
        event.preventDefault();
        _doForEachChangedTouch(event, function (changedTouch) {
            var currentTouchIndex = _getCurrentTouchIndexById(changedTouch.identifier);
            if (currentTouchIndex >= 0) {
                _currentTouches[currentTouchIndex].endedAtTotalElapsedMs = _totalElapsedMs;
            }
        });
        // s58.pageConsoleWrite("touch leave, current touches count: " + _currentTouches.length);
    }

    function _touchMoveHandler(event) {
        event.preventDefault();
        
        var w = _touchCanvas.width;
        var h = _touchCanvas.height;
        
        _doForEachChangedTouch(event, function (changedTouch) {
            var currentTouchIndex = _getCurrentTouchIndexById(changedTouch.identifier);
            
            if (currentTouchIndex < 0) {
                // Touch not found
                return;
            }
            
            // Detect which touch move pad the touch is in, if any
            var pad, padIndex;
            for (padIndex = 0; padIndex < e58.vars.touchMovePads.length; padIndex++) {
                pad = e58.vars.touchMovePads[padIndex];
                if (changedTouch.pageX >= s58.getOrientDimension(pad.xMin * w, pad.yMin * h)
                        && changedTouch.pageX <= s58.getOrientDimension(pad.xMax * w, pad.yMax * h)
                        && changedTouch.pageY >= s58.getOrientDimension(pad.yMin * h, pad.xMin * w)
                        && changedTouch.pageY <= s58.getOrientDimension(pad.yMax * h, pad.xMax * w)) {                    
                    _updateTouchMove(changedTouch, currentTouchIndex, pad);
                }
            }
            
            _currentTouches[currentTouchIndex] = changedTouch;
        });
        // s58.pageConsoleWrite("touch move, current touches count: " + _currentTouches.length);
        
        if (s58.isChrome) {
            // call poll manually - touch move can prevent interval in Chrome
            _pollIfDue();
        }
    }
    
    function _updateTouchMove(changedTouch, currentTouchIndex, touchMovePad) {
        // Handle the move if inside a touch move pad
        if (touchMovePad) {
            var changeX = changedTouch.pageX - _currentTouches[currentTouchIndex].pageX;
            var changeY = changedTouch.pageY - _currentTouches[currentTouchIndex].pageY;
            _touchMove.x += s58.getOrientCoordX(changeX, changeY);
            _touchMove.y += s58.getOrientCoordY(changeY, changeX);
        }
    }

    function _doForEachChangedTouch(event, doFunction) {
        var i;
        for (i = 0; i < event.changedTouches.length; i++) {
            doFunction(event.changedTouches[i]);
        }
    }

    function _getCurrentTouchIndexById(identifier) {
        var i;
        for (i = 0; i < _currentTouches.length; i++) {
            if (_currentTouches[i].identifier == identifier) {
                return i;
            }
        }
        return -1;
    }

    function _motionHandler(event) {
        var motionMs = new Date().valueOf();
        var msSinceLastMotion = motionMs - _lastMotionUtcMs;
        _lastMotionUtcMs = motionMs;

        _rotation.active = true;

        var deltaAlpha = s58.getOrientCoordY(event.rotationRate.alpha, event.rotationRate.beta) * msSinceLastMotion * 0.001;
        var deltaBeta = s58.getOrientCoordX(event.rotationRate.beta, event.rotationRate.alpha) * msSinceLastMotion * 0.001;
        var deltaGamma = event.rotationRate.gamma * msSinceLastMotion * 0.001;

        if (s58.isChrome) {
            deltaAlpha = s58.radToDeg(deltaAlpha);
            deltaBeta = s58.radToDeg(deltaBeta);
            deltaGamma = s58.radToDeg(deltaGamma);
        }

        _rotation.alpha += deltaAlpha;
        _rotation.beta += deltaBeta;
        _rotation.gamma += deltaGamma;
    }

    function _orientationHandler(event) {
        if (event.absolute) {
            var normalisedEvent = _getNormalisedOrientationEvent(event);

            _orientation.active = true;
            _orientation.alpha = normalisedEvent.alpha;
            _orientation.beta = normalisedEvent.beta;
            _orientation.gamma = normalisedEvent.gamma;

            var betaAbs = Math.abs(normalisedEvent.beta);
            var gammaAbs = Math.abs(normalisedEvent.gamma);
            if (false
                    || betaAbs == 0
                    || gammaAbs == 0
                    || (betaAbs % 90 > 30 && betaAbs % 90 < 60)
                    || (gammaAbs > 30 && gammaAbs < 60)) {
                // Ignore beta/gamma when close to 45 or 135 degrees, rely on relative rotatations
                _orientation.roll = null;
                _orientation.pitch = null;
            }
            else {
                _orientation.roll = _getOrientationRoll(normalisedEvent.beta, normalisedEvent.gamma);
                _orientation.pitch = _getOrientationPitch(normalisedEvent.beta, normalisedEvent.gamma);
            }
        }

        if (Math.abs(_orientation.pitch) > 60) {
            // Ignore pitch when above 60 degrees, rely on relative rotations
            _orientation.pitch = null;
        }
    }

    function _getNormalisedOrientationEvent(orientationEvent){
        var normalisedOrientationEvent = {
            absolute: orientationEvent.absolute,
            alpha: orientationEvent.alpha,
            beta: orientationEvent.beta,
            gamma: orientationEvent.gamma,
        };
        var norm = normalisedOrientationEvent;

        if (s58.isChrome) {
            if (Math.abs(norm.beta) > 45 && Math.abs(norm.beta) <= 135) {
                if (Math.abs(norm.gamma) > 45) {
                    norm.gamma = s58.getSign(norm.gamma) * 90 - norm.gamma;
                }
                else {
                    norm.gamma = -norm.gamma;
                    norm.beta = 360 - norm.beta;
                }
            }
            else if (Math.abs(norm.beta) > 135) {
                norm.gamma = -norm.gamma;
            }
        }

        // s58.pageConsoleWrite("" +
            // "orientation: " +
            // "<br/>" + s58.floor(orientationEvent.alpha, 2) +
            // "<br/>" + s58.floor(orientationEvent.beta, 2) +
            // "<br/>" + s58.floor(orientationEvent.gamma, 2) +
            // "<br/>" +
            // "normalised orientation: " +
            // "<br/>" + s58.floor(normalisedOrientationEvent.alpha, 2) +
            // "<br/>" + s58.floor(normalisedOrientationEvent.beta, 2) +
            // "<br/>" + s58.floor(normalisedOrientationEvent.gamma, 2) +
            // "");

        return normalisedOrientationEvent;
    }

    function _getOrientationPitch(beta, gamma) {
        var betaAbs = Math.abs(beta);
        var gammaAbs = Math.abs(gamma);
        if (betaAbs == 0
                || gammaAbs == 0
                || (betaAbs % 90 > 30 && betaAbs % 90 < 60)
                || (gammaAbs > 30 && gammaAbs < 60)) {
            return null;
        }

        switch (s58.vars.orient) {
            case 90:
                var rawAngle = _getHorizontalOrientationPitchRaw(beta, gamma);
                return rawAngle == null ?
                    null :
                    (900 + rawAngle) % 360 - 180;
            case 180:
                var rawAngle = _getVerticalOrientationPitchRaw(beta, gamma);
                return rawAngle == null ?
                    null :
                    (720 - rawAngle) % 360 - 180;
            case 270:
                var rawAngle = _getHorizontalOrientationPitchRaw(beta, gamma);
                return rawAngle == null ?
                    null :
                    (720 - rawAngle) % 360 - 180;
            default:
                var rawAngle = _getVerticalOrientationPitchRaw(beta, gamma);
                return rawAngle == null ?
                    null :
                    (900 + rawAngle) % 360 - 180;
        }
    }

    function _getVerticalOrientationPitchRaw(beta, gamma) {
        if (Math.abs(gamma) > 60) {
            return null;
        }

        var deviceFrame = e58.frame.getNew([0, 0, 0], 0, 0, 0);
        deviceFrame.rotateInUniverseX(beta);
        deviceFrame.rotateInUniverseY(gamma);
        deviceFrame.rotateInUniverseZ(s58.radToDeg(s58.radPiToPi(Math.atan2(deviceFrame.xAxis.y, deviceFrame.xAxis.x))));
        deviceFrame.rotateInUniverseY(s58.radToDeg(s58.radPiToPi(Math.atan2(deviceFrame.xAxis.z, deviceFrame.xAxis.x))));

        return s58.radToDeg(s58.radPiToPi(Math.atan2(deviceFrame.yAxis.z, deviceFrame.yAxis.y))) - 90;
    }

    function _getHorizontalOrientationPitchRaw(beta, gamma) {
        if (Math.abs(beta) > 60 && Math.abs(beta) < 120) {
            return null;
        }

        var deviceFrame = e58.frame.getNew();

        var flip = false;
        if (beta <= 0 && beta >= -45) {
            flip = true;
            gamma = -180 - gamma;
        }
        else if (beta <= 180 && beta >= 135) {
            flip = true;
            gamma = 180 - gamma;
        }

        deviceFrame.rotateInUniverseX(beta);
        deviceFrame.rotateInUniverseY(gamma);
        deviceFrame.rotateInUniverseY(s58.radToDeg(s58.radPiToPi(Math.atan2(deviceFrame.yAxis.x, deviceFrame.yAxis.y))));
        deviceFrame.rotateInUniverseX(s58.radToDeg(s58.radPiToPi(Math.atan2(deviceFrame.yAxis.y, deviceFrame.yAxis.x))));

        return -180 + (flip ? -1 : 1) * s58.radToDeg(Math.atan2(deviceFrame.xAxis.x, deviceFrame.xAxis.y));
    }

    function _getOrientationRoll(beta, gamma) {
        var rollRaw = _getOrientationRollRaw(beta, gamma);
        return rollRaw == null ?
            null :
            (rollRaw + s58.vars.orient + 360 + 180) % 360 - 180;
    }

    function _getOrientationRollRaw(beta, gamma) {
        var adjustedBeta = beta;
        if ((gamma >= 0 && beta >= 90 && beta < 180) || (gamma < 0 && beta >= 0 && beta < 90)) {
            adjustedBeta = 180 - beta;
        }
        else if ((gamma >= 0 && beta >= -180 && beta <= -90) || (gamma < 0 && beta >= -90 && beta < 0)) {
            adjustedBeta = -180 - beta;
        }
        adjustedBeta = (720 + 90 - adjustedBeta) % 360;

        var adjustedGamma = beta >= 0 ? gamma : 180 * s58.getSign(gamma) - gamma;
        adjustedGamma = (720 + adjustedGamma) % 360;

        var betaAbs = Math.abs(beta);
        var gammaAbs = Math.abs(gamma);
        var gammaAbs0to90 = (gammaAbs <= 90) ? gammaAbs : 180 - gammaAbs;
        if (betaAbs <= e58.vars.control.rollOrientationLimits.low && gammaAbs0to90 >= e58.vars.control.rollOrientationLimits.high) {
            return adjustedBeta;
        }
        else if (gammaAbs0to90 <= e58.vars.control.rollOrientationLimits.low && betaAbs >= e58.vars.control.rollOrientationLimits.high) {
            return adjustedGamma;
        }
        else if (Math.abs(adjustedBeta - adjustedGamma) < e58.vars.control.rollOrientationLimits.difference) {
            return 0.5 * (adjustedBeta + adjustedGamma);
        }
        else if (Math.abs(adjustedBeta - adjustedGamma) > 360 - e58.vars.control.rollOrientationLimits.difference) {
            return 0.5 * ((adjustedBeta + adjustedGamma + 360) % 360);
        }
        return null;
    }
})();
