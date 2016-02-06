// menu
// Menu page script

"use strict";

window.addEventListener("load", function() {
    var options = {
        cpuShipsN: null,
        map: null,
        enableMotionControl: null,
        antiAliasing: null,
        shading: null,
        sound: null,
        editCustomMap: null,
        customMap: null,
        menu: true
    };
        
    function refreshOptions() {
        var optionName, dropdown;
        for (optionName in options) {
            dropdown = document.getElementById(optionName);
            if (dropdown) {
                options[optionName] = dropdown.value;
            }
        }
        document.getElementById("go").href = "Game.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("home").href = "Home.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("info").href = "Info.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("menu").href = "Menu.htm?" + s58.constructQueryStringParams(options);
        
        if (document.origin != "null") {
            // condition avoids Chrome error when using file protocol
            window.history.replaceState(null, "", "Menu.htm?" + s58.constructQueryStringParams(options));
        }
    }
    
    (function () {
        var i;
        var queryOptions = s58.parseQueryString();
        
        if (queryOptions.editCustomMap) {
            document.getElementById("customMapItem").hidden = false;
        }
        
        if (queryOptions.editCustomMap || queryOptions.customMap) {
            var customMapOption = document.createElement("option");
            customMapOption.value = "custom";
            queryOptions.customMap = ((queryOptions.customMap || "").trim() || JSON.stringify(g58.flagMaps.customTemplate));
            customMapOption.text = JSON.parse(queryOptions.customMap).title || "Custom";
            document.getElementById("map").appendChild(customMapOption);
        }
        
        queryOptions.customMap = (queryOptions.customMap || "")
            .replace(/,"/g, ",\n\"")
            .replace(/\[\[\[/g, "[\n[[")
            .replace(/\]\]\]/g, "]]\n]")
            .replace(/]],/g, "]],\n")
            .replace(/^{/, "{\n")
            .replace(/}$/, "\n}")
            .replace(/\n\n/, "\n");
        
        
        var optionName, dropdown;
        for (optionName in options) {
            dropdown = document.getElementById(optionName);
            if (dropdown) {
                dropdown.addEventListener("change", refreshOptions);
                if (queryOptions[optionName]
                        || queryOptions[optionName] === 0
                        || queryOptions[optionName] === false) {
                    document.getElementById(optionName).value = queryOptions[optionName].toString();
                }
                else if (g58.vars.defaultOptions[optionName]
                        || g58.vars.defaultOptions[optionName] === 0
                        || g58.vars.defaultOptions[optionName] === false) {
                    document.getElementById(optionName).value = g58.vars.defaultOptions[optionName].toString();
                }
            }
        }
        
        refreshOptions();
    })();
});
