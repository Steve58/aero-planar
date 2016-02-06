// audio
// Audio handler

"use strict";

window.e58 = window.e58 || {};

e58.audio = {
    context: new (window.AudioContext || window.webkitAudioContext)(),
    sounds: { /* Named sounds, each with play(options) and stopLoop(tag) functions */ },
    urls: {
        engine: "sounds/engine.ogg",
        wind: "sounds/wind.ogg",
        blip: "sounds/blip.ogg",
        peow: "sounds/peow.ogg"
    },
    defaultGain: 0.5,
    defaultTag: "defaultTag"
};

// Initialise sounds on window.load
window.addEventListener("load", function() {
    var audio = e58.audio;

    var soundName;
    for (soundName in audio.urls) {
        loadSound(soundName, audio.urls[soundName]);
    }

    function loadSound(soundName, soundUrl) {
        // set dummy values for use if sound initialisation fails
        audio.sounds[soundName] = { name: soundName };
        audio.sounds[soundName].play = function () { };
        audio.sounds[soundName].stopLoop = function () { };

        var request = new XMLHttpRequest();
        request.open("GET", soundUrl, /* async: */ true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            audio.context.decodeAudioData(request.response, function (buffer) {
                var sound = audio.sounds[soundName] = { name: soundName };

                audio.sounds[soundName].play = function (options) {
                    if (!e58.vars.sound.enable) {
                        return;
                    }

                    var tag = options.tag || e58.audio.defaultTag;
                    var soundTag = sound[tag] = sound[tag] || {};
                    var isNew = !soundTag.sourceNode || !soundTag.sourceNode.loop;
                    if (isNew) {
                        soundTag.sourceNode = e58.audio.context.createBufferSource();
                        soundTag.sourceNode.buffer = buffer;
                        soundTag.gainNode = e58.audio.context.createGain();
                        soundTag.sourceNode.onended = function () {
                            soundTag.sourceNode = soundTag.gainNode = null;
                        };
                    }

                    soundTag.sourceNode.loop = Boolean(options.loop);
                    soundTag.sourceNode.playbackRate.value = options.rate || 1.0;
                    soundTag.gainNode.gain.value = options.gain || e58.audio.defaultGain;

                    if (isNew) {
                        soundTag.sourceNode.connect(soundTag.gainNode);
                        soundTag.gainNode.connect(e58.audio.context.destination);
                        soundTag.sourceNode.start();
                        // console.log("new " + soundName + " " + tag + " played");


                        if (options.loop) {
                            var refSourceNode = soundTag.sourceNode;
                            refSourceNode.refId = Math.random();
                            soundTag.sourceNode.refId = refSourceNode.refId;

                            var cancelCheck = function () {
                                if (soundTag.sourceNode && soundTag.sourceNode.refId == refSourceNode.refId) {
                                    setTimeout(cancelCheck, e58.vars.soundLoopCheckMs)
                                    // console.log("Sound " + soundName + " " + tag + " cancel check - ok");
                                }
                                else if (refSourceNode.loop) {
                                    refSourceNode.loop = false;
                                    // console.log("Sound " + soundName + " " + tag + " cancel check - cancelled");
                                }
                                // else {
                                    // console.log("Sound " + soundName + " " + tag + " cancel check - already cancelled");
                                // }
                            };
                            cancelCheck();
                        }
                    }
                    else {
                        // console.log("current " + soundName + " " + tag + " playing refreshed");
                    }
                };

                audio.sounds[soundName].stopLoop = function (tag) {
                    tag = tag || e58.audio.defaultTagName;
                    if (sound[tag] && sound[tag].sourceNode) {
                        sound[tag].sourceNode.loop = false;
                        // console.log(sound.name + " " + tag + " loop stopped");
                    }
                }
            });
        };

        request.onerror = function () { };

        request.send();
    }
});
