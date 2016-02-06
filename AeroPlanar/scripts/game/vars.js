// vars
// Settings

"use strict";

window.g58 = window.g58 || {};

g58.vars = {
    defaultOptions: {
        cpuShipsN: 2,
        map: "straight",
        enableMotionControl: true,
        antiAliasing: false,
        shading: false,
        sound: false,
        customMap: "",
        editCustomMap: false
    },
    
    maxAutoReloads: 3,
    
    enableCameraControl: false,
    
    fontWeight: "bold",
    fontSizePx: 40,
    fontFamily: "'Lucida Console', Monaco, monospace",
    fontAspectRatio: 0.6,
    minDisplaySpeed: 100,
    maxDisplaySpeed: 1000,
    
    enablePauseDelayMs: 1000,
    
    derivedRollLimits: { absolute: 45, continuous: 60 },
    pitchDeltaConstants: { withControl: 0.0012, toZero: 0.0012, continuous: 0.0005 },
    maxPitchDelta: 0.03,
    rollDeltaConstant: 0.003, // 0.007,
    rollDeltaContinuousConstant: 0.0003, // 0.001,
    maxRollDelta: 0.03, // 0.05,
    yawConstant: 0.2,
    yawVelocityPower: 0,
    minVelocity: -3.0,
    maxVelocity: -30.0,
    maxTravelExtraCollisionDetectionFactor: 1.1,
    velocityIncreaseRate: 0.004,
    velocityDecreaseRate: 0.002,
    jetColourRateConstant: 0.5,
    cpuShipsN: 0,
    shipStartSpacing: 150,
    horizonDistance: 1E6,
    respawnDistance: 0, // zero to use flag map spacing, previously 2E4
    yawBuffer: { limit: 1, constant: 0.9 },
    movePitchBuffer: { limit: 0.5, constant: 0.1 },
    moveRollBuffer: { limit: 0.5, constant: 0.1 },
    keyMovePitchBuffer: { limit: 0.01, constant: 1 },
    keyMoveRollBuffer: { limit: 0.01, constant: 1 },
    derivedPitchBuffer: { limit: 0.5, constant: 0.5 },
    derivedRollBuffer: { limit: 0.5, constant: 0.5 }, // { limit: 0.5, constant: 0.9 }, 
    cameraDistance: 1.5E3,
    cameraPitchBuffer: { limit: 0.5, constant: 0.001 },
    cameraRollBuffer: { limit: 0.5, constant: 0.1 },
    cameraYawBuffer: { limit: 0.5, constant: 0.001 },
    cameraPitchDecay: 0.995,
    cameraPitchMax: 0.8,
    cameraRollDecay: 0.996,
    cameraYawDecay: 0.996,
    cameraYawMax: 0.8,
    cameraVelocityConstant: 0.5E3,
    cameraAccMax: 1.0,
    hudPitchRange: 5,
    hudPitchFactor: 28,
    hudPitchIncrement: 1,
    hudPitchLabelledIncrement: 5,
    hudIncFactor: 2,
    hudIncIncrement: 15,
    hudRadarScale: 4,
    hudRadarVerticalScale: { min: 1000, max: 1500 },
    hudRadarFlagFactorMin: 0.25,
    hudAlt: {
        zero: -500 / 5E-4,
        min: 1,
        max: 1000,
        scale: 5E-4,
        radScale: 1
    },
    
    cameraAccBuffer: { limit: 0.5, constant: 0.01 }, // not in use
    cameraAccDecay: 0.999, // not in use
    cameraAccConstant: 5E3, // not in use
    
    mouseMoveConstants: { roll: 0.05, pitch: 0.007 },
    touchMoveConstants: { roll: 0.30, pitch: 0.042 },
    keyMoveConstants: { roll: 0.1, pitch: 0.01 },
    
    autopilot: {
        maxPitch: 0.5,
        maxRoll: 0.5,
        rollLimit: 60,
        rollLimitUprightThreshold: 60,
        pitchConstant: 0.01,
        rollConstant: 0.05,
        flattenConstant: 0.005,
        aimFactor: 0.5,
        jetDeg: 10,
        pitchBuffer: { limit: 1, constant: 0.9 },
        rollBuffer: { limit: 1, constant: 0.9 },
        nerve: {
            min: 0.5,
            max: 1.0,
            player: 1.0,
        }
    },
    
    cameraAdjustRates: {
        x: 0.5,
        y: 0.5,
        z: 10,
        fastZ: 100,
        pitch: 0.04,
        roll: 0.04,
        yaw: 0.01
    },
    
    sounds: {
        blip: { gain: 0.05 },
        jet: { gain: 0.5 },
        peow: { gain: 0.05 },
        wind: { gain: 0.2 }
    },
    
    optimise: {
        iterationsN: 20,
        iterationLengthS: 3E2,
        
        overSpeedFactor: 1.1,
        
        flagMapSpeeds: false,
        flagMapSpeedDecrease: 0.99,
        flagMapSpeedIncrease: 1.01,
        flagHitsToRespawnsRatio: 1000,
        
        variable: false,
        variableName: "aero.vars.autopilot.pitchConstant",
        variableMin: 0.005,
        variableStepSize: 0.005
    },
    
    scrollMenuDurationMs: 100,
    scrollMenuIntervalMs: 20,
};
