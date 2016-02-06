// optimise
// Optimisation features for computer-controlled aeroplanes.
// Adjusts speed settings on maps when activated.

"use strict";

window.g58 = window.g58 || {};

g58.optimise = {};

g58.optimise.updateFlagMapSpeed = function (flag, factor) {
    if (!g58.optimise.flagMapSpeeds) {
        return;
    }
    
    var game = g58.game;
    var iMap = flag.iFlagMap;
    var iSpeed = flag.iFlagMapSpeed;
    game.flagMap.map[iMap][1][iSpeed] *= (factor || g58.vars.optimise.flagMapSpeedDecrease);
    (game.flagMap.map[iMap][1][iSpeed] <= Math.abs(g58.vars.maxVelocity))
        || (game.flagMap.map[iMap][1][iSpeed] = Math.abs(g58.vars.maxVelocity));
    (game.flagMap.map[iMap][1][iSpeed] >= Math.abs(g58.vars.minVelocity))
        || (game.flagMap.map[iMap][1][iSpeed] = Math.abs(g58.vars.minVelocity));
    
    g58.game.flags.forEach(function (f, i) {
        if (f.iFlagMap == iMap && f.iFlagMapSpeed == iSpeed) {
            f.speed = game.flagMap.map[iMap][1][iSpeed]; // * game.flagMap.speedFactor;
        }
    });
};

g58.optimise.increaseAllFlagMapSpeeds = function () {
    if (!g58.optimise.flagMapSpeeds) {
        return;
    }
    
    g58.game.flags.forEach(function (flag, i) {
        g58.optimise.updateFlagMapSpeed(flag, g58.vars.optimise.flagMapSpeedIncrease);
    });
};

g58.optimise.logFlagMapSpeeds = function() {
    console.log("flag map definition:");
    var mapItemOut = "";
    var mapItemSeparator = "";
    g58.game.flagMap.map.forEach(function (mapItem, i) {
        mapItemOut += mapItemSeparator;
        mapItemSeparator = ",\n";
        mapItemOut += "[[";
        var separator = "";
        mapItem[0].forEach(function (pathItem, j) {
            mapItemOut += separator + pathItem;
            separator = ", ";
        });
        mapItemOut += "],\n    [";
        separator = "";
        mapItem[1].forEach(function (speedItem, j) {
            mapItemOut += separator + (Math.floor(speedItem * 1000) / 1000);
            separator = ", ";
        });
        mapItemOut += "]";
        if (mapItem[2]) {
            mapItemOut += ",\n    { ";
            var optionSeparator = "";
            var optionName;
            for (optionName in mapItem[2]) {
                mapItemOut += optionSeparator + optionName + ": [";
                separator = "";
                mapItem[2][optionName].forEach(function (optionVariable, j) {
                    mapItemOut += separator + optionVariable;
                    separator = ", ";
                });
                optionSeparator = "], ";
            }
            mapItemOut += "] }";
        }
        mapItemOut += "]";
    });
    console.log(mapItemOut);
};


g58.optimise.runVariable = function () {
    var i;
    g58.optimise.variable = true;
    
    var objectPath = g58.vars.optimise.variableName.split(".");
    var parentObject = s58;
    var propertyName;
    for (i = 0; i < objectPath.length - 1; i++) {
        propertyName = objectPath[i];
        parentObject = parentObject[propertyName];
    }
    propertyName = objectPath[objectPath.length - 1];
    
    g58.optimise.updateVariable = function () {
        parentObject[propertyName] += g58.vars.optimise.variableStepSize;
    };
    
    g58.optimise.logVariable = function () {
        console.log(propertyName + ": " + parentObject[propertyName]);
        g58.optimise.variableLog = g58.optimise.variableLog || [];
        g58.optimise.variableLog.push([
            parentObject[propertyName],
            g58.optimise.respawns,
            g58.optimise.flagHits]);
    };
    
    parentObject[propertyName] = g58.vars.optimise.variableMin;
    
    g58.optimise.run();
};

g58.optimise.runFlagMapSpeeds = function () {
    g58.optimise.flagMapSpeeds = true;
    g58.vars.autopilot.pitchConstant *= 0.75;
    g58.vars.autopilot.rollConstant *= 0.75;
    g58.vars.autopilot.yawConstant *= 0.75;
    g58.optimise.run();
};

g58.optimise.run = function () {
    var iLogic;
    
    g58.optimise.enabled = true;
    g58.optimise.respawns = 0;
    g58.optimise.overSpeeds = 0;
    g58.optimise.flagHits = 0;
    
    var controlParams = {
        totalElapsedMs: 0,
        msSinceLastLogic: e58.vars.control.logicUpdateIntervalMs,
        touches: [],
        keys: {
            isDown: function () { return false; },
            numberDown: function () { return false; }
        },
        mousesDown: {},
        derivedOrientation: {},
        move: {}
    };
    
    var iterationLengthN = g58.vars.optimise.iterationLengthS * 1000 / controlParams.msSinceLastLogic;
    var logicStepsN = g58.vars.optimise.iterationsN * iterationLengthN;
    
    console.log("starting optimisation");
    
    if (g58.optimise.flagMapSpeeds) {
        g58.optimise.logFlagMapSpeeds();
    }
    
    var speeds;
    var iIteration = 0;
    for (iLogic = 0; iLogic <= logicStepsN; iLogic++) {
        if (iLogic > 0 && iLogic % iterationLengthN == 0) {
            iIteration++;
            console.log("step " + iIteration + " of " + g58.vars.optimise.iterationsN);
            console.log("elapsed seconds: " + (controlParams.totalElapsedMs * 0.001));
            console.log(g58.optimise.respawns + " respawns");
            console.log(g58.optimise.overSpeeds + " overspeeds");
            console.log(g58.optimise.flagHits + " flag hits");
            
            if (g58.optimise.flagMapSpeeds) {
                g58.optimise.logFlagMapSpeeds();
            }
            else if (g58.optimise.variable) {
                g58.optimise.logVariable();
                g58.optimise.updateVariable();
            }
            
            if (g58.optimise.flagHits / g58.optimise.respawns > g58.vars.optimise.flagHitsToRespawnsRatio) {
                g58.optimise.increaseAllFlagMapSpeeds();
            }
            
            g58.optimise.respawns = 0;
            g58.optimise.overSpeeds = 0;
            g58.optimise.flagHits = 0;
        }
        
        controlParams.totalElapsedMs += controlParams.msSinceLastLogic;
        g58.logic.updateLogic(controlParams);
    }
    
    if (g58.optimise.variableLog) {
        console.log("variable log:");
        g58.optimise.variableLog.forEach(function (logItem, i) {
            console.log(logItem);
        });
    }
    
    console.log("optimisation run complete");
};
