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

Timeshift.prefs.site = function(number, site, offset, format, order) {
    this.site = site;
    this.offset = offset;
    this.format = format;
    this.order = order;
    return this;
};

Timeshift.prefs.reader = function() {
    // Create sites list array
    var count = 0;
    Timeshift.prefs.sites = new Array();
    Timeshift.prefs.prefSites = Timeshift.prefs.getCharPref("Sites");
    if(Timeshift.prefs.prefSites != "")
    {
        // Handle old style sites preferences
        if(Timeshift.prefs.prefSites.indexOf('.HEADER.') > 0)
        {
            var posHeader = Timeshift.prefs.prefSites.lastIndexOf('.HEADER.');
            var optHeaderVer = 1;
            if(posHeader > 0)
            {
                var optHeader = Timeshift.prefs.prefSites.split('.HEADER.')[0];  // Get the header
                optHeaderVer = optHeader.valueOf();
                Timeshift.prefs.prefSites = Timeshift.prefs.prefSites.substring(posHeader+8);  // Strip the header from the pref
            }
            var optSites = Timeshift.prefs.prefSites.split('.NEXT.');
            for (var i=0; i < optSites.length; i++)
            {
                var optSitesPieces = optSites[i].split('.ITEM.');
                // Updates any existing sites pref to the latest version (added in 0.0.3)
                if(optHeaderVer == 2)
                {
                    Timeshift.prefs.sites[Timeshift.prefs.count] = new Timeshift.prefs.site(Timeshift.prefs.count++, optSitesPieces[0], optSitesPieces[1], optSitesPieces[2], optSitesPieces[3]);
                } else if(optHeaderVer == 1)
                {
                    Timeshift.prefs.sites[Timeshift.prefs.count] = new Timeshift.prefs.site(Timeshift.prefs.count++, optSitesPieces[0], optSitesPieces[1], optSitesPieces[2], '0');
                }
            }
        }
        // Handle new style sites preferences
        else
        {
            Timeshift.prefs.sites = JSON.parse(Timeshift.prefs.prefSites);
        }
    }
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
