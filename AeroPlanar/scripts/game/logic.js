// logic
// Logic handling

"use strict";

window.g58 = window.g58 || {};

g58.logic = {};

g58.logic.updateLogic = function (controlParams) {
    var game = g58.game;
    var i;
    
    game.totalElapsedMs = controlParams.totalElapsedMs;
    game.msSinceLastResumed = controlParams.msSinceLastResumed;
        
    game.ships.forEach(function (ship, i) {
        ship.logic = {
            roll: 0,
            pitch: 0,
            yaw: 0,
            acc: g58.vars.velocityDecreaseRate * controlParams.msSinceLastLogic
        };
    });
        
    // s58.pageConsoleWrite(game.playerShip.iFlagNext + " - " + game.playerShip.flagsHit + "/" + game.flags.length);
    
    g58.control.handleControls(controlParams);
    
    g58.ship.updateAllYaws(controlParams);
        
    // if (controlParams.keys.isDown("m")) {
        // g58.ship.autopilot(game.playerShip, controlParams);
    // }
    
    g58.ship.autopilotAllCpuShips(controlParams);
    
    g58.ship.updateAllOrientations();
    g58.ship.updateAllVelocities();
    g58.ship.updateAllJets();
    
    g58.logic.handleAllFlagHitsAndRespawns(controlParams);
    
    g58.camera.applyBuffers(controlParams);
    
    game.universe.updateLogic(controlParams);
};

g58.logic.handleAllFlagHitsAndRespawns = function (controlParams) {
    var game = g58.game;
    
    game.ships.forEach(function (ship, i) {        
        // Handle flag hits
        var nextFlag = game.flags[ship.iFlagNext];
        var nextFlagDistance = nextFlag.frame.origin.getDistance(ship.frame.origin);
        var maxTravel = Math.abs(ship.velocityInOwnFrame.z) * controlParams.msSinceLastLogic * g58.vars.maxTravelExtraCollisionDetectionFactor;
        var previousFlag = game.flags[ship.iFlagPrevious];
        if (nextFlagDistance < nextFlag.rMax + maxTravel) {
            var shipOriginInFlagFrame = ship.frame.origin.getPointInFrame(nextFlag.frame);
            if (Math.abs(shipOriginInFlagFrame.x) < nextFlag.xMax
                    && Math.abs(shipOriginInFlagFrame.y) < nextFlag.yMax
                    && Math.abs(shipOriginInFlagFrame.z) < nextFlag.zMax + maxTravel) {
                g58.ship.updateFlagIndexes(ship);
                                
                if (nextFlag.teleport) {
                    g58.ship.teleportToFrame(
                        ship,
                        game.flags[nextFlag.iTeleportFlag].frame,
                        /* useMinVelocity: */ false,
                        shipOriginInFlagFrame);
                }
                
                if (g58.optimise.enabled && !ship.isPlayerShip) {
                    if(Math.abs(ship.velocityInOwnFrame.z) > nextFlag.speed * g58.vars.optimise.overSpeedFactor) {
                        g58.optimise.overSpeeds++;
                        g58.optimise.updateFlagMapSpeed(previousFlag);
                    }
                    g58.optimise.flagHits++;
                }
                
                if (ship.isPlayerShip) {
                    e58.control.queueSound(e58.audio.sounds.blip, { loop: false, gain: g58.vars.sounds.blip.gain });
                }
                
                return;
            }
        }
        
        // Handle respawns
        var previousFlagDistance = previousFlag.frame.origin.getDistance(ship.frame.origin);
        var respawnDistance = previousFlag.spacing || g58.vars.respawnDistance || game.flagMap.spacing;
        if ((!ship.raceIsFinished || !ship.isPlayerShip)
                && !previousFlag.teleport
                && nextFlagDistance > respawnDistance
                && previousFlagDistance > respawnDistance) {
            g58.ship.teleportToFrame(ship, game.flags[ship.iFlagNext].frame, /* useMinVelocity: */ true);
            
            if (g58.optimise.enabled && !ship.isPlayerShip) {
                g58.optimise.respawns++;
                g58.optimise.updateFlagMapSpeed(previousFlag);
            }
        }
    });
};
