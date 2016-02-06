// ship
// Ship/aeroplane features

"use strict";

window.g58 = window.g58 || {};

g58.ship = {};

g58.ship.updateJet = function (ship, delta) {
    // ship.jet range 0 to 1
    ship.jet = ship.jet || 0;
    ship.jet += delta;
    (ship.jet >= 0) || (ship.jet = 0);
    (ship.jet <= 1) || (ship.jet = 1);
};

g58.ship.updateAllJets = function () {
    g58.game.ships.forEach(function (ship, i) {
        g58.ship.updateJet(
            ship,
            -ship.logic.acc * g58.vars.jetColourRateConstant);
    });
};

g58.ship.updateAllJetColours = function () {
    g58.game.ships.forEach(function (ship, i) {
        ship.jet = ship.jet || 0;
        ship.jetPolygon.fillColour = s58.rgbBlend(
            g58.colours.jet.minRgb,
            g58.colours.jet.maxRgb,
            ship.jet);
    });
};

g58.ship.addShipPolygons = function (ship, bodyRgb, lineColour) {
    var i;
    
    var shades = [];
    for (i = 0; i < 3; i++) {
        shades[i] = s58.rgbDarken(bodyRgb, g58.colours.shipShades[i]);
    }
    
    var xSign, ySign;
    var L = g58.sizes.ship.length;
    var BW = g58.sizes.ship.backWidth;
    var BTH = g58.sizes.ship.backTopHeight;
    var BBH = g58.sizes.ship.backBottomHeight;
    var SH = g58.sizes.ship.sideHeight;
    var WH = g58.sizes.ship.wingHeight;
    var WBZ = g58.sizes.ship.wingBack;
    var WFZ = g58.sizes.ship.wingFront;
    var WTZ = g58.sizes.ship.wingTip;
    var WW = g58.sizes.ship.wingWidth;
    var TL = g58.sizes.ship.tailLength;
    var TW = g58.sizes.ship.tailWidth;
    var TBH = g58.sizes.ship.tailBackHeight;
    var JTH = g58.sizes.ship.jetTopHeight;
    var JBH = g58.sizes.ship.jetBottomHeight;
    var JSTH = g58.sizes.ship.jetSideTopHeight;
    var JSBH = g58.sizes.ship.jetSideBottomHeight;
    var JW = g58.sizes.ship.jetWidth;
    var JZ = g58.sizes.ship.jetOffset;
    
    var WBW = BW * (1 - WBZ / L); // wing back x join to body
    var WFW = BW * (1 - WFZ / L); // wing front x join to body
    var TBBH = SH + (BTH - SH) * (1 - TW / BW); // tail back y join to body
    var TFH = BTH * (1 - TL / L); // tail front y join to body
    
    var OX = 0; // x origin
    var OY = (BBH - BTH) / 2; // y origin
    var OZ = -L / 2; // z origin
            
    for (xSign = 1; xSign >= -1; xSign -= 2) {
        for (ySign = 1; ySign >= -1; ySign -= 2) {
            // Wing top/bottom
            ship.addPolygon("anon", lineColour, shades[0],
                [[OX+xSign*(WBW), OY+ySign*(WH), -OZ-(WBZ)], [OX+xSign*(WW), OY+ySign*(0), -OZ-(WTZ)], [OX+xSign*(WFW), OY+ySign*(0), -OZ-(WFZ)]]);
        }
        // Main body top
        ship.addPolygon("anon", lineColour, shades[1],
            [[OX+xSign*(0), OY+(BTH), -OZ-(0)], [OX+xSign*(BW), OY+(SH), -OZ-(0)], [OX+xSign*(0), OY+(0), -OZ-(L)]]);
        // Main body bottom
        ship.addPolygon("anon", lineColour, shades[1],
            [[OX+xSign*(0), OY+(-BBH), -OZ-(0)], [OX+xSign*(BW), OY+(SH), -OZ-(0)], [OX+xSign*(0), OY+(0), -OZ-(L)]]);
        // Main body side
        ship.addPolygon("anon", lineColour, shades[1],
            [[OX+xSign*(BW), OY+(SH), -OZ-(0)], [OX+xSign*(BW), OY+(-SH), -OZ-(0)], [OX+xSign*(0), OY+(0), -OZ-(L)]]);
        // Wing back - omitted to due draw order problems
        // ship.addPolygon("anon", lineColour, shades[0],
            // [[OX+xSign*(WBW), OY+(WH), -OZ-(WBZ)], [OX+xSign*(WW), OY+(0), -OZ-(WTZ)], [OX+xSign*(WBW), OY+(-WH), -OZ-(WBZ)]]);
        // Tail side
        ship.addPolygon("anon", lineColour, shades[0],
            [[OX+xSign*(0), OY+(TBH), -OZ-(0)], [OX+xSign*(TW), OY+(TBBH), -OZ-(0)], [OX+xSign*(0), OY+(TFH), -OZ-(TL)]]);
    }
    
    // Main body back
    ship.addPolygon("anon", lineColour, shades[2],
        [[OX+(0), OY+(BTH), -OZ-(0)], [OX+(BW), OY+(SH), -OZ-(0)], [OX+(BW), OY+(-SH), -OZ-(0)],
         [OX+(0), OY+(-BBH), -OZ-(0)], [OX+(-BW), OY+(-SH), -OZ-(0)], [OX+(-BW), OY+(SH), -OZ-(0)]]);
    // Tail back
    ship.addPolygon("anon", lineColour, shades[1],
        [[OX+(0), OY+(TBH), -OZ-(0)], [OX+(TW), OY+(TBBH), -OZ-(0)], [OX+(0), OY+(BTH), -OZ-(0)], [OX+(-TW), OY+(TBBH), -OZ-(0)]]);
    // Jet
    ship.jetPolygon = ship.addPolygon("jet", lineColour, s58.rgba(0),
        [[OX+(0), OY+(JTH), -OZ-(JZ)], [OX+(JW), OY+(JSTH), -OZ-(JZ)], [OX+(JW), OY+(-JSBH), -OZ-(JZ)],
         [OX+(0), OY+(-JBH), -OZ-(JZ)], [OX+(-JW), OY+(-JSBH), -OZ-(JZ)], [OX+(-JW), OY+(JSTH), -OZ-(JZ)]]);
          
     return ship;
};

