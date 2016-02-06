// camera
// Camera control and management

"use strict";

window.g58 = window.g58 || {};

g58.camera = {};

g58.camera.positions = {
    back: 0,
    backVertical: 1,
    top: 2,
    topCompass: 3
};

g58.camera.getDefaultAdjust = function () {
    return { active: false, x: 0, y: 0, z: 0, pitch: 0, roll: 0, yaw: 0 };
};

g58.camera.setDefaults = function () {
    var game = g58.game;
    game.camera.ship = g58.game.playerShip;
    g58.game.playerShip.isCameraShip = true;
    game.camera.followShip = true;
    game.camera.position = g58.camera.positions.back;
    game.camera.adjust = g58.camera.getDefaultAdjust();
    
    game.camera.pitch = game.camera.roll = game.camera.yaw = game.camera.acc = 0;
    
    game.camera.pitchBuffer = e58.buffer.getNew(
        g58.vars.cameraPitchBuffer.limit,
        g58.vars.cameraPitchBuffer.constant);
    game.camera.rollBuffer = e58.buffer.getNew(
        g58.vars.cameraRollBuffer.limit,
        g58.vars.cameraRollBuffer.constant);
    game.camera.yawBuffer = e58.buffer.getNew(
        g58.vars.cameraYawBuffer.limit,
        g58.vars.cameraYawBuffer.constant);
    game.camera.accBuffer = e58.buffer.getNew(
        g58.vars.cameraAccBuffer.limit,
        g58.vars.cameraAccBuffer.constant);
};

g58.camera.handleControls = function (controlParams) {
    var game = g58.game;
    
    if (!g58.vars.enableCameraControl) {
        return;
    }
    
    var numberDown = controlParams.keys.numberDown();
    if (numberDown == 0) {
        game.ships.forEach(function (ship, i) { ship.isCameraShip = false; });
        game.camera.ship = game.playerShip;
        game.playerShip.isCameraShip = true;
        game.camera.followShip = true;
    }
    else if (numberDown && numberDown <= game.cpuShips.length) {
        game.ships.forEach(function (ship, i) { ship.isCameraShip = false; });
        game.camera.ship = game.cpuShips[numberDown - 1];
        game.cpuShips[numberDown - 1].isCameraShip = true;
        game.camera.followShip = true;
    }
    else if (controlParams.keys.anyDown(".`#")) {
        game.ships.forEach(function (ship, i) { ship.isCameraShip = false; });
        game.camera.followShip = false;
    }
    
    if (controlParams.keys.isDown("j")) {
        game.camera.position = g58.camera.positions.back;
        game.camera.adjust = g58.camera.getDefaultAdjust();
        game.camera.followShip = true;
    }
    else if (controlParams.keys.isDown("u")) {
        game.camera.position = g58.camera.positions.backVertical;
        game.camera.adjust = g58.camera.getDefaultAdjust();
        game.camera.followShip = true;
    }
    else if (controlParams.keys.isDown("k")) {
        game.camera.position = g58.camera.positions.top;
        game.camera.adjust = g58.camera.getDefaultAdjust();
        game.camera.followShip = true;
    }
    else if (controlParams.keys.isDown("i")) {
        game.camera.position = g58.camera.positions.topCompass;
        game.camera.adjust = g58.camera.getDefaultAdjust();
        game.camera.followShip = true;
    }
    
    if (controlParams.keys.isDown("+")) {
        game.camera.adjust.active = true;
        game.camera.adjust.z -= g58.vars.cameraAdjustRates.fastZ * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("-")) {
        game.camera.adjust.active = true;
        game.camera.adjust.z += g58.vars.cameraAdjustRates.fastZ * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("w")) {
        game.camera.adjust.active = true;
        game.camera.adjust.z -= g58.vars.cameraAdjustRates.z * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("s")) {
        game.camera.adjust.active = true;
        game.camera.adjust.z += g58.vars.cameraAdjustRates.z * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("a")) {
        game.camera.adjust.active = true;
        game.camera.adjust.x -= g58.vars.cameraAdjustRates.x * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("d")) {
        game.camera.adjust.active = true;
        game.camera.adjust.x += g58.vars.cameraAdjustRates.x * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("e")) {
        game.camera.adjust.active = true;
        game.camera.adjust.y += g58.vars.cameraAdjustRates.y * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("q")) {
        game.camera.adjust.active = true;
        game.camera.adjust.y -= g58.vars.cameraAdjustRates.y * controlParams.msSinceLastLogic;
    }
    
    if (controlParams.keys.isDown("t")) {
        game.camera.adjust.active = true;
        game.camera.adjust.pitch -= g58.vars.cameraAdjustRates.pitch * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("g")) {
        game.camera.adjust.active = true;
        game.camera.adjust.pitch += g58.vars.cameraAdjustRates.pitch * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("f")) {
        game.camera.adjust.active = true;
        game.camera.adjust.yaw -= g58.vars.cameraAdjustRates.yaw * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("h")) {
        game.camera.adjust.active = true;
        game.camera.adjust.yaw += g58.vars.cameraAdjustRates.yaw * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("y")) {
        game.camera.adjust.active = true;
        game.camera.adjust.roll += g58.vars.cameraAdjustRates.roll * controlParams.msSinceLastLogic;
    }
    if (controlParams.keys.isDown("r")) {
        game.camera.adjust.active = true;
        game.camera.adjust.roll -= g58.vars.cameraAdjustRates.roll * controlParams.msSinceLastLogic;
    }
};

g58.camera.applyBuffers = function (controlParams) {
    var camera = g58.game.camera;
    
    if (camera.followShip) {
        if (camera.ship.logic.acc < 0) {
            camera.accBuffer.apply(camera.ship.logic.acc, function (appliedDelta) {
                camera.acc += appliedDelta;
            });
        }
        camera.pitchBuffer.apply(camera.ship.logic.pitch, function (appliedDelta) {
            camera.pitch += appliedDelta;
        });
        camera.rollBuffer.apply(camera.ship.logic.roll, function (appliedDelta) {
            camera.roll += appliedDelta;
        });
        camera.yawBuffer.apply(camera.ship.logic.yaw, function (appliedDelta) {
            camera.yaw += appliedDelta;
        });
    }
    
    camera.pitch *= Math.pow(g58.vars.cameraPitchDecay, controlParams.msSinceLastLogic);
    camera.roll *= Math.pow(g58.vars.cameraRollDecay, controlParams.msSinceLastLogic);
    camera.yaw *= Math.pow(g58.vars.cameraYawDecay, controlParams.msSinceLastLogic);
    camera.acc *= Math.pow(g58.vars.cameraAccDecay, controlParams.msSinceLastLogic);
    
    (camera.pitch >= -g58.vars.cameraPitchMax) || (camera.pitch = -g58.vars.cameraPitchMax);
    (camera.pitch <= g58.vars.cameraPitchMax) || (camera.pitch = g58.vars.cameraPitchMax);
    (camera.yaw >= -g58.vars.cameraYawMax) || (camera.yaw = -g58.vars.cameraYawMax);
    (camera.yaw <= g58.vars.cameraYawMax) || (camera.yaw = g58.vars.cameraYawMax);
    (camera.acc >= -g58.vars.cameraAccMax) || (camera.acc = -g58.vars.cameraAccMax);
};
