/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 *
 * Based on https://code.google.com/p/foxtrick/source/browse/trunk/bootstrap.js?r=11216
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var _gLoader;
let scope;

Cu.import('resource://gre/modules/Services.jsm');

var windowListener = {
    onOpenWindow: function(aWindow) {
        // Wait for the window to finish loading
        let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        domWindow.addEventListener('load', function() {
                domWindow.removeEventListener('load', arguments.callee, false);
                _gLoader.loadIntoWindow(domWindow, false);
            }, false);
    },
    onCloseWindow: function(aWindow) { },
    onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
    _gLoader = {};
    // load specific startup stripts
    Services.scriptloader.loadSubScript('chrome://timeshift/content/bootstrap-firefox.js', _gLoader, 'UTF-8');

    let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

    // Load into any existing windows
    let enumerator = wm.getEnumerator('navigator:browser');
    while (enumerator.hasMoreElements()) {
        let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
        _gLoader.loadIntoWindow(win, true); //reload
    }

    // Load into any new windows
    wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes made
    if (aReason == APP_SHUTDOWN)
        return;

    let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

    // Stop listening for new windows
    wm.removeListener(windowListener);

    // Unload from any existing windows
    let windows = wm.getEnumerator('navigator:browser');
    while (windows.hasMoreElements()) {
        let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        _gLoader.unloadFromWindow(win);
    }

    // Flush string bundle cache
    Cc['@mozilla.org/intl/stringbundle;1']
        .getService(Components.interfaces.nsIStringBundleService).flushBundles();

    // destroy scopes
    _gLoader = undefined;
    scope = undefined;
}

function install() {}

function uninstall() {}
