// flag
// Flag (checkpoint) features

"use strict";

window.g58 = window.g58 || {};

g58.flag = {};

g58.flag.addFlagPolygons = function (flag) {
    var game = g58.game;
    var i, j;
    
    var W = 0.5 * g58.sizes.flag.width;
    var H = 0.5 * g58.sizes.flag.height;
    var OW = 0.5 * g58.sizes.flag.width;
    var OH = 0.5 * g58.sizes.flag.height;
    var IW = OW - g58.sizes.flag.innerOffset;
    var IH = OH - g58.sizes.flag.innerOffset;
    var D = 0.5 * g58.sizes.flag.depth;
        
    flag.markerPolygon = flag.addPolygon("flagMarker", "transparent", "transparent",
        [[-W, H, 0], [W, H, 0], [W, -H, 0], [-W, -H, 0]], /* detailLevel: */ 1);
        
    flag.innerPolygons = [
        flag.addPolygon("flagInner", "transparent", "transparent",
            [[-IW, +IH, -D], [+IW, +IH, -D], [+IW, +IH, +D], [-IW, +IH, +D]]),
        flag.addPolygon("flagInner", "transparent", "transparent",
            [[+IW, +IH, -D], [+IW, -IH, -D], [+IW, -IH, +D], [+IW, +IH, +D]]),
        flag.addPolygon("flagInner", "transparent", "transparent",
            [[+IW, -IH, -D], [-IW, -IH, -D], [-IW, -IH, +D], [+IW, -IH, +D]]),
        flag.addPolygon("flagInner", "transparent", "transparent",
            [[-IW, -IH, -D], [-IW, +IH, -D], [-IW, +IH, +D], [-IW, -IH, +D]])];
            
    flag.outerPolygons = [
        flag.addPolygon("flagOuter", "transparent", "transparent",
            [[-OW, +OH, -D], [+OW, +OH, -D], [+OW, +OH, +D], [-OW, +OH, +D]], /* detailLevel: */ -1),
        flag.addPolygon("flagOuter", "transparent", "transparent",
            [[+OW, +OH, -D], [+OW, -OH, -D], [+OW, -OH, +D], [+OW, +OH, +D]], /* detailLevel: */ -1),
        flag.addPolygon("flagOuter", "transparent", "transparent",
            [[+OW, -OH, -D], [-OW, -OH, -D], [-OW, -OH, +D], [+OW, -OH, +D]], /* detailLevel: */ -1),
        flag.addPolygon("flagOuter", "transparent", "transparent",
            [[-OW, -OH, -D], [-OW, +OH, -D], [-OW, +OH, +D], [-OW, -OH, +D]], /* detailLevel: */ -1)];
};

g58.flag.setFlagsPolygonsDisplay = function () {
    var game = g58.game;
    var i, j;
    var iFlagNext = (game.playerShip && game.playerShip.iFlagNext) || 0;
    var minTransparency = g58.colours.flag.minTransparency;
    var maxTransparency = g58.colours.flag.maxTransparency;
    var transparency, iDifference, innerFillRgb, outerLineRgb, outerFillRgb;
    for (i = 0; i < game.flags.length; i++) {
        if (i == 0) {
            innerFillRgb = g58.colours.startFlag.innerFillRgb;
            outerFillRgb = g58.colours.startFlag.outerFillRgb;
            outerLineRgb = g58.colours.startFlag.outerLineRgb;
        }
        else if (game.flags[i].endFlag) {
            innerFillRgb = g58.colours.endFlag.innerFillRgb;
            outerFillRgb = g58.colours.endFlag.outerFillRgb;
            outerLineRgb = g58.colours.endFlag.outerLineRgb;
        }
        else if (game.flags[i].teleport || game.flags[i].teleportDestination) {
            innerFillRgb = g58.colours.teleportFlag.innerFillRgb;
            outerFillRgb = g58.colours.teleportFlag.outerFillRgb;
            outerLineRgb = g58.colours.teleportFlag.outerLineRgb;
        }
        else {
            innerFillRgb = g58.colours.flag.innerFillRgb;
            outerFillRgb = g58.colours.flag.outerFillRgb;
            outerLineRgb = g58.colours.flag.outerLineRgb;
        }
        iDifference = (i - iFlagNext + game.flags.length) % game.flags.length;
        transparency = iDifference > game.flagMap.showFlagsN ?
            minTransparency :
            maxTransparency - (maxTransparency - minTransparency) * iDifference / game.flagMap.showFlagsN;        
        for (j = 0; j < game.flags[i].innerPolygons.length; j++) {
            game.flags[i].innerPolygons[j].fillColour = s58.rgba(
                innerFillRgb[0], innerFillRgb[1],
                innerFillRgb[2],
                transparency);
        }
        for (j = 0; j < game.flags[i].outerPolygons.length; j++) {
            game.flags[i].outerPolygons[j].lineColour = s58.rgba(
                outerLineRgb[0],
                outerLineRgb[1],
                outerLineRgb[2],
                transparency);
            game.flags[i].outerPolygons[j].fillColour = s58.rgba(
                outerFillRgb[0],
                outerFillRgb[1],
                outerFillRgb[2],
                transparency);
        }
        
        game.flags[i].detailLevel = (iDifference > game.flagMap.showFlagsN) ?
                -1 : (iDifference == 0) ? 1 : 0;
    }
    
    g58.flag.setNextFlagFlashColour();
};

