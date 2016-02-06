// control
// Control features

"use strict";

window.g58 = window.g58 || {};

g58.control = {};

g58.control.setUpStartHandlers = function () {
    var game = g58.game;
    
    game.canvas.requestPointerLockOnClick(
        /*lockedHandler:*/ g58.control.start,
        /*unlockedHandler:*/ g58.control.stop);
    
    game.canvas.startOnTouch(
        /*startHandler:*/ g58.control.touchStart,
        /* touchStopControlHandler: */ g58.control.stop);
};

g58.control.touchStart = function (event) {
    g58.control.start(event, g58.game.canvas)
};

g58.control.start = function (event, touchCanvas) {
    var game = g58.game;
    
    if (g58.vars.enableMotionControl
            && s58.deviceOrientationDetected
            && s58.deviceMotionDetected
            && !s58.getScreenOrientation().portraitPrimary) {
        alert("Please disable the auto-rotate screen setting on your device, or turn off motion control");
    }
    
    game.started = true;
    game.paused = false;
    game.camera.zoom = game.canvas.getStandardZoom();
    e58.control.start(
        g58.logic.updateLogic,
        g58.rendering.render,
        touchCanvas);
    e58.control.queueSound(e58.audio.sounds.wind, { loop: true, gain: g58.vars.sounds.wind.gain });
};

g58.control.stop = function (event) {
    var game = g58.game;
    game.paused = true;
    e58.control.stopAllSounds();
    e58.control.stop();
    game.camera.zoom = game.canvas.getStandardZoom();
    g58.rendering.render();
};

g58.control.setUpControlProps = function () {
    var game = g58.game;
    
    game.controlProps = {
        movePitchBuffer:  e58.buffer.getNew(
            g58.vars.movePitchBuffer.limit,
            g58.vars.movePitchBuffer.constant),
        moveRollBuffer:  e58.buffer.getNew(
            g58.vars.moveRollBuffer.limit,
            g58.vars.moveRollBuffer.constant),
        keyMovePitchBuffer:  e58.buffer.getNew(
            g58.vars.keyMovePitchBuffer.limit,
            g58.vars.keyMovePitchBuffer.constant),
        keyMoveRollBuffer:  e58.buffer.getNew(
            g58.vars.keyMoveRollBuffer.limit,
            g58.vars.keyMoveRollBuffer.constant),
        derivedPitchBuffer: e58.buffer.getNew(
            g58.vars.derivedPitchBuffer.limit,
            g58.vars.derivedPitchBuffer.constant),
        derivedRollBuffer: e58.buffer.getNew(
            g58.vars.derivedPitchBuffer.limit,
            g58.vars.derivedPitchBuffer.constant),
        lastDerivedPitch: null,
        derivedPitchZero: null,
        pitchControlZero: null,
        showPitchHud: e58.toggle.getNew(false)
    }
    
    game.controlShip = game.playerShip;
    game.controlShip.isControlShip = true;
};

g58.control.getDerivedPitchDelta = function (controlParams) {
    var game = g58.game;    
    var derivedPitchDelta = game.controlProps.lastDerivedPitch - game.controlProps.derivedPitchZero; 
    var pitchDelta = g58.vars.pitchDeltaConstants.continuous * controlParams.msSinceLastLogic * derivedPitchDelta;
        
    return (Math.abs(pitchDelta) > g58.vars.maxPitchDelta * controlParams.msSinceLastLogic) ?
        s58.getSign(pitchDelta) * g58.vars.maxPitchDelta * controlParams.msSinceLastLogic :
        pitchDelta;
};

