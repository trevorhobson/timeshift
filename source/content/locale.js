/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.locale)
    Timeshift.locale = {};

var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
               .getService(Components.interfaces.nsIStringBundleService)
               .createBundle("chrome://timeshift/locale/timeshift.properties");

//get localised message
Timeshift.locale.getString = function(msg, args) { 
    if (args){
        args = Array.prototype.slice.call(arguments, 1);
        return bundle.formatStringFromName(msg,args,args.length);
    } else {
        return bundle.GetStringFromName(msg);
    }
};
