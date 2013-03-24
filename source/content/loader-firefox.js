'use strict';
/*
 * loader-firefox.js
 * Timeshift loader for Firefox/Seamonkey
 *
 * Based on https://code.google.com/p/foxtrick/source/browse/trunk/content/loader-firefox.js?r=r11166
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.loader)
    Timeshift.loader = {};
if (!Timeshift.loader.firefox)
    Timeshift.loader.firefox = {};

// invoked after the browser chrome is loaded
// variable *document* is predeclared and used here but means the
// browser chrome (XUL document)
Timeshift.loader.firefox.browserLoad = function() {
    try {
        var appcontent = document.getElementById('appcontent');
        if (appcontent) {
            // listen to page loads
            appcontent.addEventListener('DOMContentLoaded',
                                        Timeshift.loader.firefox.DOMContentLoaded, true);
        }
    } catch (err) {
        Timeshift.debug.trace('loader-firefox', 10, 'firefox.browserLoad:', err);
    }
};

Timeshift.loader.firefox.browserUnLoad = function() {
    var appcontent = document.getElementById('appcontent');
    if (appcontent) {
        // remove listeners
        appcontent.removeEventListener('DOMContentLoaded',
                                       Timeshift.loader.firefox.DOMContentLoaded, true);

        // refresh pages
        Timeshift.revert();
    }
};

// invoked when DOMContentLoaded
Timeshift.loader.firefox.DOMContentLoaded = function(aEvent) {
    Timeshift.process.page(aEvent.originalTarget);
};
