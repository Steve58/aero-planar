// game
// Game initialisation and handling

"use strict";

window.g58 = window.g58 || {};

g58.game = {};

(function () {
    var game = g58.game;
    window.addEventListener("load", function() {
        var queryOptions = s58.parseQueryString();
        queryOptions.autoReloads = null;
        
        document.getElementById("back").href =
                (queryOptions.menu ? "Menu.htm?" : "Home.htm?") + s58.constructQueryStringParams(queryOptions);
        document.getElementById("reload").href =
                "Game.htm?" + s58.constructQueryStringParams(queryOptions);
        
        g58.vars.enableMotionControl = queryOptions.enableMotionControl;
        g58.vars.cpuShipsN = queryOptions.cpuShipsN || 0;
        e58.vars.integerPixels = !queryOptions.antiAliasing || false;
        e58.vars.shading.enable = queryOptions.shading || false;
        e58.vars.sound.enable = queryOptions.sound || false;
        e58.vars.fontSizePx = g58.vars.fontSizePx;
        e58.vars.fontWeight = g58.vars.fontWeight;
        e58.vars.fontFamily = g58.vars.fontFamily;
                    
        game.canvas = e58.canvas.getNew("gameCanvas", g58.colours.sky);
        game.universe = e58.universe.getNew();
        game.camera = game.universe.addCamera([0, 0, 0], 0, 0, 0, game.canvas.getStandardZoom());
        game.totalElapsedMs = 0;
        
        g58.horizon.addHorizon();            
        g58.ship.addPlayerShip();
        g58.ship.addCpuShips();
        g58.ship.setStartingGrid();
        
        g58.flag.addFlags(
            queryOptions.map == "custom" ?
                JSON.parse(queryOptions.customMap) :
                queryOptions.map);
        g58.ship.initialiseAllFlagIndexes();

        if (game.flagMap.title) {
            document.getElementsByTagName("title")[0].text = "Aero Planar - " + game.flagMap.title;
        }
        
        g58.camera.setDefaults();
        
        setTimeout(function () {
            game.canvas.updateDimensions();            
            g58.rendering.render();
            g58.misc.setUpPageScroll();
        }, 500);
        
        g58.control.setUpControlProps();
        
        if (g58.vars.optimise.flagMapSpeeds) {
            game.canvas.htmlElement.addEventListener("click", g58.optimise.runFlagMapSpeeds);
        }
        else if (g58.vars.optimise.variable) {
            game.canvas.htmlElement.addEventListener("click", g58.optimise.runVariable);
        }
        else {
            g58.control.setUpStartHandlers();
        }
    });
})();
