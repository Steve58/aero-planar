// home
// Home page script

"use strict";

window.addEventListener("load", function() {
    var mouseOptions = {
        cpuShipsN: 5,
        map: null,
        enableMotionControl: false,
        antiAliasing: true,
        shading: true,
        sound: null
    };
    var motionOptions = {
        cpuShipsN: 2,
        map: null,
        enableMotionControl: true,
        antiAliasing: false,
        shading: false,
        sound: null
    };
    var touchOptions = {
        cpuShipsN: 2,
        map: null,
        enableMotionControl: false,
        antiAliasing: false,
        shading: false,
        sound: null
    };
        
    function refreshOptions() {
        mouseOptions.map = motionOptions.map = touchOptions.map = document.getElementById("map").value;
        mouseOptions.sound = motionOptions.sound = touchOptions.sound = document.getElementById("sound").value;
        
        document.getElementById("goMouse").href = "Game.htm?" + s58.constructQueryStringParams(mouseOptions);
        document.getElementById("goMotion").href = "Game.htm?" + s58.constructQueryStringParams(motionOptions);
        document.getElementById("goTouch").href = "Game.htm?" + s58.constructQueryStringParams(touchOptions);
        document.getElementById("home").href = "Home.htm?" + s58.constructQueryStringParams(touchOptions);
        document.getElementById("info").href = "Info.htm?" + s58.constructQueryStringParams(touchOptions);
        document.getElementById("menu").href = "Menu.htm?" + s58.constructQueryStringParams(touchOptions);
        
        if (document.origin != "null") {
            // condition avoids Chrome error when using file protocol
            window.history.replaceState(null, "", "Home.htm?" + s58.constructQueryStringParams(mouseOptions));
        }
    }
    
    (function () {
        var queryOptions = s58.parseQueryString();        
        var optionName, dropdown;
        for (optionName in mouseOptions) {
            dropdown = document.getElementById(optionName);
            if (dropdown) {
                dropdown.addEventListener("change", refreshOptions);                            
                if (queryOptions[optionName]
                        || queryOptions[optionName] == 0
                        || queryOptions[optionName] == false) {
                    dropdown.value = queryOptions[optionName].toString();
                }
                else {
                    dropdown.value = g58.vars.defaultOptions[optionName].toString();
                }
            }
        }
        
        refreshOptions();
    })();
});
