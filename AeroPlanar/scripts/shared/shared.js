// shared
// Shared utilities and constants

"use strict";

window.s58 = window.s58 || {};

s58.shared = {};

s58.HALFPI  = 0.5 * Math.PI;
s58.PI      = 1.0 * Math.PI;
s58.PIHALF  = 1.5 * Math.PI;
s58.TWOPI   = 2.0 * Math.PI;
s58.THREEPI = 3.0 * Math.PI;
s58.FOURPI  = 4.0 * Math.PI;

window.addEventListener("error", function (event) {
    if (s58.vars && s58.vars.alertOnError) {
        alert("error: " + event.message);
    }
});

window.addEventListener("load", function () {
    window.addEventListener("deviceorientation", orientationHandler);
    window.addEventListener("devicemotion", motionHandler);
    
    function orientationHandler(event) {
        window.removeEventListener("deviceorientation", orientationHandler);
        s58.deviceOrientationDetected = event.absolute && (event.alpha || event.beta || event.gamma);
    }
    
    function motionHandler(event) {
        window.removeEventListener("devicemotion", motionHandler);
        s58.deviceMotionDetected = event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma;
    }
});

s58.getScreenOrientation = function () {
    switch(window.screen && window.screen.orientation && window.screen.orientation.type) {
        case "landscape-secondary":
            return { landscape: true, secondary: true, landscapeSecondary: true };
        case "portrait-secondary":
            return { portrait: true, secondary: true, portraitSecondary: true };
        case "landscape-primary":
            return { landscape: true, primary: true, landscapePrimary: true };
        default /* "portrait-primary" */:
            return { portrait: true, primary: true, portraitPrimary: true };
    }
};

s58.getOrientDimension = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
        case 270:
            return rotated;
        case 180:
        default:
            return standard;
    }
};

s58.getOrientCoordX = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
            return rotated;
        case 180:
            return -standard;
        case 270:
            return -rotated;
        default:
            return standard;
    }
};

s58.getOrientCoordY = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
            return -rotated;
        case 180:
            return -standard;
        case 270:
            return rotated;
        default:
            return standard;
    }
};

s58.isChrome = (function () {
    return window.navigator.userAgent.search("Chrome") >= 0;
})();

s58.isFirefox = (function () {
    return window.navigator.userAgent.search("Firefox") >= 0;
})();

s58.closeTo = function (value, compareValue) {
	return Math.abs(value - compareValue) <= s58.vars.closeTo;
};

s58.getSign = function (value) {
	return value && value > 0 ? 1 : -1;
};

s58.getSorted = function () {
    var i;
    var values = arguments.length > 1 ? arguments : arguments[0];
    var valuesCopy = [];
    for (i = 0; i < values.length; i++) {
        valuesCopy.push(values[i]);
    }
    return valuesCopy.sort(function (a, b) {
        return a > b;
    });    
};

s58.min = function () {
    var values = arguments.length > 1 ? arguments : arguments[0];
    return s58.getSorted(values)[0];
};

s58.max = function () {
    var values = arguments.length > 1 ? arguments : arguments[0];
    return s58.getSorted(values).reverse()[0];
};

s58.degToRad = function (degrees) {
	return (degrees || 0) / 180 * s58.PI;
};

s58.radToDeg = function (radians) {
	return (radians || 0) / s58.PI * 180;
};

// Returns an equivalent angle in the range -PI to +PI
s58.radPiToPi = function (radians) {
	radians = radians || 0;
	while (radians < s58.PI) {
		radians += s58.TWOPI;
	}
	while (radians > s58.PI) {
		radians -= s58.TWOPI;
	}
	return radians;
};

(function () {
    var lastWriteMs = new Date().valueOf();
    s58.pageConsoleWrite = function (text) {
        var utcNowMs = new Date().valueOf();
        if (utcNowMs >= lastWriteMs + s58.vars.pageConsoleIntervalMs) {
            document.getElementById("pageConsole").innerHTML = text;
            lastWriteMs = utcNowMs;
        }
    };
})();

