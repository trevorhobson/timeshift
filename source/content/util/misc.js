'use strict';
/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};

// Process existing tabs (used when Timeshift is enabled)
Timeshift.processTabs = function(window) {
    var tabbrowser = window.getBrowser();

    // Check each tab of this browser instance
    var numTabs = tabbrowser.browsers.length;
    for (var index = 0; index < numTabs; index++) {
        var currentBrowser = tabbrowser.getBrowserAtIndex(index);
        Timeshift.process.page(currentBrowser.contentDocument);
    }
};

// Reload Timeshift tabs (used to revert tabs when Timeshift is disabled)
Timeshift.revert = function() {
    var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
                 .getService(Components.interfaces.nsIWindowMediator);
    var browserEnumerator = wm.getEnumerator('navigator:browser');

    // Check each browser instance
    while (browserEnumerator.hasMoreElements()) {
        var browserWin = browserEnumerator.getNext();
        var tabbrowser = browserWin.getBrowser();

        // Check each tab of this browser instance
        var numTabs = tabbrowser.browsers.length;
        for (var index = 0; index < numTabs; index++) {
            var currentBrowser = tabbrowser.getBrowserAtIndex(index);
            if (currentBrowser.hasAttribute("timeshift")) {
                currentBrowser.removeAttribute("timeshift");
                currentBrowser.reload();
                Timeshift.debug.trace('util/misc', 60, currentBrowser.currentURI.spec, 'revert');
            }
        }
    }
};

// Set the timeshift attribute
Timeshift.setDocShifted = function(doc, status) {
    var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
                 .getService(Components.interfaces.nsIWindowMediator);
    var browserEnumerator = wm.getEnumerator('navigator:browser');

    // Check each browser instance for our document
    while (browserEnumerator.hasMoreElements()) {
        var browserWin = browserEnumerator.getNext();
        var tabbrowser = browserWin.getBrowser();
        var docBrowser = tabbrowser.getBrowserForDocument(doc);
        docBrowser.setAttribute("timeshift", status);
    }
};
