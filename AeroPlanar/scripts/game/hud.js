// hud
// Head up display features

"use strict";

window.g58 = window.g58 || {};

g58.hud = {};

g58.hud.render = function () {
    var game = g58.game;
    
    // s58.pageConsoleWrite(
        // "speed: " + Math.ceil(-game.playerShip.velocityInOwnFrame.z)
         // // + "<br/>"
         // + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
         // + "checkpoint: " + (game.playerShip.iFlagNext + 1) + "/" + game.flags.length
         // + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
         // + "lap: " + game.playerShip.iLap);
    
    var uprightAngles = game.playerShip.frame.getUprightAngles();
    
    var cosSquaredVerticalAngle = Math.cos(s58.degToRad(uprightAngles.zFlatDeg));
    cosSquaredVerticalAngle *= cosSquaredVerticalAngle;
            
    var canvas = game.canvas;
    var dims = canvas.getDimensions();
    var hudDim = 0.15 * dims.x;
    var hudSpace = 0.1 * hudDim;
    var hudPos = 0.5 * hudDim + hudSpace;
    var innerHudPosX = 1.5 * hudDim + 2.0 * hudSpace;
    var hudR = 0.5 * hudDim;
    var hudRefR = 0.3 * hudR;
    
    var hudTextSizePx = 0.1 * hudDim;
    var hudTextR = 0.9 * hudR;
    
    var miniHudPosXRatio = 0.3;
    var miniHudR = 0.67 * hudR;
    var miniHudPosY = 0.67 * hudPos;
    
    
    var textSizePx = 0.035 * dims.x;
    var textSpace = 0.1 * textSizePx;
    var textPosY = 0.5 * textSizePx + textSpace;
    var textLineHeight = textSizePx + 2.0 * textSpace;
    var textPosRatioX = 0.7;
    
    
    var hudColour = s58.rgba(g58.colours.hud.mainRgb, g58.colours.hud.mainTransparency);
    var hudHalfColour = s58.rgba(g58.colours.hud.mainRgb, 0.5 * g58.colours.hud.mainTransparency);
    var hudQuarterColour = s58.rgba(g58.colours.hud.mainRgb, 0.25 * g58.colours.hud.mainTransparency);
    var vertColour = s58.rgba(g58.colours.hud.mainRgb, g58.colours.hud.mainTransparency * cosSquaredVerticalAngle);
    var playerShipColour = s58.rgba(255, s58.getFlash(
        /* min: */ 0.1,
        /* min: */ g58.colours.hud.mainTransparency,
        game.totalElapsedMs,
        g58.colours.nextFlagMarker.flashMs));
    
    var flagMinTransparency = 0.1;
    var flagMaxTransparency = g58.colours.hud.mainTransparency;
    var nextFlagTransparency = s58.getFlash(
        flagMinTransparency,
        flagMaxTransparency,
        game.totalElapsedMs,
        g58.colours.nextFlagMarker.flashMs);
    
    canvas.startContext(hudColour, hudColour, /* lineWidth: */ 2);
    
    
    // radar
    var radarGuideDim = 0.05 * hudDim;
    var radarShipDim = 0.02 * hudDim;
    var radarFlagDim = 0.03 * hudDim;
    var radarFlagW = radarFlagDim;
    var radarFlagHalfW = 0.5 * radarFlagW;
    var radarFlagH = radarFlagDim;
    var radarFlagHalfH = 0.5 * radarFlagDim;
        
    var nextFlagR = game.flags[game.playerShip.iFlagNext].frame.origin.getTranslated(
        game.playerShip.frame.origin,
        -1).r;
    var radarFlagScale = g58.vars.hudRadarScale * radarFlagDim / hudDim / g58.game.flagMap.spacing;
    if (radarFlagScale * nextFlagR > 0.5) {
        radarFlagScale = 0.5 / nextFlagR;
    }
    
    canvas.setDrawOrigin(+hudPos, -hudPos, -1, +1);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.arc(0, 0, hudR, 0, s58.TWOPI);
    canvas.stroke();
    
    canvas.beginPath();
    canvas.setLineColour(hudHalfColour);
    canvas.moveTo(-radarGuideDim, 0);
    canvas.lineTo(+radarGuideDim, 0);
    canvas.moveTo(0, -radarGuideDim);
    canvas.lineTo(0, +radarGuideDim);
    canvas.stroke();
    
    var nextFlagIncDeg;
    game.flags.forEach(function (flag, i) {
        var flagCompassPoint = flag.frame.origin.getTranslated(game.playerShip.frame.origin, -1);
        var flagBearingRad = Math.atan2(flagCompassPoint.x, -flagCompassPoint.z) - s58.degToRad(uprightAngles.compassDeg);
        var radarFlagR = flagCompassPoint.r * radarFlagScale;
        
        if (i == game.playerShip.iFlagNext) {
            nextFlagIncDeg = s58.radToDeg(Math.atan2(
                flagCompassPoint.y,
                Math.sqrt(flagCompassPoint.x * flagCompassPoint.x + flagCompassPoint.z * flagCompassPoint.z)));
        }
        
        if (radarFlagR * hudR + radarFlagDim > hudR) {
            return;
        }
        
        var flagX = hudR * radarFlagR * Math.sin(flagBearingRad);
        var flagY = hudR * radarFlagR * Math.cos(flagBearingRad);
        
        var radarFlagTransparency = (i == game.playerShip.iFlagNext) ?
            nextFlagTransparency :
            flagMinTransparency + flagMaxTransparency * (1 - ((i - game.playerShip.iFlagNext + game.flags.length) % game.flags.length) / game.flags.length);
        
        canvas.setLineColour(s58.rgba(255, radarFlagTransparency));

        var vScale = g58.vars.hudRadarVerticalScale;
        var factorMin = g58.vars.hudRadarFlagFactorMin;
        var bottomWidthFactor = (flagCompassPoint.y >= -vScale.min) ? 1 :
            (vScale.max - vScale.min) / (-flagCompassPoint.y - vScale.min);
        (bottomWidthFactor >= factorMin) || (bottomWidthFactor = factorMin);
        (bottomWidthFactor <= 1) || (bottomWidthFactor = 1);
        var topWidthFactor = (flagCompassPoint.y <= vScale.min) ? 1 :
            (vScale.max - vScale.min) / (flagCompassPoint.y - vScale.min);
        (topWidthFactor >= factorMin) || (topWidthFactor = factorMin);
        (topWidthFactor <= 1) || (topWidthFactor = 1);
        
        canvas.beginPath();
        canvas.moveTo(
            flagX - radarFlagHalfW * bottomWidthFactor,
            flagY - radarFlagHalfH);
        canvas.lineTo(
            flagX + radarFlagHalfW * bottomWidthFactor,
            flagY - radarFlagHalfH);
        canvas.lineTo(
            flagX + radarFlagHalfW * topWidthFactor,
            flagY + radarFlagHalfH);
        canvas.lineTo(
            flagX - radarFlagHalfW * topWidthFactor,
            flagY + radarFlagHalfH);
        canvas.closePath();
        canvas.stroke();            
    });
    
    game.cpuShips.forEach(function (ship, i) {
        var shipCompassPoint = ship.frame.origin.getTranslated(game.playerShip.frame.origin, -1);
        var shipBearingRad = Math.atan2(shipCompassPoint.x, -shipCompassPoint.z) - s58.degToRad(uprightAngles.compassDeg);
        var radarShipR = shipCompassPoint.r * radarFlagScale;
        if (radarShipR * hudR + radarShipDim > hudR) {
            return;
        }
        
        var shipX = hudR * radarShipR * Math.sin(shipBearingRad);
        var shipY = hudR * radarShipR * Math.cos(shipBearingRad);
        var shipOrientationRad = Math.atan2(ship.frame.zAxis.x, -ship.frame.zAxis.z) - s58.degToRad(uprightAngles.compassDeg);
                
        canvas.beginPath();
        canvas.setLineColour(hudColour);
        canvas.moveTo(
            shipX - radarShipDim * Math.sin(shipOrientationRad + s58.degToRad(-150)),
            shipY - radarShipDim * Math.cos(shipOrientationRad + s58.degToRad(-150)));
        canvas.lineTo(
            shipX - radarShipDim * Math.sin(shipOrientationRad),
            shipY - radarShipDim * Math.cos(shipOrientationRad));
        canvas.lineTo(
            shipX - radarShipDim * Math.sin(shipOrientationRad + s58.degToRad(150)),
            shipY - radarShipDim * Math.cos(shipOrientationRad + s58.degToRad(150)));
        canvas.closePath();
        canvas.stroke();    
    });
    
    
    
    
    
    
    // map
    var mapFullDim = hudR;
    var mapDim = 0.75 * mapFullDim;
    var mapShipDim = 0.03 * hudDim;
    var mapFlagDim = 0.025 * hudDim;
    
    var mapHalfScale = game.flagMap.mapHalfScale;
    var playerShipMapPoint = game.playerShip.frame.origin.getTranslated(game.flagMap.midPoint, -1);
    var playerShipMapR = Math.sqrt(playerShipMapPoint.x * playerShipMapPoint.x + playerShipMapPoint.z * playerShipMapPoint.z);
    if (mapHalfScale * playerShipMapR * mapDim + 2 * mapShipDim > mapFullDim) {
        mapHalfScale = (mapFullDim - 2 * mapShipDim) / (playerShipMapR * mapDim);
    }
    
    canvas.setDrawOrigin(-hudPos, -hudPos, +1, +1);
    canvas.setLineWidth(2);
    
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.arc(0, 0, mapFullDim, 0, s58.TWOPI);
    canvas.stroke();
    
    canvas.setLineWidth(2);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    game.flags.forEach(function (flag, i) {
        var previousFlag = (i == 0) ? flag : game.flags[i - 1];
        
        if (!previousFlag.teleport && !previousFlag.gap) {
            canvas.moveTo(
                previousFlag.mapX * mapHalfScale * mapDim,
                -previousFlag.mapZ * mapHalfScale * mapDim);
            canvas.lineTo(
                flag.mapX * mapHalfScale * mapDim,
                -flag.mapZ * mapHalfScale * mapDim);
        }
    });
    canvas.stroke();
    
    canvas.setLineWidth(2);
    canvas.beginPath();
    canvas.setLineColour(hudQuarterColour);
    game.flags.forEach(function (flag, i) {
        var previousFlag = (i == 0) ? flag : game.flags[i - 1];
        
        if (!previousFlag.teleport && previousFlag.gap) {
            canvas.moveTo(
                previousFlag.mapX * mapHalfScale * mapDim,
                -previousFlag.mapZ * mapHalfScale * mapDim);
            canvas.lineTo(
                flag.mapX * mapHalfScale * mapDim,
                -flag.mapZ * mapHalfScale * mapDim);
            canvas.stroke();
        }
    });
    canvas.stroke();
    
    game.flags.forEach(function (flag, i) {
        if (i == game.playerShip.iFlagNext
                || i == 0
                || (!game.flagMap.loop && flag.endFlag)
                || flag.teleport
                || flag.teleportDestination) {
            canvas.setLineWidth(4);
            canvas.beginPath();
            (i == game.playerShip.iFlagNext) ?
                canvas.setLineColour(s58.rgba(255, nextFlagTransparency)) :
                canvas.setLineColour(hudColour);
            canvas.moveTo(
                flag.mapX * mapHalfScale * mapDim - mapFlagDim * flag.mapCosBearing,
                -flag.mapZ * mapHalfScale * mapDim + mapFlagDim * flag.mapSinBearing);
            canvas.lineTo(
                flag.mapX * mapHalfScale * mapDim + mapFlagDim * flag.mapCosBearing,
                -flag.mapZ * mapHalfScale * mapDim - mapFlagDim * flag.mapSinBearing);
            canvas.stroke();
        }
    });
    
    canvas.setLineWidth(2);    
    if (game.flagMap.loop || game.flagMap.loopGap) {        
        canvas.beginPath();
        canvas.setLineColour(game.flagMap.loop ? hudColour : hudQuarterColour);
        canvas.moveTo(
            game.flags[game.flags.length - 1].mapX * mapHalfScale * mapDim,
            -game.flags[game.flags.length - 1].mapZ * mapHalfScale * mapDim);
        canvas.lineTo(
            game.flags[0].mapX * mapHalfScale * mapDim,
            -game.flags[0].mapZ * mapHalfScale * mapDim);
        canvas.stroke();
    }
    
    
    canvas.setLineWidth(2);
        
    game.ships.forEach(function (ship, i) {
        var shipMapPoint = ship.frame.origin.getTranslated(game.flagMap.midPoint, -1);
        var mapShipX = mapDim * mapHalfScale * shipMapPoint.x;
        var mapShipZ = mapDim * mapHalfScale * shipMapPoint.z;
        
        if (Math.sqrt(mapShipX * mapShipX + mapShipZ * mapShipZ) + mapShipDim > mapFullDim) {
            // return;
        }
        
        var shipOrientationRad = Math.atan2(ship.frame.zAxis.x, -ship.frame.zAxis.z);
        
        canvas.beginPath();
        canvas.setLineColour(ship.isPlayerShip ? playerShipColour : hudColour);
        canvas.setFillColour(ship.isPlayerShip ? playerShipColour : s58.rgba(0, 0));
        canvas.moveTo(
            mapShipX - mapShipDim * Math.sin(shipOrientationRad + s58.degToRad(-150)),
            -mapShipZ - mapShipDim * Math.cos(shipOrientationRad + s58.degToRad(-150)));
        canvas.lineTo(
            mapShipX - mapShipDim * Math.sin(shipOrientationRad),
            -mapShipZ - mapShipDim * Math.cos(shipOrientationRad));
        canvas.lineTo(
            mapShipX - mapShipDim * Math.sin(shipOrientationRad + s58.degToRad(150)),
            -mapShipZ - mapShipDim * Math.cos(shipOrientationRad + s58.degToRad(150)));
        canvas.closePath();
        canvas.stroke();
        canvas.fill();
    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    // artifical horizon
    var vertL = 0.5 * hudR;
    
    canvas.setDrawOrigin(0, +hudPos, 0, -1);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.arc(0, 0, hudR, 0, s58.TWOPI);
    canvas.moveTo(-hudR, 0);
    canvas.lineTo(-hudR + hudRefR, 0);
    canvas.moveTo(+hudR, 0);
    canvas.lineTo(+hudR - hudRefR, 0);
    canvas.stroke();
        
    canvas.beginPath();
    canvas.setLineColour(vertColour);
    canvas.moveTo(
        hudR * Math.sin(s58.degToRad(-uprightAngles.rollDeg - 90)),
        hudR * Math.cos(s58.degToRad(-uprightAngles.rollDeg - 90)));
    canvas.lineTo(
        hudR * Math.sin(s58.degToRad(-uprightAngles.rollDeg + 90)),
        hudR * Math.cos(s58.degToRad(-uprightAngles.rollDeg + 90)));
    canvas.moveTo(0, 0);
    canvas.lineTo(
        vertL * Math.sin(s58.degToRad(-uprightAngles.rollDeg)),
        vertL * Math.cos(s58.degToRad(-uprightAngles.rollDeg)));
    canvas.stroke();
    
    
    
    
    
    
    
    
    
    // inclinometer    
    var incHalfW = 1.0 * hudDim;
    var incHalfH = 0.5 * hudDim;
    var incSpace = 0.05 * hudDim;
    var incTextPosX = incHalfW - incSpace - hudTextSizePx * 1.5 * g58.vars.fontAspectRatio;
    var incGuideOuterX = incHalfW - 2 * incSpace - hudTextSizePx * 3 * g58.vars.fontAspectRatio;    
    
    canvas.setDrawOrigin(0, +hudPos, 0, -1);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.moveTo(-incHalfW, -incHalfH);
    canvas.lineTo(-incHalfW, +incHalfH);
    canvas.moveTo(+incHalfW, -incHalfH);
    canvas.lineTo(+incHalfW, +incHalfH);
    canvas.moveTo(-incGuideOuterX, 0);
    canvas.lineTo(-hudR, 0);
    canvas.moveTo(+incGuideOuterX, 0);
    canvas.lineTo(+hudR, 0);
    canvas.stroke();
    
    var cosXFlat = Math.cos(s58.degToRad(uprightAngles.xFlatDeg));
    var incGuideDeg, displayGuideDeg;
    var incGuideInnerX, incGuideHalfH, incGuideColour;
    for (incGuideDeg = -180; incGuideDeg <= 180; incGuideDeg += g58.vars.hudIncIncrement) {
        incGuideHalfH =
            incHalfH
            * g58.vars.hudIncFactor
            * s58.getSign(game.playerShip.frame.yAxis.y)
            * (incGuideDeg - uprightAngles.zFlatDeg)
            / 90;
        incGuideInnerX = incSpace + Math.sqrt(hudR * hudR - incGuideHalfH * incGuideHalfH);
        if (Math.abs(incGuideHalfH) <= incHalfH) {
            incGuideColour = s58.rgba(
                255,
                (0.0 + 0.5 * (1 - Math.abs(incGuideHalfH) / incHalfH)));
            canvas.setLineColour(incGuideColour);
            canvas.setFillColour(incGuideColour);
            
            canvas.setDrawOrigin(0, +hudPos, 0, -1);
            canvas.beginPath();
            canvas.setLineWidth(2);
            canvas.moveTo(-incGuideOuterX, incGuideHalfH);
            canvas.lineTo(-incGuideInnerX, incGuideHalfH);
            canvas.moveTo(+incGuideOuterX, incGuideHalfH);
            canvas.lineTo(+incGuideInnerX, incGuideHalfH);
            canvas.stroke();
            
            // hud text
            canvas.setLineWidth(1);
            
            displayGuideDeg =
                incGuideDeg == 0 ?
                    "0" :
                    (incGuideDeg > 0 ? "+" : "-") + Math.abs(incGuideDeg);
            
            canvas.setDrawOrigin(-incTextPosX, +hudPos + incGuideHalfH, 0, -1);
            canvas.fillText(displayGuideDeg, hudTextSizePx);
            canvas.setDrawOrigin(+incTextPosX, +hudPos + incGuideHalfH, 0, -1);
            canvas.fillText(displayGuideDeg, hudTextSizePx);
        }
    }
    
    var nextFlagInShipFrame = game.flags[game.playerShip.iFlagNext].frame.origin.getPointInFrame(
        game.playerShip.frame,
        -1);
        
    if (nextFlagInShipFrame.z < 0) {
        incGuideDeg = nextFlagIncDeg;
        incGuideHalfH =
            incHalfH
            * g58.vars.hudIncFactor
            * s58.getSign(game.playerShip.frame.yAxis.y)
            * (incGuideDeg - uprightAngles.zFlatDeg)
            / 90;
        incGuideInnerX = incSpace + Math.sqrt(hudR * hudR - incGuideHalfH * incGuideHalfH);
        
        var nextFlagIncTransparency =
            (nextFlagInShipFrame.r < game.flagMap.spacing) ?
                nextFlagTransparency * nextFlagInShipFrame.r / game.flagMap.spacing :
                nextFlagTransparency;
        
        if (Math.abs(incGuideHalfH) <= incHalfH) {            
            canvas.setLineColour(s58.rgba(255, nextFlagIncTransparency));            
            canvas.setDrawOrigin(0, +hudPos, 0, -1);
            canvas.beginPath();
            canvas.setLineWidth(2);
            canvas.moveTo(-incGuideOuterX, incGuideHalfH);
            canvas.lineTo(-incGuideInnerX, incGuideHalfH);
            canvas.moveTo(+incGuideOuterX, incGuideHalfH);
            canvas.lineTo(+incGuideInnerX, incGuideHalfH);
            canvas.stroke();
        }
    }
    
    
    
    
    canvas.setLineWidth(2);
    canvas.setLineColour(hudColour);
    canvas.setFillColour(hudColour);
    
    
    
    
    
    // speedo
    var zeroSpeedRadRaw = 0.33 * s58.PI;
    var zeroSpeedRad = s58.HALFPI + zeroSpeedRadRaw;
    var maxSpeedRad = s58.HALFPI - zeroSpeedRadRaw;
    var speedRadScale = s58.TWOPI - 2 * zeroSpeedRadRaw;
    var speedRad = speedRadScale * game.playerShip.velocityInOwnFrame.z / g58.vars.maxVelocity + zeroSpeedRad;
    
    canvas.setDrawOrigin(0, -miniHudPosY, -miniHudPosXRatio, +1);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.arc(0, 0, miniHudR, 0, s58.TWOPI);
    canvas.moveTo(0, 0);
    canvas.lineTo(
        miniHudR * Math.cos(zeroSpeedRad),
        -miniHudR * Math.sin(zeroSpeedRad));
    canvas.moveTo(0, 0);
    canvas.lineTo(
        miniHudR * Math.cos(maxSpeedRad),
        -miniHudR * Math.sin(maxSpeedRad));
    canvas.stroke();
    
    canvas.beginPath();
    canvas.setLineColour(hudHalfColour);
    canvas.setFillColour(hudHalfColour);
    canvas.moveTo(0, 0);
    canvas.arc(0, 0, miniHudR, zeroSpeedRad, speedRad);
    canvas.stroke();
    canvas.fill();
    
    
    
    
    
    
    // altimiter
    var zeroAltRad = s58.HALFPI;
    
    var hudAlt = g58.vars.hudAlt.scale *(game.playerShip.frame.origin.y - g58.vars.hudAlt.zero);
    (hudAlt >= g58.vars.hudAlt.min) || (hudAlt = g58.vars.hudAlt.min);
    (hudAlt <= g58.vars.hudAlt.max) || (hudAlt = g58.vars.hudAlt.max);
    
    var miniHudRad = s58.HALFPI + s58.TWOPI * g58.vars.hudAlt.radScale * hudAlt;
    
    canvas.setDrawOrigin(0, -miniHudPosY, +miniHudPosXRatio, +1);
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.arc(0, 0, miniHudR, 0, s58.TWOPI);
    canvas.moveTo(0, 0);
    canvas.lineTo(
        miniHudR * Math.cos(miniHudRad),
        -miniHudR * Math.sin(miniHudRad));
    canvas.stroke();
    
    
    
    
    
    // flag altitude indicators
    var flagAltDim = 0.25 * miniHudR;
    var flagAltHalfDim = 0.5 * flagAltDim;
    var flagAltHyp = Math.sqrt(2 * flagAltHalfDim * flagAltHalfDim);
    var flagAltPosX = miniHudR;
    var flagAltPosY = miniHudR - flagAltHyp;
    
    var shipFlagY = game.flags[game.playerShip.iFlagNext].frame.origin.y - game.playerShip.frame.origin.y;
    if (Math.abs(shipFlagY) > g58.vars.hudRadarVerticalScale.min) {
        canvas.setLineColour(s58.rgba(255, nextFlagTransparency));
        canvas.setFillColour(s58.rgba(255, nextFlagTransparency));
        [-1, +1].forEach(function (xSign) {
            var ySign = s58.getSign(shipFlagY);
            canvas.setDrawOrigin(xSign * flagAltPosX, -miniHudPosY - ySign * flagAltPosY, +miniHudPosXRatio, +1);
            canvas.beginPath();
            canvas.moveTo(0, ySign * flagAltHalfDim);
            canvas.lineTo(-flagAltHyp, -ySign * flagAltHyp);
            canvas.lineTo(+flagAltHyp, -ySign * flagAltHyp);
            canvas.closePath();
            canvas.stroke();
            canvas.fill();
        });        
    }
    
    
    
    
    
    
    
    // orientation pitch control
    if (game.controlProps.pitchControl || game.controlProps.showPitchHud.value) {
        var pitchW = 0.5 * dims.x;
        var pitchH = 0.4 * dims.y;
        var pitchHalfW = 0.5 * pitchW;
        var pitchHalfH = 0.5 * pitchH;
        var pitchTextPosX = pitchHalfW - incSpace - hudTextSizePx * 1 * g58.vars.fontAspectRatio;
        var pitchGuideOuterX = pitchHalfW - 2 * incSpace - hudTextSizePx * 2 * g58.vars.fontAspectRatio;    
        var pitchGuideInnerX = 0.75 * pitchHalfW;
        var derivedPitchDeltaMarkerY = pitchHalfH * g58.vars.hudPitchFactor * (game.controlShip.logic.pitch || 0) / 90;
        
        canvas.setDrawOrigin(0, 0, 0, 0);
        canvas.beginPath();
        canvas.setLineColour(hudColour);
        canvas.moveTo(-pitchHalfW, -pitchHalfH);
        canvas.lineTo(-pitchHalfW, +pitchHalfH);
        canvas.moveTo(+pitchHalfW, -pitchHalfH);
        canvas.lineTo(+pitchHalfW, +pitchHalfH);
        canvas.stroke();
        
        if (Math.abs(derivedPitchDeltaMarkerY) <= pitchHalfH) {
            canvas.beginPath();
            canvas.moveTo(-pitchGuideOuterX, derivedPitchDeltaMarkerY);
            canvas.lineTo(+pitchGuideOuterX, derivedPitchDeltaMarkerY);
            canvas.stroke();
        }
        
        var pitchGuideDeg, pitchGuideHalfH;
        var pitchDegRange = g58.vars.hudPitchRange;
        for (pitchGuideDeg = -pitchDegRange; pitchGuideDeg <= pitchDegRange; pitchGuideDeg += g58.vars.hudPitchIncrement) {
            pitchGuideHalfH = pitchHalfH * g58.vars.hudPitchFactor * pitchGuideDeg / 90;
            
            if (Math.abs(pitchGuideHalfH) <= pitchHalfH) {
                canvas.setDrawOrigin(0, 0, 0, 0);
                canvas.beginPath();
                canvas.setLineWidth(2);
                canvas.moveTo(-pitchGuideOuterX, pitchGuideHalfH);
                canvas.lineTo(-pitchGuideInnerX, pitchGuideHalfH);
                canvas.moveTo(+pitchGuideOuterX, pitchGuideHalfH);
                canvas.lineTo(+pitchGuideInnerX, pitchGuideHalfH);
                canvas.stroke();
                
                // hud text
                if ((Math.abs(pitchGuideDeg) - pitchDegRange) % g58.vars.hudPitchLabelledIncrement == 0) {
                    canvas.setLineWidth(1);
                    
                    displayGuideDeg =
                        pitchGuideDeg == 0 ?
                            "0" :
                            (pitchGuideDeg > 0 ? "+" : "-") + Math.abs(pitchGuideDeg);
                    
                    canvas.setDrawOrigin(0, 0, 0, 0);
                    canvas.setDrawOrigin(-pitchTextPosX, +pitchGuideHalfH, 0, 0);
                    canvas.fillText(displayGuideDeg, hudTextSizePx);
                    canvas.setDrawOrigin(+pitchTextPosX, +pitchGuideHalfH, 0, 0);
                    canvas.fillText(displayGuideDeg, hudTextSizePx);
                }
            }
        }
    }
    
    // hud text
    canvas.setLineWidth(1);
    canvas.setLineColour(hudColour);
    canvas.setFillColour(hudColour);
    
    canvas.setDrawOrigin(
        +hudPos + hudTextR * Math.sin(s58.degToRad(-uprightAngles.compassDeg)),
        -hudPos + hudTextR * Math.cos(s58.degToRad(-uprightAngles.compassDeg)),
        -1,
        1);
    canvas.fillText("N", hudTextSizePx);
    
    canvas.setDrawOrigin(
        +hudPos + hudTextR * Math.sin(s58.degToRad(-uprightAngles.compassDeg + 180)),
        -hudPos + hudTextR * Math.cos(s58.degToRad(-uprightAngles.compassDeg + 180)),
        -1,
        1);
    canvas.fillText("S", hudTextSizePx);
    
    canvas.setDrawOrigin(
        +hudPos + hudTextR * Math.sin(s58.degToRad(-uprightAngles.compassDeg + 90)),
        -hudPos + hudTextR * Math.cos(s58.degToRad(-uprightAngles.compassDeg + 90)),
        -1,
        1);
    canvas.fillText("E", hudTextSizePx);
    
    canvas.setDrawOrigin(
        +hudPos + hudTextR * Math.sin(s58.degToRad(-uprightAngles.compassDeg - 90)),
        -hudPos + hudTextR * Math.cos(s58.degToRad(-uprightAngles.compassDeg - 90)),
        -1,
        1);
    canvas.fillText("W", hudTextSizePx);
    
    canvas.setDrawOrigin(-hudPos, -hudPos + hudTextR, +1, +1);
    canvas.fillText("N", hudTextSizePx);
    canvas.setDrawOrigin(-hudPos, -hudPos - hudTextR, +1, +1);
    canvas.fillText("S", hudTextSizePx);
    canvas.setDrawOrigin(-hudPos - hudTextR, -hudPos, +1, +1);
    canvas.fillText("W", hudTextSizePx);
    canvas.setDrawOrigin(-hudPos + hudTextR, -hudPos, +1, +1);
    canvas.fillText("E", hudTextSizePx);
        
    canvas.setDrawOrigin(0, -miniHudPosY + 0.33 * miniHudR, -miniHudPosXRatio, +1);
    canvas.fillText(g58.hud.getDisplaySpeed(game.playerShip), 0.66 * miniHudR);
    canvas.setDrawOrigin(0, -miniHudPosY - 0.5 * miniHudR, -miniHudPosXRatio, +1);
    canvas.fillText("kph", 0.33 * miniHudR);
    
    canvas.setDrawOrigin(0, -miniHudPosY + 0.33 * miniHudR, miniHudPosXRatio, +1);
    canvas.fillText(Math.floor(hudAlt), 0.66 * miniHudR);
    canvas.setDrawOrigin(0, -miniHudPosY - 0.5 * miniHudR, miniHudPosXRatio, +1);
    canvas.fillText("x100 ft", 0.33 * miniHudR);
        
    // display text
    
    var totalMs, placeOrdinal, displayLaps;
    if (game.playerShip.raceIsFinished) {
        totalMs = game.playerShip.finishMs;
        placeOrdinal = s58.formatOrdinal(game.playerShip.finishPlace);
        displayLaps = game.flagMap.lapsN;
        
        var finishedText = "finished " + placeOrdinal + " of " + game.ships.length;
        canvas.setDrawOrigin(0, +hudPos + hudR + textPosY, 0, -1);
        canvas.fillText(finishedText, textSizePx);
    }
    else {
        totalMs = game.totalElapsedMs;
        placeOrdinal = s58.formatOrdinal(g58.ship.getPlace(game.playerShip));
        displayLaps = game.playerShip.iLap;
    }
    
    canvas.beginPath();
    canvas.setLineColour(hudColour);
    canvas.setFillColour(hudColour);
    
    var totalSeconds = Math.floor(totalMs / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds - minutes * 60;        
    var timeText = s58.padLeft(minutes, 2, "0") + ":" + s58.padLeft(seconds, 2, "0");
    canvas.setDrawOrigin(0, -textPosY, 0, 1);
    canvas.fillText(timeText, textSizePx);
    
    var placeText = placeOrdinal + "/" + game.ships.length;
    canvas.setDrawOrigin(0, -textPosY - textLineHeight, 0, +1);
    canvas.fillText(placeText, textSizePx);
    
    var lapsText = "lap " + displayLaps + "/" + game.flagMap.lapsN;
    canvas.setDrawOrigin(0, -textPosY - 2 * textLineHeight, 0, +1);
    canvas.fillText(lapsText, textSizePx);
    
    if (!game.started) {
        canvas.setDrawOrigin(0, 0, 0, 0);
        canvas.fillText("click to start", textSizePx);
    }
    
    if (game.paused) {
        canvas.setDrawOrigin(0, 0, 0, 0);
        canvas.fillText("click to resume", textSizePx);
    }
};

g58.hud.getDisplaySpeed = function (ship) {
    return Math.ceil(
        g58.vars.minDisplaySpeed
        + (g58.vars.maxDisplaySpeed - g58.vars.minDisplaySpeed)
            * (ship.velocityInOwnFrame.z - g58.vars.minVelocity)
            / (g58.vars.maxVelocity - g58.vars.minVelocity));
};
