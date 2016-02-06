// webcam
// Webcam features

"use strict";

window.e58 = window.e58 || {};

e58.webcam = {};

e58.webcam.initialise = function (videoElement, canvasElement) {
    e58.webcam.videoElement = videoElement;
    e58.webcam.canvasElement = canvasElement;
    e58.webcam.canvasContext = canvasElement.getContext('2d');
    e58.webcam.maxima = [];
    e58.webcam.initialised = true;

    videoElement.width = videoElement.height = e58.vars.webcam.width;
    canvasElement.width = canvasElement.height = e58.vars.webcam.width;
};

e58.webcam.start = function () {
    e58.webcam.starting = true;
    
    // Detected webcam maxima, by sector according to settings
    e58.webcam.maxima = {};

    var videoElement = e58.webcam.videoElement;
    var canvasElement = e58.webcam.canvasElement;

    var constraints = { audio: false, video: true };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // console.log("navigator.mediaDevices.getUserMedia (promise syntax)");
        navigator.mediaDevices.getUserMedia(constraints)
            .then(onSuccess)
            .catch(function (error) {
                onError(error);
                e58.webcam.starting = true;
                // console.log("navigator.mediaDevices.getUserMedia");
                navigator.mediaDevices.getUserMedia(constraints, onSuccess, onError);
            });
    }
    else if (navigator.mozGetUserMedia) {
        // console.log("navigator.mozGetUserMedia");
        navigator.mozGetUserMedia(constraints, onSuccess, onError);
    }
    else if (navigator.webkitGetUserMedia) {
        // console.log("navigator.webkitGetUserMedia");
        navigator.webkitGetUserMedia(constraints, onSuccess, onError);
    }

    var pollWhetherRunningIntervalId;

    function onSuccess (stream) {
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();

        // Listening for data loaded is not working so far, so poll instead
        pollWhetherRunningIntervalId = setInterval(pollWhetherRunning, e58.vars.webcam.pollWhetherRunningMs);
    }

    function onError(error) {
        console.error(error);
        e58.webcam.starting = false;
    }

    function pollWhetherRunning() {
        if (videoElement.videoWidth && videoElement.videoHeight) {
            clearInterval(pollWhetherRunningIntervalId);

            // Adjust aspect ratio of elements to match video resolution now it is available
            var ratio = videoElement.videoWidth / videoElement.videoHeight;
            videoElement.height = Math.ceil(videoElement.width / ratio);
            canvasElement.height = Math.ceil(canvasElement.width / ratio);

            e58.webcam.sectorLimits = {
                xIn: 0.5 * e58.vars.webcam.gap,
                xOut: 0.5 - 0.25 * e58.vars.webcam.gap,
                yIn: 0.5 * e58.vars.webcam.gap / ratio,
                yOut: 1 / ratio
            };

            e58.webcam.running = true;
            e58.webcam.starting = false;
        }
    }
};

(function () {
    e58.webcam.refreshMaxima = function () {
        if (!e58.webcam.running || e58.webcam.processing) {
            return;
        }
        e58.webcam.processing = true;

        var propName;

        var videoElement = e58.webcam.videoElement;
        var canvasElement = e58.webcam.canvasElement;
        var canvasContext = e58.webcam.canvasContext;

        canvasContext.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

        var rgbaData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data;

        var rawMaxima = [];
        
        var i, j, rgbTotal, x, y, handled;
        for (i = rgbaData.length - 4; i >= 0; i = i - 4) {
            rgbTotal = rgbaData[i + 0] + rgbaData[i + 1] + rgbaData[i + 2];
            if (rgbTotal == 765) {
                x = (i / 4) % canvasElement.width;
                y = Math.floor((i / 4) / canvasElement.width);

                handled = false;
                for (j = rawMaxima.length - 1; j >= 0; j--) {
                    if (Math.sqrt((x - rawMaxima[j].x) * (x - rawMaxima[j].x) + (y - rawMaxima[j].y) * (y - rawMaxima[j].y)) < e58.vars.webcam.maximaResolution) {
                        rawMaxima[j].x = (x + rawMaxima[j].x * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                        rawMaxima[j].y = (y + rawMaxima[j].y * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                        rawMaxima[j].rgbTotal = (rgbTotal + rawMaxima[j].rgbTotal * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                        rawMaxima[j].pixelCount++;
                        handled = true;
                        break;
                    }
                }

                if (!handled) {
                    rawMaxima.push({ x: x, y: y, rgbTotal: rgbTotal, pixelCount: 1 });
                }
            }
        }

        var allMaxima = [];
        rawMaxima.forEach(function (rawMaximum, i) {
            allMaxima.push({
                x: s58.getOrientCoordX(
                    2 * (canvasElement.width / 2 - rawMaximum.x) / canvasElement.width,
                    2 * (canvasElement.height / 2 - rawMaximum.y) / canvasElement.width),
                y: s58.getOrientCoordY(
                    2 * (canvasElement.height / 2 - rawMaximum.y) / canvasElement.width,
                    2 * (canvasElement.width / 2 - rawMaximum.x) / canvasElement.width),
                value: rawMaximum.rgbTotal / 765,
                pixels: rawMaximum.pixelCount
            });
        });

        allMaxima.sort(function (a, b) {
            return a.pixels > b.pixels;
        });

        // console.log(allMaxima);

        
        // TODO: unfinished sector cases
        var limits = e58.webcam.sectorLimits;
        var sectoredMaxima = {};
        if (e58.vars.webcam.sectors.full) {
            sectoredMaxima.full =         getSectorMaximum(allMaxima, -1,              +1,                    -limits.yOut,    +limits.yOut);
        }
        // if (e58.vars.webcam.sectors.topLeft) {
            // sectoredMaxima.topLeft =      getSectorMaximum(allMaxima, -1,              -limits.xIn,           +limits.yIn,     +limits.yOut);
        // }
        if (e58.vars.webcam.sectors.topCentre) {
            sectoredMaxima.topCentre =    getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          +limits.yIn,     +limits.yOut);
        }
        // if (e58.vars.webcam.sectors.topRight) {
            // sectoredMaxima.topRight =     getSectorMaximum(allMaxima, +limits.xIn,     +1,                    +limits.yIn,     +limits.yOut);
        // }
        // if (e58.vars.webcam.sectors.bottomLeft) {
            // sectoredMaxima.bottomLeft =   getSectorMaximum(allMaxima, -1,              -limits.xIn,           -limits.yOut,    -limits.yIn);
        // }
        if (e58.vars.webcam.sectors.bottomCentre) {
            sectoredMaxima.bottomCentre = getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          -limits.yOut,    -limits.yIn);
        }
        // if (e58.vars.webcam.sectors.bottomRight) {
            // sectoredMaxima.bottomRight =  getSectorMaximum(allMaxima, +limits.xIn,     +1,                    -limits.yOut,    -limits.yIn);
        // }

        e58.webcam.maxima = sectoredMaxima;

        // console.log(e58.webcam.maxima);

        e58.webcam.processing = false;
    };

    function getSectorMaximum(allMaxima, xMin, xMax, yMin, yMax) {
        var i = 0
        var m;
        do {
            m = allMaxima[i++];
            if (m && m.x >= xMin && m.x <= xMax && m.y >= yMin && m.y <= yMax) {
                return {
                    x: (m.x - (xMax + xMin) / 2) * 2 / (xMax - xMin),
                    y: (m.y - (yMax + yMin) / 2) * 2 / (xMax - xMin)
                };
            }
        } while (m);

        return null;
    }
})();