g58.control.getDerivedRollDelta = function (controlParams, uprights) {    
    var rollDeltaAbsoluteRaw = uprights.rollDeg - controlParams.derivedOrientation.roll;
    var rollDeltaAbsoluteNormalised = g58.vars.rollDeltaConstant * controlParams.msSinceLastLogic * ((rollDeltaAbsoluteRaw + 720 + 180) % 360 - 180);
        
    var rollDeltaAbsolute = rollDeltaAbsoluteNormalised;
    
    var rollDeltaContinuous = -g58.vars.rollDeltaContinuousConstant * controlParams.msSinceLastLogic * controlParams.derivedOrientation.roll;
    
    var rollDelta;    
    var absYVertDeg = Math.abs(uprights.yVertDeg);
    if (absYVertDeg < g58.vars.derivedRollLimits.absolute) {
        rollDelta = rollDeltaAbsolute;
    }
    else if (absYVertDeg > g58.vars.derivedRollLimits.continuous) {
        rollDelta = rollDeltaContinuous;
    }
    else {
        var relativeDeg = absYVertDeg - g58.vars.derivedRollLimits.absolute;
        var rangeDeg = g58.vars.derivedRollLimits.continuous - g58.vars.derivedRollLimits.absolute;
        var cosFactor = Math.cos(s58.HALFPI * relativeDeg / rangeDeg);
        var cosSquaredFactor = cosFactor * cosFactor;
        var sinSquaredFactor = 1 - cosSquaredFactor;
        rollDelta = rollDeltaAbsolute * cosSquaredFactor + rollDeltaContinuous * sinSquaredFactor;
    }
    
    return (Math.abs(rollDelta) > g58.vars.maxRollDelta * controlParams.msSinceLastLogic) ?
        s58.getSign(rollDelta) * g58.vars.maxRollDelta * controlParams.msSinceLastLogic :
        rollDelta;
};

