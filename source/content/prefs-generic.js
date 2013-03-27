'use strict';
/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.prefsGeneric)
    Timeshift.prefsGeneric = {};

Timeshift.prefsGeneric.sites = function(rawPrefSites) {
    var returnSites = new Array();
    // Handle old style sites preferences
    if(rawPrefSites.indexOf('.HEADER.') > 0) {
        var posHeader = rawPrefSites.lastIndexOf('.HEADER.');
        var optHeaderVer = 1;
        if(posHeader > 0) {
            var optHeader = rawPrefSites.split('.HEADER.')[0];  // Get the header
            optHeaderVer = optHeader.valueOf();
            rawPrefSites = rawPrefSites.substring(posHeader+8);  // Strip the header from the pref
        }
        var optSites = rawPrefSites.split('.NEXT.');
        for (var i=0; i < optSites.length; i++) {
            var optSitesPieces = optSites[i].split('.ITEM.');
            // Updates any existing sites pref to the latest version (added in 0.0.3)
            if(optHeaderVer == 2) {
                returnSites[i] = new Timeshift.prefsGeneric.site(optSitesPieces[0], optSitesPieces[1], optSitesPieces[2], optSitesPieces[3]);
            } else if(optHeaderVer == 1) {
                returnSites[i] = new Timeshift.prefsGeneric.site(optSitesPieces[0], optSitesPieces[1], optSitesPieces[2], '0');
            }
        }
    }
    // Handle new style sites preferences
    else
    {
        var tempPrefSites = JSON.parse(rawPrefSites);
        if (tempPrefSites.version == 3) {
        }
        returnSites = tempPrefSites.sites;
    }
    return returnSites;
};

Timeshift.prefsGeneric.site = function(site, offset, format, order) {
    this.site = site;
    this.offset = offset;
    this.format = format;
    this.order = order;
    return this;
};