g58.ship.addPlayerShip = function () {
    var game = g58.game;
    game.ships = game.ships || [];
    game.playerShip = game.universe.addBlock();
    game.ships.push(game.playerShip);
    game.playerShip.velocityInOwnFrame = e58.point.getNewXYZ(0, 0, g58.vars.minVelocity);
    game.playerShip.isPlayerShip = true;
    g58.ship.addShipPolygons(game.playerShip, g58.colours.playerShip.bodyRgb, g58.colours.playerShip.line);
    g58.ship.updateAllJetColours();
    game.playerShip.yawBuffer = e58.buffer.getNew(
        g58.vars.yawBuffer.limit,
        g58.vars.yawBuffer.constant);
        game.playerShip.autopilotRollBuffer = e58.buffer.getNew(
            g58.vars.autopilot.rollBuffer.limit,
            g58.vars.autopilot.rollBuffer.constant);
        game.playerShip.autopilotPitchBuffer = e58.buffer.getNew(
            g58.vars.autopilot.pitchBuffer.limit,
            g58.vars.autopilot.pitchBuffer.constant);
    game.playerShip.autopilotNerve = g58.vars.autopilot.nerve.player;
};

g58.ship.addCpuShips = function () {
    var game = g58.game;
    var i;
    game.cpuShips = [];
    game.ships = game.ships || [];
    for (i = 0; i < g58.vars.cpuShipsN; i++) {
        game.cpuShips[i] = game.universe.addBlock();
        game.ships.push(game.cpuShips[i]);
        game.cpuShips[i].velocityInOwnFrame = e58.point.getNewXYZ(0, 0, g58.vars.minVelocity);
        game.cpuShips[i].isCpuShip = true;
        g58.ship.addShipPolygons(
            game.cpuShips[i],
            g58.colours.cpuShips[i % g58.colours.cpuShips.length].bodyRgb,
            g58.colours.cpuShips[i % g58.colours.cpuShips.length].line);
        game.cpuShips[i].yawBuffer = e58.buffer.getNew(
            g58.vars.yawBuffer.limit,
            g58.vars.yawBuffer.constant);
        game.cpuShips[i].autopilotRollBuffer = e58.buffer.getNew(
            g58.vars.autopilot.rollBuffer.limit,
            g58.vars.autopilot.rollBuffer.constant);
        game.cpuShips[i].autopilotPitchBuffer = e58.buffer.getNew(
            g58.vars.autopilot.pitchBuffer.limit,
            g58.vars.autopilot.pitchBuffer.constant);
        game.cpuShips[i].autopilotNerve =
            g58.vars.autopilot.nerve.min
            + (g58.vars.autopilot.nerve.max - g58.vars.autopilot.nerve.min) * i / g58.vars.cpuShipsN;
    }
    g58.ship.updateAllJetColours();
};

