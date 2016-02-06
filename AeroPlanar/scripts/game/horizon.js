// horizon
// Horizon polygons feature

"use strict";

window.g58 = window.g58 || {};

g58.horizon = {};

g58.horizon.addHorizon = function () {
    var game = g58.game;
    var HD = g58.vars.horizonDistance;
    game.horizon = game.universe.addBlock([0, 0, 0], 0, 0, 0, { alwaysDraw: true });
    game.horizon.addPolygon("anon", g58.colours.ground, g58.colours.ground,
        [[-HD, -HD, -HD], [HD, -HD, -HD], [HD, -HD, 0], [-HD, -HD, 0]]);
    game.horizon.addPolygon("anon", g58.colours.ground, g58.colours.ground,
        [[-HD, -HD, 0], [HD, -HD, 0], [HD, -HD, HD], [-HD, -HD, HD]]);
    game.horizon.addPolygon("anon", g58.colours.ground, g58.colours.ground,
        [[-HD, -HD, -HD], [HD, -HD, -HD], [HD, 0, -HD], [-HD, 0, -HD]]);
};