g58.control.handleControls = function (controlParams) {
    var game = g58.game;
    
    var touchParts = { topLeft: false, topMid: false, topRight: false, bottomLeft: false, bottomMid: false, bottomRight: false };
    controlParams.touches.forEach(function (touch, i) {
        var isLeft = s58.getOrientCoordX(touch.clientX, touch.clientY)
                        < 0.375 * s58.getOrientCoordX(game.canvas.width, game.canvas.height);
        var isRight = s58.getOrientCoordX(touch.clientX, touch.clientY)
                        > 0.625 * s58.getOrientCoordX(game.canvas.width, game.canvas.height);
        var isTop = s58.getOrientCoordY(touch.clientY, touch.clientX)
                        < 0.5 * s58.getOrientCoordY(game.canvas.height, game.canvas.width);
        touchParts.topLeft = touchParts.topLeft || (isLeft && isTop);
        touchParts.topMid = touchParts.topMid || (!isLeft && !isRight && isTop);
        touchParts.topRight = touchParts.topRight || (isRight && isTop);
        touchParts.bottomLeft = touchParts.bottomLeft || (isLeft && !isTop);
        touchParts.bottomMid = touchParts.bottomMid || (!isLeft && !isRight && !isTop);
        touchParts.bottomRight = touchParts.bottomRight || (isRight && !isTop);
    });    
    touchParts.top = touchParts.topLeft || touchParts.topRight;
    touchParts.bottom = touchParts.bottomLeft || touchParts.bottomRight;
    touchParts.left = touchParts.topLeft || touchParts.bottomLeft;
    touchParts.mid = touchParts.topMid || touchParts.bottomMid;
    touchParts.right = touchParts.topRight || touchParts.bottomRight;
    // s58.pageConsoleWrite(
        // touchParts.top + ", " + touchParts.bottom + "<br/>" + touchParts.left + ", " + touchParts.right + "<br/>"
        // + touchParts.topLeft + ", " + touchParts.topRight + "<br/>" + touchParts.bottomLeft + ", " + touchParts.bottomRight);
        
    g58.camera.handleControls(controlParams);
    
    if (controlParams.keys.isDown(" ")
            || controlParams.mousesDown.left
            || controlParams.mousesDown.right
            || touchParts.right) {
        game.controlShip.logic.acc -= g58.vars.velocityIncreaseRate * controlParams.msSinceLastLogic;        
        e58.control.queueSound(e58.audio.sounds.engine, { loop: true, gain: g58.vars.sounds.wind.jet });
    }
    else {
        e58.control.stopSound(e58.audio.sounds.engine.name);
    }
    
    if (controlParams.keys.isDown("z")) {
        game.controlProps.showPitchHud.toggle();
    }
    
    var uprights = game.controlShip.frame.getUprightAngles();

    if (g58.vars.enableMotionControl && controlParams.derivedOrientation.active && controlParams.derivedOrientation.pitch != null) {
        game.controlProps.lastDerivedPitch = controlParams.derivedOrientation.pitch;
    }
    if (game.controlProps.derivedPitchZero == null && game.controlProps.lastDerivedPitch != null) {
        game.controlProps.derivedPitchZero = game.controlProps.lastDerivedPitch;
    }
    if (game.controlProps.controlPitchZero == null) {
        game.controlProps.controlPitchZero = uprights.zFlatDeg;
    }
        
    var pitchConstant;
    if (g58.vars.enableMotionControl && touchParts.left) {
        game.controlProps.pitchControl = true;
        pitchConstant = g58.vars.pitchDeltaConstants.withControl;
        game.controlProps.targetPitch =
            game.controlProps.lastDerivedPitch
            - game.controlProps.derivedPitchZero
            + game.controlProps.controlPitchZero;
    }
    else {
        game.controlProps.pitchControl = false;
        pitchConstant = g58.vars.pitchDeltaConstants.toZero;
        game.controlProps.targetPitch = 0;
        game.controlProps.controlPitchZero = uprights.zFlatDeg;
        if (game.controlProps.lastDerivedPitch != null) {
            game.controlProps.derivedPitchZero = game.controlProps.lastDerivedPitch;
        }
    }
    
    if (g58.vars.enableMotionControl && controlParams.derivedOrientation.active) {        
        if (controlParams.derivedOrientation.pitch != null && game.controlProps.pitchControl) {
            game.controlProps.derivedPitchDelta = g58.control.getDerivedPitchDelta(controlParams);

            game.controlProps.derivedPitchBuffer.apply(game.controlProps.derivedPitchDelta, function (appliedDelta) {
                game.controlShip.logic.pitch += appliedDelta;
            });
        }
        
        if (controlParams.derivedOrientation.roll != null) {
            var rollDelta = g58.control.getDerivedRollDelta(controlParams, uprights);
            
            game.controlProps.derivedRollBuffer.apply(rollDelta, function (appliedDelta) {
                game.controlShip.frame.rotateInOwnFrameZ(appliedDelta);
                game.controlShip.logic.roll += appliedDelta;
            });
        }
    }
    
    // s58.pageConsoleWrite(""
        // + "<br/>" + " "
        // + "");
    
    if (!g58.vars.enableMotionControl || !controlParams.derivedOrientation.active) {
        var moveConstants = controlParams.touchMove.x || controlParams.touchMove.y ?
            g58.vars.touchMoveConstants :
            g58.vars.mouseMoveConstants;
        
        game.controlProps.moveRollBuffer.apply(controlParams.move.x, function (appliedDelta) {
            game.controlShip.logic.roll += -appliedDelta * moveConstants.roll;
        });
        game.controlProps.movePitchBuffer.apply(controlParams.move.y, function (appliedDelta) {
            game.controlShip.logic.pitch += appliedDelta * moveConstants.pitch;
        });
    }
    
    if (controlParams.keys.isDown("up")) {
        game.controlProps.keyMovePitchBuffer.apply(-controlParams.msSinceLastLogic, function (appliedDelta) {
            game.controlShip.logic.pitch += appliedDelta * g58.vars.keyMoveConstants.pitch;
        });
    }
    if (controlParams.keys.isDown("down")) {
        game.controlProps.keyMovePitchBuffer.apply(+controlParams.msSinceLastLogic, function (appliedDelta) {
            game.controlShip.logic.pitch += appliedDelta * g58.vars.keyMoveConstants.pitch;
        });
    }
    if (controlParams.keys.isDown("left")) {
        game.controlProps.keyMoveRollBuffer.apply(-controlParams.msSinceLastLogic, function (appliedDelta) {
            game.controlShip.logic.roll += -appliedDelta * g58.vars.keyMoveConstants.roll;
        });
    }
    if (controlParams.keys.isDown("right")) {
        game.controlProps.keyMoveRollBuffer.apply(+controlParams.msSinceLastLogic, function (appliedDelta) {
            game.controlShip.logic.roll += -appliedDelta * g58.vars.keyMoveConstants.roll;
        });
    }
    
    if (controlParams.msSinceLastResumed > g58.vars.enablePauseDelayMs && touchParts.mid) {
        game.canvas.touchStopControl();
    }
};
