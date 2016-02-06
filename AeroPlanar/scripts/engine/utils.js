// utils
// utilities

"use strict";

window.e58 = window.e58 || {};

e58.utils = {};

// Returns an integer value if using integerPixels mode,
// otherwise returns non-rounded value
e58.utils.pixel = function (value) {
    return e58.vars.integerPixels ? Math.floor(value) : value;
};
