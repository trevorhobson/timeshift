'use strict';
/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.prefs)
    Timeshift.prefs = {};

Timeshift.prefs.branch = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.timeshift.");
Timeshift.prefs.sites = [];
Timeshift.prefs.prefSites = '';
Timeshift.prefs.optDateFormat = '';
Timeshift.prefs.optTimeFormat = '';
Timeshift.prefs.optShowOld = false;
Timeshift.prefs.optSet = false;
Timeshift.prefs.optHtml5Auto = false;

Timeshift.prefs.observer = {
    register: function()
    {
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        this._branch = prefService.getBranch("extensions.timeshift.");
        if("nsIPrefBranch2" in Ci)
        {
            this._branch.QueryInterface(Ci.nsIPrefBranch2);
        }
        this._branch.addObserver("", this, false);
    },

    unregister: function()
    {
        if(!this._branch) return;
        this._branch.removeObserver("", this);
    },

    observe: function(aSubject, aTopic, aData)
    {
        if(aTopic == "nsPref:changed")
        {
            Timeshift.prefs.reader();
        }
    }
};

Timeshift.prefs.reader = function() {
    // Create sites list array
    Timeshift.prefs.prefSites = Timeshift.prefs.getCharPref("Sites");
    Timeshift.prefs.sites = Timeshift.prefsGeneric.sites(Timeshift.prefs.prefSites);

    // Read date and time format options
    Timeshift.prefs.optDateFormat = Timeshift.prefs.getCharPref("DateFormat");
    Timeshift.prefs.optTimeFormat = Timeshift.prefs.getCharPref("TimeFormat");
    Timeshift.prefs.optShowOld = Timeshift.prefs.getBoolPref("ShowOld");
    Timeshift.prefs.optHtml5Auto = Timeshift.prefs.getBoolPref("Html5Auto");
    if (Timeshift.prefs.optDateFormat && Timeshift.prefs.optTimeFormat)
    {
        Timeshift.prefs.optSet = true;
    } else
    {
        Timeshift.prefs.optSet = false;
    }
};

Timeshift.prefs.getCharPref = function(pref) {
    try {
        return Timeshift.prefs.branch.getCharPref(pref);
    } catch (err) {
        return null;
    }
};

Timeshift.prefs.getBoolPref = function(pref) {
    try {
        return Timeshift.prefs.branch.getBoolPref(pref);
    } catch (err) {
        return null;
    }
};

Timeshift.prefs.getIntPref = function(pref) {
    try {
        return Timeshift.prefs.branch.getIntPref(pref);
    } catch (err) {
        return null;
    }
};