g58.ship.setStartingGrid = function () {
    var game = g58.game;
    game.startingGridShips = [];
    var playerShipDone = false;
    var ship;
    var i = 0;
    while (!game.ships.every( function (s) { return s.gridDone; } )) {
        ship = game.ships[Math.floor(Math.random(new Date().valueOf()) * game.ships.length)];
        if (!ship.gridDone) {
            game.startingGridShips.push(ship);
            ship.frame.origin = e58.point.getNewXYZ(
                g58.vars.shipStartSpacing * (i - 0.5 * game.ships.length),
                g58.vars.shipStartSpacing * (i - 0.5 * game.ships.length),
                g58.vars.shipStartSpacing * i);
            ship.gridDone = true;
            i++;
        }
    }
};

g58.ship.initialiseAllFlagIndexes = function () {
    g58.game.ships.forEach(function (ship, i) {
        ship.iFlagNext = 0;
        ship.iFlagPrevious = g58.game.flags.length - 1;
        ship.flagsHit = 0;
        ship.iLap = 0;
    });
};

g58.ship.updateFlagIndexes = function (ship) {
    var game = g58.game;
    
    ship.flagsHit++;
    ship.iFlagPreviousPrevious = ship.iFlagPrevious;
    ship.iFlagPrevious = ship.iFlagNext;
    ship.iFlagNext = (ship.iFlagNext + 1) % game.flags.length;
    
    if (ship.iLap == 0
            || (game.flagMap.endFlag && ship.iFlagNext == 0)
            || (!game.flagMap.endFlag && ship.iFlagPrevious == 0)) {
        ship.iLap++;
    }
    
    if (ship.isPlayerShip && !ship.raceIsFinished && ship.iLap > game.flagMap.lapsN) {
        ship.raceIsFinished = true;
        ship.finishPlace = g58.ship.getPlace(ship);
        ship.finishMs = game.totalElapsedMs;
    }
};

g58.ship.getPlace = function (ship) {
    return g58.game.ships.filter(function (s) {
        return s.iLap > ship.iLap || (s.iLap == ship.iLap && s.iFlagNext > ship.iFlagNext);
    }).length + 1;
};

