/*
 * Based on https://code.google.com/p/foxtrick/source/browse/trunk/content/bootstrap-firefox.js?r=r11351
 */

// wrapper for firefox bootstrap

const Cu = Components.utils;
Cu.import('resource://gre/modules/Services.jsm');

var TimeshiftFirefox = function(window) {
    this.owner = window;
};
TimeshiftFirefox.prototype = {
    scripts: [
        // loading Timeshift into window.Timeshift

        'prefs.js',
        'locale.js',
        'process.js',
        'util/debug.js',
        'util/misc.js',
        'loader-firefox.js'
    ],

    loadScript: function() {
        // loading Timeshift into window.Timeshift
        for (var i = 0; i < this.scripts.length; ++i)
        {
            Services.scriptloader.loadSubScript('chrome://timeshift/content/' +
                                                this.scripts[i], this.owner, 'UTF-8');
        }
    },

    init: function() {
        //load timeshift files
        this.loadScript();

        // Register the preference observer
        this.prefs.observer.register();

        // load the preferences
        this.prefs.reader();

        //init and add listeners
        this.loader.firefox.browserLoad();
    },

    cleanup: function() {
        // Unregister the preference observer
        this.prefs.observer.unregister();

        // remove listeners and css
        this.loader.firefox.browserUnLoad();
    },
};

// called from main bootstrap.js for each browser window
function loadIntoWindow(window, processTabs) {
    if (!window || !window.document) return;

    // only in content windows (not menupopups etc)
    if (!window.document.getElementById('appcontent')) return;

    // create & run
    try {
        window.Timeshift = new TimeshiftFirefox(window);
        window.Timeshift.init();
        if (processTabs) {
            window.Timeshift.processTabs(window);
        }
    } catch (e) {
        dump('Timeshift error: ' + e + '\n');
    }
}


function unloadFromWindow(window) {
    if (!window || !window.document) return;

    // only in content windows (not menupopups etc)
    if (!window.document.getElementById('appcontent'))
        return;

    // stop and delete
    window.Timeshift.cleanup();

/*  window.Timeshiftl10n = undefined;
    delete window.Timeshiftl10n;*/
    delete window.Timeshift;
}

