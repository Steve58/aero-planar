// flagMaps
// Maps data for generating maps of checkpoints

"use strict";

window.g58 = window.g58 || {};

g58.flagMaps = {};

g58.flagMaps.getByName = function (name) {
    return g58.flagMaps[name] || g58.flagMaps.defaultMap;
};

g58.flagMaps.customTemplate = (function () {
    return {
        title: "Custom",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        loop: false,
        loopGap: false,
        speed: 25,
        speedFactor: 1,
        map: [
            [[20]]
        ]
    };
})();

g58.flagMaps.straight = (function () {
    return {
        title: "Straight",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[20]]
        ]
    };
})();

g58.flagMaps.twist = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[5]],
            [[10, 0, 0, 90]],
            [[5]]
        ]
    };
})();

g58.flagMaps.turn = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 5,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 20,
        map: [
            [[5]],
            [[10, 10]],
            [[5]]
        ]
    };
})();


g58.flagMaps.turns = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 20,
        map: [
            [[5]],
            [[10, 10]],
            [[10, -10]],
            [[5]]
        ]
    };
})();

g58.flagMaps.lap = (function () {
    return {
"title":"Lap",
"lapsN":3,
"spacing":15000,
"firstFlagDistance":3000,
"omitLastFlag":false,
"minDegPerStep":45,
"subSteps":100,
"showFlagsN":5,
"loop": true,
"speed":25,
"map":[
[[5]],
[[5, 180]],
[[5]],
[[5, 180]],
]
    };
})();

g58.flagMaps.climb = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[5]],
            [[10, 0, 1]]
        ]
    };
})();

g58.flagMaps.bridge = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[5]],
            [[5, 0, 2]],
            [[5, 0, -2]],
            [[5]],
            [[5, 0, -2]],
            [[5, 0, 2]],
            [[5]]
        ]
    };
})();

g58.flagMaps.cross = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 3000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 5,
        map: [
            [[8], [1], { teleportAbsolute: [13500, 0, -13500, 90, 0, 0] }],
            [[8], [1]]
        ]
    };
})();

g58.flagMaps.weave = (function () {
    var L = 1, A = 3, S = 10000;
    var R = 2 * L;
    return {
        title: "",
        lapsN: 3,
        spacing: S,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[R, 0, A], [1]],
            [[R, 0, -A], [1]],
            [[L], [1]],
            [[R, 0, -A], [1]],
            [[R, 0, A], [1], { teleportAbsolute: [2.5 * R * S, 0, -2.5 * R * S, 90, 0, 0] }],
            [[R, 0, -A], [1]],
            [[R, 0, A], [1]],
            [[L], [1]],
            [[R, 0, A], [1]],
            [[R, 0, -A], [1]]
        ]
    };
})();

g58.flagMaps.leap = (function () {
    var T = 10, H = 3, R = 6, A = 15, L = 5, J = 15, S = 10000;

    return {
        title: "",
        lapsN: 3,
        spacing: S,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speedFactor: 5,
        map: [                        
            [[3],
                [3]],
            [[6, 0, 5],
                [3]],
            [[3],
                [3],
                { gapAbsolute: [0, 15000, -350000, 0, 0, 0] }],
            [[3],
                [5]],
            [[10],
                [5],
                { teleportAbsolute: [-95000, -100, -425000, -90, 15, 0] }],
            [[5, 0, -5],
                [5],
                { gap: [0, 0, -32000, 0, 0, 0, 0, -5, 0] }],
            [[2, 0, -7],
                [5],
                { gap: [0, -3000, -30000, 0, 0, 0, 0, -5, 0] }],
            [[5, 0, -5],
                [5]]                
        ]
    };
})();

g58.flagMaps.gaps = (function () {
    var T = 10, H = 3, R = 6, A = 15, L = 5, J = 15, S = 10000;

    return {
        title: "",
        lapsN: 3,
        spacing: S,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speedFactor: 8,
        map: [
            [[5],
                [3],
                { gap: [0, 0, -100000, 0, 0, 0] }],
            [[5],
                [3],
                { gap: [0, 0, -100000, 5, 0, 0, 0] }],
            [[40, 5],
                [3],
                { gap: [0, 0, -100000, -5, 0, 0, -5] }],
            [[40, -5],
                [3],
                { gap: [0, 0, -100000, 0, 0, 0] }],
            [[5],
                [3]]
        ]
    };
})();

g58.flagMaps.teleport = (function () {
    var T = 10, H = 3, R = 6, A = 15, L = 5, J = 15, S = 10000;

    return {
        title: "",
        lapsN: 3,
        spacing: S,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speedFactor: 5,
        map: [
            [[5],
                [3],
                { teleportAbsolute: [-1000, 1000, -100000, 15, 0, 0] }],
            [[40, -5],
                [3],
                { teleportAbsolute: [+1000, 1000, -200000, -15, 0, 0] }],
            [[40, +5],
                [3],
                { teleportAbsolute: [0, 15000, 80000, 0, -15, 0] }],
            [[5, 0, 5],
                [3]]
        ]
    };
})();

g58.flagMaps.teleportGaps = (function () {
    var T = 10, H = 3, R = 6, A = 15, L = 5, J = 15, S = 10000;

    return {
        title: "",
        lapsN: 3,
        spacing: S,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: false,
        endFlag: false,
        loopGap: true,
        speedFactor: 8,
        map: [
            [[5],
                [3],
                { gapAbsolute: [-1000, 1000, -100000, 15, 0, 0] }],
            [[20, -15],
                [3],
                { gapAbsolute: [+1000, 1000, -200000, -15, 0, 0] }],
            [[20, +15],
                [3],
                { teleportAbsolute: [0, 15000, 80000, 0, -15, 0] }],
            [[5, 0, 5],
                [3]]
        ]
    };
})();

g58.flagMaps.doubleback = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
            [[5], [1], { teleportAbsolute: [2200, 0, -90000, 180, 0, 0] }],
            [[5], [1]]
        ]
    };
})();

g58.flagMaps.track01 = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: true,
        endFlag: true,
        speed: 25,
        map: [
        
            [[5]],
            [[10, -10, 0, -3]],
            [[5, 0, 2]],
            [[10, 10, 0, 3]],
            [[5, 0, -2]],
            [[10, 10, 0, 3]],
            [[5, 0, -2]],
            [[5, 0, 2]],
            [[5]]
                
        ]
    };
})();

g58.flagMaps.loop = (function () {
    return {
        title: "",
        lapsN: 3,
        spacing: 15000,
        firstFlagDistance: 3000,
        omitLastFlag: false,
        minDegPerStep: 10,
        subSteps: 100,
        showFlagsN: 5,
        lapTeleport: false,
        endFlag: false,
        loop: true,
        speed: 20,
        map: [
            [[40, 0, 360]]
        ]
    };
})();

g58.flagMaps.defaultMap = g58.flagMaps.straight;
