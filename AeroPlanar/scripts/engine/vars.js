// vars
// Settings

"use strict";

window.e58 = window.e58 || {};

e58.vars = {
    minBrowserWidthPx: 200,

    integerPixels: true,

    fontWeight: "normal",
    fontSizePx: 30,
    fontFamily: "Verdana, Geneva, sans-serif",

    pixelToCoordScale: 10,
    cameraScreenDistance: 200,
    drawDistance: 1000000,
    drawYaw: 10,
    activeBodyClassName: "active",
    inactiveBodyClassName: "inactive",
    standardWidthZoomRatio: 1000,
    requestPointerLockDelayMs: 2000,
    soundLoopCheckMs: 1000,

    touchMovePads: [{ xMin: 0, xMax: 0.5, yMin: 0, yMax: 1 }],
    
    control: {
        logEnabled: false,
        toggleMs: 500,
        startDelayMs: 500,
        pollIntervalMs: 5,
        logicUpdateIntervalMs: 30,
        webcamIntervalMs: 30,
        renderIntervalMs: 30,
        playSoundsIntervalMs: 100,
        derivedOrientationAbsoluteBuffer: { limit: 0, constant: 1 },
        derivedOrientationRelativeBuffer: { limit: 0, constant: 1 },
        rollOrientationLimits: { low: 20, high: 40, difference: 10 }
    },

    shading: {
        enable: false,
        halfShade: 0.35,
        transparency: 0.25
    },

    sound: {
        enable: true
    },

    webcam: {
        width: 200,
        pollWhetherRunningMs: 100,
        maximaResolution: 20,
        maxima: 2,
        sectors: {
            full: true,
            topLeft: false,
            topCentre: false,
            topRight: false,
            bottomLeft: false,
            bottomCentre: false,
            bottomRight: false
        },
        gap: 0.3 // full vertical gap as proportion of height
    }
};