s58.rgba = function () {
    var r = 0, g = 0, b = 0, a = 1.0;
    switch (arguments.length) {
        case 4:
            a = arguments[3];
        case 3:
            r = arguments[0];
            g = arguments[1];
            b = arguments[2];
            break;
        case 2:
            a = arguments[1];
        case 1:
            if (arguments[0].length == 4) {
                a = arguments[0][1];
            }
            if (arguments[0].length >= 3) {
                r = arguments[0][0];
                g = arguments[0][1];
                b = arguments[0][2];
            }
            else if (arguments[0].length == 1) {
                r = g = b = arguments[0][0];
            }
            else {
                r = g = b = arguments[0];
            }
            break;
        default:
            break;
    }
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
};

s58.rgbDarken = function (rgb, shade) {
    return s58.rgbBlend([0, 0, 0], rgb, (1 - shade));
};

s58.rgbLighten = function (rgb, shade) {
    return s58.rgbBlend(rgb, [255, 255, 255], shade);
};

s58.rgbBlend = function (minRgb, maxRgb, shade) {
    return s58.rgba(
        Math.ceil(minRgb[0] + shade * (maxRgb[0] - minRgb[0])),
        Math.ceil(minRgb[1] + shade * (maxRgb[1] - minRgb[1])),
        Math.ceil(minRgb[2] + shade * (maxRgb[2] - minRgb[2])));
};

s58.constructQueryStringParams = function (paramsObject) {
    var paramName, ampersand;
    var stringParams = "";
    for (paramName in paramsObject) {
        if (paramsObject[paramName] != null) {
            ampersand = stringParams ? "&" : "";
            stringParams += ampersand + encodeURIComponent(paramName) + "=" + encodeURIComponent(paramsObject[paramName]);
        }
    }
    return stringParams;
};

s58.getCurrentUrlWithReplacedQueryString = function (paramsObject) {
    var newQueryStringParams = s58.constructQueryStringParams(paramsObject);
    var newQueryString = newQueryStringParams ? "?" + newQueryStringParams : "";
    return location.search ?
        location.href.replace(location.search, newQueryString) :
        location.href + "?" + newQueryStringParams;
};

s58.parseQueryString = function () {
    var qs = window.location.search;
    var parsed = {};
    
    if (!qs.length) {
        return parsed;
    }
    
    qs.substring(1).split("&").forEach(function (stringParam, i) {
        var param = stringParam.split("=");
        var paramName = decodeURIComponent(param[0]);
        var paramValue = decodeURIComponent(param[1]);
        
        if (s58.parseFloat(paramValue) != null) {
            paramValue = s58.parseFloat(paramValue);
        }
        else if (paramValue == true.toString()) {
            paramValue = true;
        }
        else if (paramValue == false.toString()) {
            paramValue = false;
        }
        
        parsed[paramName] = paramValue;
    });
    
    return parsed;
};

s58.parseFloat = function (stringValue) {
    var floatValue = parseFloat(stringValue);
    return (floatValue || floatValue == 0) ? floatValue : null;
};

s58.floor = function (value, dp) {
    var factor = Math.pow(10, dp);
    return Math.floor(value * factor) / factor;
};

s58.padLeft = function (value, minLength, padCharacter) {
    padCharacter = padCharacter || " ";
    var stringValue = value.toString();
    while (stringValue.length < minLength) {
        stringValue = padCharacter + stringValue;
    }
    return stringValue;
};

s58.formatOrdinal = function (intValue) {
    switch (intValue % 100) {
        case 11:
        case 12:
        case 13:
            return intValue + "th";
        default:
            switch (intValue % 10) {
                case 1:
                    return intValue + "st";
                case 2:
                    return intValue + "nd";
                case 3:
                    return intValue + "rd";
                default:
                    return intValue + "th";
            }
    }
};

s58.getFlash = function (min, max, referenceMs, periodMs) {
    var value = min + (referenceMs % periodMs) * 2 * (max - min) / periodMs;
    return (value <= max) ? value : 2 * max - value;
};