g58.ship.updateAllYaws = function (controlParams) {
    g58.game.ships.forEach(function (ship, i) {        
        var uprights = ship.frame.getUprightAngles();
        var adjustedRollDeg = Math.abs(uprights.xFlatDeg) <= 90 ?
            uprights.xFlatDeg :
            -s58.getSign(uprights.xFlatDeg) * (Math.abs(uprights.xFlatDeg) - 180);
        var yawFactor = Math.cos(s58.degToRad(uprights.zFlatDeg));
        yawFactor *= yawFactor;
        yawFactor *= g58.vars.yawConstant / Math.pow(-ship.velocityInOwnFrame.z, g58.vars.yawVelocityPower);
        ship.logic.yawDelta = -yawFactor * adjustedRollDeg;
        ship.yawBuffer.apply(ship.logic.yawDelta, function (appliedDelta) {
            ship.logic.yaw += appliedDelta * controlParams.msSinceLastLogic * 0.001;
        });
        // console.log(uprights);
        // console.log(adjustedRollDeg);
        // console.log(yawFactor);
        // console.log(ship.logic.yawDelta);
    });
    
};

g58.ship.updateAllVelocities = function (controlParams) {
    g58.game.ships.forEach(function (ship, i) {
        ship.velocityInOwnFrame.z += ship.logic.acc;
        (ship.velocityInOwnFrame.z > g58.vars.minVelocity) && (ship.velocityInOwnFrame.z = g58.vars.minVelocity);
        (ship.velocityInOwnFrame.z < g58.vars.maxVelocity) && (ship.velocityInOwnFrame.z = g58.vars.maxVelocity);
    });
};

g58.ship.updateAllOrientations = function (controlParams) {
    var game = g58.game;
    
    game.ships.forEach(function (ship, i) {
        var origin = ship.frame.origin.clone();
        ship.frame.translateInUniverse(-origin.x, -origin.y, -origin.z);
        ship.frame.rotateInOwnFrameZ(ship.logic.roll);
        ship.frame.rotateInOwnFrameX(ship.logic.pitch);
        ship.frame.rotateInUniverseY(ship.logic.yaw);
        ship.frame.translateInUniverse(origin.x, origin.y, origin.z);
    });
};

g58.ship.autopilotAllCpuShips = function (controlParams) {
    g58.game.cpuShips.forEach(function (ship, i) {
        g58.ship.autopilot(ship, controlParams);
    });
};

