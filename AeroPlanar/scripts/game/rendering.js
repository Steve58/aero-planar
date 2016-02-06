// rendering
// Rendering features

"use strict";

window.g58 = window.g58 || {};

g58.rendering = {};

g58.rendering.render = function () {
    var game = g58.game;
    
    var shipOrigin = game.camera.ship.frame.origin;
    if (game.camera.followShip) {
        switch (game.camera.position) {
            case g58.camera.positions.backVertical:
                game.camera.frame = e58.frame.getNew(
                    [shipOrigin.x, shipOrigin.y, shipOrigin.z],
                    0,
                    -game.camera.ship.frame.getUprightAngles().compassDeg,
                    0);
                break;
            case g58.camera.positions.top:
                game.camera.frame = e58.frame.getNew([shipOrigin.x, shipOrigin.y, shipOrigin.z], -90, -90, 90);
                break;
            case g58.camera.positions.topCompass:
                game.camera.frame = e58.frame.getNew(
                    [shipOrigin.x, shipOrigin.y, shipOrigin.z],
                    -90,
                    -90,
                    90 - game.camera.ship.frame.getUprightAngles().compassDeg);
                break;
            default:
                game.camera.frame = game.camera.ship.frame.clone();
                break;
        }
    }
    
    if (game.camera.adjust.active) {
        if (game.camera.adjust.pitch) {
            game.camera.frame.rotateInOwnFrameX(
                    (game.camera.followShip ? 1 : -1) * game.camera.adjust.pitch);
        }
        if (game.camera.adjust.yaw) {
            game.camera.frame.rotateInOwnFrameY(
                    (game.camera.followShip ? 1 : -1) * game.camera.adjust.yaw);
        }
        if (game.camera.adjust.roll) {
            game.camera.frame.rotateInOwnFrameZ(
                    -game.camera.adjust.roll);
        }
        if (game.camera.adjust.x || game.camera.adjust.y || game.camera.adjust.z) {
            game.camera.frame.translateInOwnFrame(
                game.camera.adjust.x,
                game.camera.adjust.y,
                game.camera.adjust.z);
        }
        if (!game.camera.followShip) {
            game.camera.adjust = g58.camera.getDefaultAdjust();
        }
    }
    
    if (game.camera.followShip
        && game.camera.position != g58.camera.positions.back
        && game.camera.position != g58.camera.positions.backVertical) {
        game.camera.frame.translateInOwnFrame(0, 0, g58.vars.cameraDistance);
    }
    else if (game.camera.followShip) {
        game.camera.frame.rotateInOwnFrameZ(-game.camera.roll);
        game.camera.frame.rotateInOwnFrameX(-game.camera.pitch);
        game.camera.frame.rotateInUniverseY(-game.camera.yaw);
            
        var zTranslation = g58.vars.cameraDistance - game.camera.ship.velocityInOwnFrame.z * g58.vars.cameraVelocityConstant;
        game.camera.frame.origin = game.camera.frame.origin.getTranslated(
                [game.camera.frame.zAxis.x * zTranslation, game.camera.frame.zAxis.y * zTranslation, game.camera.frame.zAxis.z * zTranslation]);
    }
    
    game.horizon.frame = e58.frame.getNew([game.camera.frame.origin.x, 0, game.camera.frame.origin.z], 0, 0, 0);
    game.horizon.frame.rotateInOwnFrameY(s58.radToDeg(Math.atan2(game.camera.frame.zAxis.x, game.camera.frame.zAxis.z)));
    
    g58.ship.updateAllJetColours();
    
    g58.flag.setFlagsPolygonsDisplay();
    
    game.universe.render(game.camera, game.canvas);
    
    g58.hud.render();
};
