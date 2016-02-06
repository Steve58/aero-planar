// misc
// Miscellaneous

"use strict";

window.g58 = window.g58 || {};

g58.misc = {};

g58.misc.setUpPageScroll = function () {
    var pageWrapperElement = document.getElementById("gamePageWrapper");
    var navElement = document.getElementById("gameNav");
    var pageConsoleElement = document.getElementById("pageConsole");
    
    // Abort if likely to use touch move control
    if (!g58.vars.enableMotionControl
            || !s58.deviceOrientationDetected
            || !s58.deviceMotionDetected) {
        return;
    }
    
    g58.misc.scrollPixels = Math.floor(window.innerHeight / 2) - navElement.clientHeight
    pageWrapperElement.style.marginTop = g58.misc.scrollPixels;
    
    if (pageWrapperElement.clientWidth < window.innerWidth) {
        // scrollbars are showing - cancel the extra height
        pageWrapperElement.style.marginTop = 0;
    }
    else if (s58.isFirefox && pageWrapperElement.clientWidth > window.innerWidth && window.innerWidth >= e58.vars.minBrowserWidthPx) {
        // Firefox has not zoomed correctly - reload for another attempt
        g58.misc.autoReload("Browser zoom level initialised incorrectly - zoom out to view");
    }
    else if (s58.isChrome) {
        // no scrollbars showing - keep the extra height to enable hiding the url bar on Chrome
        // (but not on Firefox as have not found a way to cancel touch scroll on canvas)
        navElement.style.paddingTop = g58.misc.scrollPixels;
        navElement.style.top = -g58.misc.scrollPixels;
        
        pageConsoleElement.style.paddingTop = g58.misc.scrollPixels;
        pageConsoleElement.style.top = -g58.misc.scrollPixels;
        
        navElement.addEventListener("touchend", g58.misc.scrollMenuUp);
        g58.misc.scrollMenuUp();
    }
    else {
        // default - cancel the extra height
        pageWrapperElement.style.marginTop = 0;
    }
};

g58.misc.autoReload = function (failureMessage) {
    var queryParams = s58.parseQueryString();
    var autoReloads = (queryParams.autoReloads || 0) + 1;
    if (autoReloads > g58.vars.maxAutoReloads) {
        alert(failureMessage);
    }
    else {
        queryParams.autoReloads = autoReloads;
        window.location = s58.getCurrentUrlWithReplacedQueryString(queryParams);
    }
};

g58.misc.scrollMenuUp = function () {
    var remainingScrollByY = Math.floor(g58.misc.scrollPixels / 2) - window.scrollY;
    g58.misc.scrollMenuUpByY = g58.misc.scrollMenuUpByY || Math.ceil(remainingScrollByY * g58.vars.scrollMenuIntervalMs / g58.vars.scrollMenuDurationMs);
    if (remainingScrollByY) {
        var scrollByY = Math.abs(remainingScrollByY) > Math.abs(g58.misc.scrollMenuUpByY) ?
            s58.getSign(remainingScrollByY) * Math.abs(g58.misc.scrollMenuUpByY) :
            remainingScrollByY;
        window.scrollBy(0, scrollByY);
        setTimeout(g58.misc.scrollMenuUp, g58.vars.scrollMenuIntervalMs);
    }
};