g58.ship.autopilot = function (ship, controlParams) {
    var game = g58.game;
    
    var flag = game.flags[ship.iFlagNext];
    var autoParams = g58.ship.getAutopilotParams(ship);
    
    var aimFactor = g58.vars.autopilot.aimFactor;
    
    var roll = 0;
    var pitch = 0;
    if (autoParams.flagInShipFrame.z > 0) {
        // Overshot
        if (g58.optimise.enabled && autoParams.flagInShipFrame.z > 1000) {
            // Handle missed flag
            var previousFlag = game.flags[ship.iFlagPrevious];
            if (Math.abs(ship.velocityInOwnFrame.z) > flag.speed * g58.vars.optimise.overSpeedFactor) {
                g58.optimise.updateFlagMapSpeed(previousFlag);
                g58.optimise.overSpeeds++;
            }
            else {
                g58.optimise.updateFlagMapSpeed(flag);
            }
            g58.optimise.respawns++;
            g58.ship.teleportToFrame(ship, previousFlag.frame, /* useMinVelocity: */ true);
        }
        else {
            // Accelerate to respawn sooner
            ship.logic.acc -= g58.vars.velocityIncreaseRate * controlParams.msSinceLastLogic;
            if (ship.isPlayerShip) {
                e58.control.queueSound(e58.audio.sounds.engine, { loop: true, gain: g58.vars.sounds.wind.jet });
            }
        }
    }
    else {        
        // console.log(autoParams.cosSquaredUprightXDeg + ", " + autoParams.adjustedUprightRollDeg);
        // console.log(autoParams.uprightSign + ", " + autoParams.relativeBearing);
        // console.log(ship.logic.yawDelta);
        // console.log(autoParams.pitchDelta);
        // console.log();
        
        if (autoParams.flagInShipFrameXYMagnitude > aimFactor * flag.rMax
                || Math.abs(autoParams.shipInFlagFrame.x) > aimFactor * flag.xMax
                || Math.abs(autoParams.shipInFlagFrame.y) > aimFactor * flag.yMax) {
            // console.log("autopilot steer");
            
            pitch -= g58.vars.autopilot.pitchConstant * autoParams.pitchDelta;
            
            // On the flat, roll to yaw towards flag
            roll -= g58.vars.autopilot.rollConstant
                * autoParams.cosSquaredUprightXDeg
                * autoParams.uprightSign * autoParams.relativeBearing;
            
            // Vertical facing, roll to place flag in y axis, to enable steering towards flag with pitch            
            roll -= g58.vars.autopilot.rollConstant
                * autoParams.sinSquaredUprightXDeg
                * Math.atan(autoParams.flagInShipFrame.x / autoParams.flagInShipFrame.y);
        }
        else {
            // console.log("autopilot align");
            
            if (Math.abs(autoParams.alignZAxis.y) > Math.abs(autoParams.alignZAxis.x)) {
                pitch -= g58.vars.autopilot.pitchConstant
                    * autoParams.alignPhiDeg
                    * s58.getSign(autoParams.alignZAxis.y);
            }

            roll -= g58.vars.autopilot.rollConstant
                * autoParams.cosSquaredUprightXDeg
                * autoParams.uprightSign * autoParams.alignBearing;
        }
        
        if (-autoParams.targetSpeed < ship.velocityInOwnFrame.z && autoParams.alignPhiDeg < g58.vars.autopilot.jetDeg) {
            // console.log("autopilot jet");
            ship.logic.acc -= g58.vars.velocityIncreaseRate * controlParams.msSinceLastLogic;        
            if (ship.isPlayerShip) {
                e58.control.queueSound(e58.audio.sounds.engine, { loop: true, gain: g58.vars.sounds.wind.jet });
            }
        }
        
        (Math.abs(pitch) <= g58.vars.autopilot.maxPitch) || (pitch = s58.getSign(pitch) * g58.vars.autopilot.maxPitch);
        (Math.abs(roll) <= g58.vars.autopilot.maxRoll) || (roll = s58.getSign(roll) * g58.vars.autopilot.maxRoll);
        
        roll += g58.vars.autopilot.flattenConstant
            * autoParams.cosSquaredRelativeBearing
            * autoParams.cosSquaredUprightXDeg
            * autoParams.adjustedUprightRollDeg;
    
        // Avoid over rolling when on the flat
        if (Math.abs(autoParams.uprights.zFlatDeg) < g58.vars.autopilot.rollLimitUprightThreshold
                && Math.abs(autoParams.adjustedUprightRollDeg) > g58.vars.autopilot.rollLimit
                && roll * autoParams.adjustedUprightRollDeg * autoParams.uprightSign < 0) {
            roll = 0;
        }
                
        ship.autopilotPitchBuffer.apply(pitch * controlParams.msSinceLastLogic, function (appliedDelta) {
            ship.logic.pitch += appliedDelta;
        });
        ship.autopilotRollBuffer.apply(roll * controlParams.msSinceLastLogic, function (appliedDelta) {
            ship.logic.roll += appliedDelta;
        });
    }
};

