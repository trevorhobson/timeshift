'use strict';
/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const Cu = Components.utils;
Cu.import('resource://gre/modules/Services.jsm');

var timeshiftOptions = {
    timeshiftPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.timeshift."),
    stringsBundle: '',
    dateFormatText: [],
    dateOrderText: [],
    sites: [],
    count: 0,
    sitesTree: null,

    sitesTreeView:
    {
        rowCount: 0,
        setTree: function(tree) {},
        getImageSrc: function(row, column) {},
        getProgressMode: function(row, column) {},
        getCellValue: function(row, column) {},
        getCellText: function(row, column) {
            var rv="";
            if (column.id=="siteCol")
            {
                rv = timeshiftOptions.sites[row].site;
            }
            else if (column.id=="offsetCol")
            {
                rv = timeshiftOptions.sites[row].offset + ' ';
            }
            else if (column.id=="formatCol")
            {
                rv = timeshiftOptions.dateFormatText[timeshiftOptions.sites[row].format];
            }
            else if (column.id=="orderCol")
            {
                rv = timeshiftOptions.dateOrderText[timeshiftOptions.sites[row].order];
            }
            return rv;
        },
        isSeparator: function(index) {return false;},
        isSorted: function() {return false;},
        isContainer: function(index) {return false;},
        cycleHeader: function(aColId, aElt) {},
        getRowProperties: function(row, props) {},
        getColumnProperties: function(column, props) {},
        getCellProperties: function(row, column, props) {},
    },

    site: function(number, site, offset, format, order)
    {
        this.site = site;
        this.offset = offset;
        this.format = format;
        this.order = order;
        return this;
    },

    init: function()
    {
        // Read string bundle set
        timeshiftOptions.stringsBundle = document.getElementById('string-bundle');
        timeshiftOptions.dateFormatText[0] = timeshiftOptions.stringsBundle.getString('formatMenu_Global');
        timeshiftOptions.dateFormatText[1] = timeshiftOptions.stringsBundle.getString('formatMenu_Good');
        timeshiftOptions.dateFormatText[2] = timeshiftOptions.stringsBundle.getString('formatMenu_Bad');
        timeshiftOptions.dateOrderText[0] = timeshiftOptions.stringsBundle.getString('orderMenu_Date');
        timeshiftOptions.dateOrderText[1] = timeshiftOptions.stringsBundle.getString('orderMenu_Time');

        // Reference the sites tree
        timeshiftOptions.sitesTree = document.getElementById('sitesTree');

        // Create sites list tree
        timeshiftOptions.count = 0;
        timeshiftOptions.sites = new Array();
        Services.scriptloader.loadSubScript('chrome://timeshift/content/prefs-generic.js', this.owner, 'UTF-8');
        var prefString = timeshiftOptions.timeshiftPrefs.getCharPref('Sites');
        timeshiftOptions.sites = Timeshift.prefsGeneric.sites(prefString);
        timeshiftOptions.count = timeshiftOptions.sites.length;
        timeshiftOptions.sitesTreeView.rowCount = timeshiftOptions.sites.length;
        timeshiftOptions.sitesTree.view = timeshiftOptions.sitesTreeView;
    },

    // Edits the currently selected Site
    editSite: function()
    {
        var selectedIndex = timeshiftOptions.sitesTree.currentIndex;

        // Only do somthing if a Site is selected
        if(selectedIndex != -1)
        {
            timeshiftOptions.populateEdit(timeshiftOptions.sites[selectedIndex].site, timeshiftOptions.sites[selectedIndex].offset, timeshiftOptions.sites[selectedIndex].format, timeshiftOptions.sites[selectedIndex].order, selectedIndex);
        }
    },

    // Called when a Site has been created/modified
    saveSite: function()
    {
        var sitesInput = document.getElementById("sitesField").value;
        var offsetInput = document.getElementById("offsetField").value;
        var formatInput = document.getElementById("formatField").value;
        var orderInput = document.getElementById("orderField").value;
        var editIndex = document.getElementById("editIndex").value;

        if(sitesInput == "" || offsetInput == "" || formatInput == "" || orderInput == "")
        {
            alert(timeshiftOptions.stringsBundle.getString('siteError'));
            return;
        }

        if(editIndex == "")
        {
            timeshiftOptions.sites[timeshiftOptions.count] = new timeshiftOptions.site(timeshiftOptions.count++, sitesInput, offsetInput, formatInput, orderInput);
        } else
        {
            timeshiftOptions.sites[editIndex] = new timeshiftOptions.site(editIndex, sitesInput, offsetInput, formatInput, orderInput);
        }
        timeshiftOptions.sitesTreeView.rowCount = timeshiftOptions.sites.length;
        timeshiftOptions.sitesTree.view = timeshiftOptions.sitesTreeView;
        timeshiftOptions.saveSitesList();
        timeshiftOptions.cancelSite();
    },

    // Save the sites List to the preference.
    saveSitesList: function()
    {
        var sitesPref = document.getElementById("sites");
        var prefObj = {};
        prefObj.version = "3";
        prefObj.sites = timeshiftOptions.sites;
        var prefString = JSON.stringify(prefObj);
        sitesPref.value = prefString;
    },

    // Moves the selected item up/down one place
    move: function(dir)
    {
        var selectedIndex = timeshiftOptions.sitesTree.currentIndex;
        if(selectedIndex != -1)
        {
            if(dir == "up" && selectedIndex > 0)
            {
                var nextIndex = selectedIndex - 1;
            } else if(dir == "down" && selectedIndex < timeshiftOptions.sites.length - 1) {
                var nextIndex = selectedIndex + 1;
            } else {
                return;
            }
            [timeshiftOptions.sites[selectedIndex], timeshiftOptions.sites[nextIndex]] = [timeshiftOptions.sites[nextIndex], timeshiftOptions.sites[selectedIndex]];  // Swap the array items
            timeshiftOptions.sitesTree.view.selection.select(nextIndex);  // Select the original item in the tree
            timeshiftOptions.sitesTree.treeBoxObject.ensureRowIsVisible(nextIndex)  // Make sure the selected item is visible
            timeshiftOptions.sitesTree.treeBoxObject.invalidate();  // Refresh the tree
            timeshiftOptions.saveSitesList();  // Save the current order
            timeshiftOptions.cancelSite();  // Cancel any editing
        }
    },

    //Deletes the currently selected Site
    deleteSite: function()
    {
        var selectedIndex = timeshiftOptions.sitesTree.currentIndex;

        if(selectedIndex != -1)
        {
            var removed = timeshiftOptions.sites.splice(selectedIndex, 1);
            timeshiftOptions.count--;
            timeshiftOptions.sitesTreeView.rowCount = timeshiftOptions.sites.length;
            timeshiftOptions.sitesTree.view = timeshiftOptions.sitesTreeView;
            timeshiftOptions.saveSitesList();
            timeshiftOptions.cancelSite();
        }
    },

    // Called to Clear the Site Editor.
    cancelSite: function()
    {
        timeshiftOptions.populateEdit("","","","","");
    },

    // Populates Site Editor with the given info
    populateEdit: function (site, offset, format, order, editIndexStr)
    {
        document.getElementById("sitesField").value = "" + site;
        document.getElementById("offsetField").value = "" + offset;
        document.getElementById("formatField").value = "" + format;
        document.getElementById("orderField").value = "" + order;
        document.getElementById("editIndex").value = "" + editIndexStr;
        document.getElementById("sitesField").focus();
    },
}
