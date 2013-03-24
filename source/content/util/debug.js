/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.debug)
    Timeshift.debug = {};

Timeshift.debug.tracePrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.timeshift.debug");
Timeshift.debug.level = 10;
Timeshift.debug.traceLevels = [];

Timeshift.debug.trace = function(traceDomain, traceLevel, stringMessage, stringCaller) {
Services.prompt.alert(null, "Timeshift", "Hello");
    if (stringCaller == undefined)
    {
        stringCaller = '';
    }
    if (!Timeshift.debug.traceLevels["--set--"])
    {
        Timeshift.debug.getLevel();
    }
    var traceDomainLevel = Timeshift.debug.traceLevels[traceDomain];
    traceDomainLevel = (traceDomainLevel != undefined) ? traceDomainLevel : 0;
    if (traceDomainLevel >= traceLevel || Timeshift.debug.level >= traceLevel)
    {
        var nsIConsoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);
        nsIConsoleService.logStringMessage('Timeshift:' + stringCaller + ' ' + traceDomain + '[' + traceLevel + '] ' + stringMessage);
    }
};

Timeshift.debug.getLevel = function() {
    // Get the debug level
    // Levels are: 10-Few alerts -> 999-Every alert
    Timeshift.debug.level = Timeshift.prefs.getIntPref("debugLevel") || 10;

    var allDebugTraceLevels = Timeshift.debug.tracePrefs.getChildList("", {});
    for (var i=0; i<allDebugTraceLevels.length; i++)
    {
        Timeshift.debug.traceLevels[allDebugTraceLevels[i]] = Timeshift.debug.tracePrefs.getIntPref(allDebugTraceLevels[i]);
    }
    Timeshift.debug.traceLevels["--set--"] = true;
};