g58.ship.getAutopilotParams = function (ship) {
    var game = g58.game;
    
    var flag = game.flags[ship.iFlagNext];
    var autoParams = {};
    
    autoParams.uprights = ship.frame.getUprightAngles();
    // console.log(autoParams.uprights);
    autoParams.uprightSign = Math.abs(autoParams.uprights.yVertDeg) <= 90 ? 1 : -1;
    
    autoParams.adjustedUprightRollDeg = Math.abs(autoParams.uprights.xFlatDeg) <= 90 ?
        autoParams.uprights.xFlatDeg :
        s58.getSign(autoParams.uprights.xFlatDeg) * (Math.abs(autoParams.uprights.xFlatDeg) - 180);
    
    autoParams.cosSquaredUprightXDeg = Math.cos(s58.degToRad(autoParams.uprights.zFlatDeg));
    autoParams.cosSquaredUprightXDeg *= autoParams.cosSquaredUprightXDeg;
    
    autoParams.sinSquaredUprightXDeg = Math.sin(s58.degToRad(autoParams.uprights.zFlatDeg));
    autoParams.sinSquaredUprightXDeg *= autoParams.sinSquaredUprightXDeg;
    
    autoParams.flagInShipFrame = flag.frame.origin.getPointInFrame(ship.frame);
    autoParams.shipInFlagFrame = ship.frame.origin.getPointInFrame(flag.frame);
        
    autoParams.shipBearing = s58.radToDeg(Math.atan2(ship.frame.zAxis.x, ship.frame.zAxis.z));
    
    autoParams.flagBearing = s58.radToDeg(Math.atan2(flag.frame.zAxis.x, flag.frame.zAxis.z));
    
    autoParams.shipFlagBearing = s58.radToDeg(Math.atan2(
        flag.frame.origin.x - ship.frame.origin.x,
        flag.frame.origin.z - ship.frame.origin.z));
    
    autoParams.relativeBearing = (autoParams.shipBearing - autoParams.shipFlagBearing + 720) % 360 - 180;
        
    autoParams.cosSquaredRelativeBearing = Math.cos(s58.degToRad(autoParams.relativeBearing));
    autoParams.cosSquaredRelativeBearing *= autoParams.cosSquaredRelativeBearing;
    
    var cosPitchFactor = Math.cos(Math.atan2(autoParams.flagInShipFrame.x, autoParams.flagInShipFrame.y));
    autoParams.pitchDelta =
        s58.radToDeg(Math.atan(autoParams.flagInShipFrame.y / autoParams.flagInShipFrame.z))
        * cosPitchFactor * cosPitchFactor;
    
    autoParams.flagInShipFrameXYMagnitude = Math.sqrt(
        autoParams.flagInShipFrame.x * autoParams.flagInShipFrame.x
        + autoParams.flagInShipFrame.y * autoParams.flagInShipFrame.y);
        
    autoParams.targetSpeed = flag.speed * ship.autopilotNerve;
    
    autoParams.alignZAxis = flag.frame.zAxis.getRotatedInToFrame(ship.frame);
    autoParams.alignPhiDeg = s58.radToDeg(autoParams.alignZAxis.phi);
    autoParams.alignBearing = (autoParams.shipBearing - autoParams.flagBearing + 720 - 180) % 360 - 180;
    
    return autoParams;
};

g58.ship.teleportToFrame = function (ship, frame, useMinVelocity, positionInFrame) {
    var game = g58.game;
        
    ship.frame = frame.clone();
    ship.frame.translateInOwnFrame(0, 0, game.flagMap.spacing);
    
    ship.yawBuffer.reset();
    
    if (positionInFrame) {
        ship.frame.translateInOwnFrame(positionInFrame.x, positionInFrame.y, 0);
    }
    
    if (useMinVelocity) {
        ship.velocityInOwnFrame = e58.point.getNewXYZ(0, 0, g58.vars.minVelocity);
    }
    
    if (ship.isControlShip) {        
        var uprightAngles = ship.frame.getUprightAngles();
        
        e58.control.queueSound(e58.audio.sounds.peow, { loop: false, gain: g58.vars.sounds.peow.gain });
        game.controlProps.movePitchBuffer.reset();
        game.controlProps.moveRollBuffer.reset();
        game.controlProps.keyMovePitchBuffer.reset();
        game.controlProps.keyMoveRollBuffer.reset();
        game.controlProps.derivedPitchBuffer.reset();
        game.controlProps.derivedRollBuffer.reset();
        game.controlProps.controlPitchZero = uprightAngles.zFlatDeg;
        game.controlProps.rollCompassZero = null;
        if (game.controlProps.lastDerivedPitch != null) {
            game.controlProps.derivedPitchZero = game.controlProps.lastDerivedPitch;
        }
    }
};
