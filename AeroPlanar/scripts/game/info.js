// info
// Info page script

"use strict";

window.addEventListener("load", function() {
    document.getElementById("home").href = "Home.htm" + location.search;
    document.getElementById("info").href = "Info.htm" + location.search;
    document.getElementById("menu").href = "Menu.htm" + location.search;
});
