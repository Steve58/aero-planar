// colours
// Colour settings/data

"use strict";

window.g58 = window.g58 || {};

window.addEventListener("load", function() {
    g58.colours = {
        sky: s58.rgba(70, 150, 150),
        ground: s58.rgba(20, 100, 20),
        jet: { minRgb: [60, 0, 0], maxRgb: [200, 30, 0] },
        playerShip: { bodyRgb: [80, 80, 80], line: s58.rgba(0) },
        cpuShips: [
            { bodyRgb: [140, 140, 140], line: s58.rgba(0) },
            { bodyRgb: [180, 180, 180], line: s58.rgba(0) },
            { bodyRgb: [220, 220, 220], line: s58.rgba(0) }],
        shipShades: [0.00, 0.06, 0.12],
        flag: {
            minTransparency: 0.2,
            maxTransparency: 0.8,
            innerFillRgb: [40, 20, 20],
            outerFillRgb: [200, 20, 20],
            outerLineRgb: [200, 20, 20]
        },
        nextFlagMarker: {
            flashMs: 500,
            minTransparency: 0.05,
            maxTransparency: 0.25,
            fillRgb: [255, 255, 255]
        },
        startFlag: {
            innerFillRgb: [180, 180, 180],
            outerFillRgb: [240, 240, 240],
            outerLineRgb: [0, 0, 0]
        },
        endFlag: {
            innerFillRgb: [180, 180, 180],
            outerFillRgb: [240, 240, 240],
            outerLineRgb: [0, 0, 0]
        },
        teleportFlag: {
            innerFillRgb: [10, 10, 10],
            outerFillRgb: [80, 80, 80],
            outerLineRgb: [0, 0, 0]
        },
        hud: {
            mainRgb: [255, 255, 255],
            mainTransparency: 0.67,
            textRgb: [255, 255, 255]
        }
    };
});