g58.flag.setNextFlagFlashColour = function () {
    var game = g58.game;
    
    var nextFlagMarkerTransparency = s58.getFlash(
        g58.colours.nextFlagMarker.minTransparency,
        g58.colours.nextFlagMarker.maxTransparency,
        game.totalElapsedMs,
        g58.colours.nextFlagMarker.flashMs);
    
    game.flags[game.playerShip.iFlagNext || 0].markerPolygon.fillColour = s58.rgba(
        g58.colours.nextFlagMarker.fillRgb,
        nextFlagMarkerTransparency);
};

g58.flag.addFlags = function (flagMapNameOrDefinition) {
    var game = g58.game;
    var i, j, k;
    
    var flagMap = game.flagMap =
        (typeof flagMapNameOrDefinition == "string") ?
            g58.flagMaps.getByName(flagMapNameOrDefinition) :
            flagMapNameOrDefinition;
    
    var tempFlag = e58.block.getNew();
    
    game.flags = [];
    var newFlag, flagDistance, flagRoll, flagPitch, flagYaw, flagSpeeds, flagOptions, iFlagSpeed, steps, optionParams;
    
    tempFlag.frame.translateInUniverse(0, 0, -flagMap.firstFlagDistance);
    
    for (i = 0; i < flagMap.map.length; i++) {
        flagOptions = flagMap.map[i].length > 2 ? flagMap.map[i][2] : {};
        flagSpeeds =
            flagMap.speed ?
                [flagMap.speed] :
                flagMap.map[i].length > 1 ?
                    flagMap.map[i][1] :
                    [Math.abs(g58.vars.minVelocity)];
        flagRoll = flagMap.map[i][0].length > 3 ? flagMap.map[i][0][3] : 0;
        flagPitch = flagMap.map[i][0].length > 2 ? flagMap.map[i][0][2] : 0;
        flagYaw = flagMap.map[i][0].length > 1 ? flagMap.map[i][0][1] : 0;
        flagDistance = flagMap.map[i][0].length > 0 ? flagMap.map[i][0][0] : 1;
        flagDistance *= (flagYaw == 0 ? 1 : s58.PI * Math.abs(flagYaw) / 180);
        steps = Math.ceil(flagDistance);
        (steps >= flagYaw / flagMap.minDegPerStep) || (steps = Math.ceil(flagYaw / flagMap.minDegPerStep));
        (steps >= flagPitch / flagMap.minDegPerStep) || (steps = Math.ceil(flagPitch / flagMap.minDegPerStep));
        for (j = 0; j < steps; j++) {
            for (k = 0; k < flagMap.subSteps; k++) {
                tempFlag.frame.rotateInOwnFrameY(flagYaw / (steps * flagMap.subSteps));
                tempFlag.frame.rotateInOwnFrameX(flagPitch / (steps * flagMap.subSteps));                
                tempFlag.frame.rotateInOwnFrameZ(flagRoll / (steps * flagMap.subSteps));                
                tempFlag.frame.translateInOwnFrame(0, 0, -flagDistance * flagMap.spacing / (steps * flagMap.subSteps));
            }
            if (!flagMap.omitLastFlag || i < flagMap.map.length - 1 || j < steps - 1) {
                newFlag = game.universe.addBlock()
                newFlag.turn = (Math.abs(flagYaw) + Math.abs(flagPitch)) / steps;
                newFlag.frame = tempFlag.frame.clone();
                g58.flag.addFlagPolygons(newFlag);
                game.flags.push(newFlag);
                
                iFlagSpeed = Math.floor(flagSpeeds.length * j / steps);
                (iFlagSpeed < flagSpeeds.length) || (iFlagSpeed = flagSpeeds.length - 1);
                newFlag.speed = flagSpeeds[iFlagSpeed] * (flagMap.speedFactor || 1);
                newFlag.iFlagMapSpeed = iFlagSpeed;
                newFlag.iFlagMap = i;
            }
        }
        if (flagOptions.teleport || flagOptions.teleportAbsolute || flagOptions.gap || flagOptions.gapAbsolute) {
            optionParams = flagOptions.teleport || flagOptions.teleportAbsolute || flagOptions.gap || flagOptions.gapAbsolute;
            optionParams.x = optionParams[0];
            optionParams.y = optionParams[1];
            optionParams.z = optionParams[2];
            
            if (flagOptions.teleport || flagOptions.teleportAbsolute) {
                game.flags[game.flags.length - 1].teleport = true;
                game.flags[game.flags.length - 1].iTeleportFlag = game.flags.length;
            }
                        
            if (flagOptions.gap || flagOptions.gapAbsolute) {
                game.flags[game.flags.length - 1].gap = true;
            }
                                    
            if (flagOptions.teleportAbsolute || flagOptions.gapAbsolute) {
                tempFlag.frame = e58.frame.getNew(0);
                optionParams.z -= flagMap.firstFlagDistance;
            }
            
            tempFlag.frame.rotateInOwnFrameY(optionParams[3] || 0);
            tempFlag.frame.rotateInOwnFrameX(optionParams[4] || 0);
            tempFlag.frame.rotateInOwnFrameZ(optionParams[5] || 0);
            if (flagOptions.teleportAbsolute || flagOptions.gapAbsolute) {
                tempFlag.frame.translateInUniverse(optionParams.x, optionParams.y, optionParams.z);
            }
            else {
                tempFlag.frame.translateInOwnFrame(optionParams.x, optionParams.y, optionParams.z);
            }
            tempFlag.frame.rotateInOwnFrameY(optionParams[6] || 0);
            tempFlag.frame.rotateInOwnFrameX(optionParams[7] || 0);
            tempFlag.frame.rotateInOwnFrameZ(optionParams[8] || 0);
        }
    }
        
    // reconstruct speed map for optimisation process
    for (i = 0; i < game.flagMap.map.length; i++) {
        game.flagMap.map[i][1] = [];
        iFlagSpeed = 0;
        game.flags.forEach(function (flag, j) {
            if (flag.iFlagMap == i) {
                game.flagMap.map[i][1][iFlagSpeed] = flag.speed;
                flag.iFlagMapSpeed = iFlagSpeed;
                iFlagSpeed++;
            }
        });
    }
    
    if (flagMap.lapTeleport) {
        game.flags[game.flags.length - 1].teleport = true;
        game.flags[game.flags.length - 1].iTeleportFlag = 0;
    }
    
    if (flagMap.endFlag) {
        game.flags[game.flags.length - 1].endFlag = true;
    }
    
    for (i = 1; i < game.flags.length; i++) {
        if (game.flags[i - 1].teleport && !game.flags[i].endFlag) {
            game.flags[i].teleportDestination = true;
        }
    }

    for (i = 0; i < game.flags.length; i++) {
        if (game.flags[i].gap || (i == game.flags.length - 1 && !game.flags[i].teleport)) {
            game.flags[i].spacing =
                    game.flags[i].frame.origin.getDistance(game.flags[(i + 1) % game.flags.length].frame.origin);
        }
    }
    
    game.flagMap.minX = game.flags[0].frame.origin.x;
    game.flagMap.maxX = game.flagMap.minX;
    game.flagMap.minZ = game.flags[0].frame.origin.z;
    game.flagMap.maxZ = game.flagMap.minZ;
    
    game.flags.forEach(function (flag) {
        if (flag.frame.origin.x < game.flagMap.minX) {
            game.flagMap.minX = flag.frame.origin.x;
        }
        if (flag.frame.origin.x > game.flagMap.maxX) {
            game.flagMap.maxX = flag.frame.origin.x;
        }
        if (flag.frame.origin.z < game.flagMap.minZ) {
            game.flagMap.minZ = flag.frame.origin.z;
        }
        if (flag.frame.origin.z > game.flagMap.maxZ) {
            game.flagMap.maxZ = flag.frame.origin.z;
        }
    });
    
    game.flagMap.midX = 0.5 * (game.flagMap.minX + game.flagMap.maxX);
    game.flagMap.midZ = 0.5 * (game.flagMap.minZ + game.flagMap.maxZ);
    game.flagMap.midPoint = e58.point.getNewXYZ(game.flagMap.midX, 0, game.flagMap.midZ);
    
    game.flagMap.maxR = 0;
    
    game.flags.forEach(function (flag) {
        flag.mapX = flag.frame.origin.x - game.flagMap.midX;
        flag.mapZ = flag.frame.origin.z - game.flagMap.midZ;
        flag.mapRawR = Math.sqrt(flag.mapX * flag.mapX + flag.mapZ * flag.mapZ);

        if (flag.mapRawR > game.flagMap.maxR) {
            game.flagMap.maxR = flag.mapRawR;
        }
    
        var bearingRad = -Math.atan2(flag.frame.zAxis.x, flag.frame.zAxis.z);
        flag.mapCosBearing = Math.cos(bearingRad);
        flag.mapSinBearing = Math.sin(bearingRad);
    });
    
    game.flagMap.maxR;
    game.flagMap.mapHalfScale = 1 / (game.flagMap.maxR + game.flagMap.spacing + (game.flagMap.firstFlagDistance || 0));
    
    // game.flagMap.mapHalfScaleXY =
        // game.flagMap.maxX - game.flagMap.minX > game.flagMap.maxZ - game.flagMap.minZ ?
            // 1 / (game.flagMap.maxX - game.flagMap.minX) :
            // 1 / (game.flagMap.maxZ - game.flagMap.minZ);
        
    g58.flag.setFlagsPolygonsDisplay();
};
