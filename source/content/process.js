'use strict';
/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

if (!Timeshift)
    var Timeshift = {};
if (!Timeshift.process)
    Timeshift.process = {};

Timeshift.process.page = function(doc) {
    var siteShifted = false;

    // If options are set then continue
    if (Timeshift.prefs.optSet == true)
    {
        if (null != doc.location)
        {
            var thisSite = doc.location.href;
            for(var i=0; i < Timeshift.prefs.sites.length; i++)
            {
                if (thisSite.search(Timeshift.prefs.sites[i].site) > -1)
                {
                    Timeshift.process.findText(doc, Timeshift.prefs.sites[i]);  //  Start the search
                    siteShifted = true;
                    Timeshift.debug.trace('process', 90, doc.location.href, 'page');
                    break;
                }
            }
        }
        // If automatically convert HTML5 time tags to local time or site has been converted to use time tags
        if (Timeshift.prefs.optHtml5Auto || siteShifted)
        {
            Timeshift.process.convertTimeTags(doc)
        }
    }
};

// Loop through the document text nodes for evaluation
Timeshift.process.findText = function(doc, optSite) {
    var node = doc.body; // Get the body node (we don't want to stuff around with headers)
    var textNodes = doc.evaluate("//text()", node, null, 6, null);
    var textNode;
    var dateUTCmidnight = new Date();
    dateUTCmidnight.setUTCHours(0,0,0,0)
    var offsetSplit = optSite.offset.match(/([+-])(\d{1,2}):(\d{1,2})/i);
    var offsetMilliseconds = ((offsetSplit[2] *60*60*1000) + (offsetSplit[3] ? offsetSplit[3] *60*1000 : 0)) * (offsetSplit[1] == '-' ? -1 : 1);
    for (var i = 0; textNode = textNodes.snapshotItem(i); i++)
    {
        if (textNode.nodeValue.search(/\S/) > -1)  //  Only nodes with actual text
        {
            if (textNode.parentNode.nodeName != 'SCRIPT' && textNode.parentNode.nodeName != 'TIME')  //  Do not stuff with anything inside a script and ignore HTML5 <time> tags
            {
                Timeshift.process.replaceDates(doc, textNode, optSite, offsetMilliseconds, dateUTCmidnight);
            }
        }
    }
};

// Searches text nodes for dates and or times to shift
Timeshift.process.replaceDates = function(doc, node, optSite, offsetMilliseconds, dateUTCmidnight) {
    if (optSite.order == 0) // Order is Date/Time
    {
        var node_date = node.nodeValue.match(/(?:(?:(?:SUN|MON|TUE(?:S)?|WED(?:NES)?|THU(?:RS)?|FRI|SAT(?:UR)?)(?:DAY)?(?:&NBSP;|\s)*)?(?:\d{1,2}(?:\/\d{1,2}\/|(?:ST|ND|RD|TH|&NBSP;|\s)*(?:JAN(?:UARY)*|feb(?:RUARY)*|MAR(?:CH)*|APR(?:IL)*|MAY|JUN(?:E)*|JUL(?:Y)*|AUG(?:UST)*|SEP(?:T(?:EMBER)*)*|OCT(?:OBER)*|NOV(?:EMBER)*|DEC(?:EMBER)*)(?:&NBSP;|\s)*)\d{2,2}(?:\d{2,2})?)|\d{2,2}(?:\d{2,2})?-\d{2,2}-\d{2,2})(?:,|&NBSP;|\s)*(?:(?:\d{1,2}:){1,2}\d{1,2}(?:(?:&NBSP;|\s)*[AP]+M?)?)?|(?:(?:\d{1,2}:){1,2}\d{1,2}(?:(?:&NBSP;|\s)*[AP]+M?)?)/gi);  // Get the dates and or times from the node
    } else // Order is Time/Date
    {
        var node_date = node.nodeValue.match(/(?:(?:\d{1,2}:){1,2}\d{1,2}(?:(?:&NBSP;|\s)*[AP]+M?)?)?(?:,|&NBSP;|\s)*(?:(?:(?:SUN|MON|TUE(?:S)?|WED(?:NES)?|THU(?:RS)?|FRI|SAT(?:UR)?)(?:DAY)?(?:&NBSP;|\s)*)?(?:\d{1,2}(?:\/\d{1,2}\/|(?:ST|ND|RD|TH|&NBSP;|\s)*(?:JAN(?:UARY)*|feb(?:RUARY)*|MAR(?:CH)*|APR(?:IL)*|MAY|JUN(?:E)*|JUL(?:Y)*|AUG(?:UST)*|SEP(?:T(?:EMBER)*)*|OCT(?:OBER)*|NOV(?:EMBER)*|DEC(?:EMBER)*)(?:&NBSP;|\s)*)\d{2,2}(?:\d{2,2})?)|\d{2,2}(?:\d{2,2})?-\d{2,2}-\d{2,2})|(?:(?:\d{1,2}:){1,2}\d{1,2}(?:(?:&NBSP;|\s)*[AP]+M?)?)/gi);  // Get the dates and or times from the node
    }
    if (node_date != null)
    {
        for (var i = 0; i < node_date.length; i++)  // Loop through the dates and/or times
        {
            var newDate = "";
            node_date[i] = node_date[i].replace(/^(?:\s|&nbsp;)+/g, '').replace(/(?:\s|&nbsp;)+$/g, '');  //  Strip any leading or trailing white space characters the regexp may have picked up
            var stringDate = (dateUTCmidnight.getUTCMonth() + 1) + '\/' + dateUTCmidnight.getUTCDate() + '\/' + dateUTCmidnight.getUTCFullYear(); // Set base date to utc midnight "today"
            var shiftDate = false; // Only becomes true if there is a date to shift
            var node_date_part = node_date[i].match(/(\d{1,2})\/(\d{1,2})\/(\d{2,2}(?:\d{2,2})?)/);  //  Look for dd/mm/yy(yy) or mm/dd/yy(yy) dates
            if (node_date_part != null)
            {
                if (optSite.format == 2)  // If site uses US format
                {
                    stringDate = node_date_part[1] + '\/' + node_date_part[2] + '\/' + Timeshift.process.fixShortYear(node_date_part[3]);
                } else  // It uses non US
                {
                    stringDate = node_date_part[2] + '\/' + node_date_part[1] + '\/' + Timeshift.process.fixShortYear(node_date_part[3]);
                }
                shiftDate = true;
            } else
            {
                var node_date_part = node_date[i].match(/(\d{1,2})(?:ST|ND|RD|TH|&NBSP;|\s)*((?:JAN(?:UARY)*|feb(?:RUARY)*|MAR(?:CH)*|APR(?:IL)*|MAY|JUN(?:E)*|JUL(?:Y)*|AUG(?:UST)*|SEP(?:T(?:EMBER)*)*|OCT(?:OBER)*|NOV(?:EMBER)*|DEC(?:EMBER)*))(?:&NBSP;|\s)*(\d{2,2}(?:\d{2,2})?)/i);  //  Look for dd mmm(m) yy(yy) dates
                if (node_date_part != null)
                {
                    stringDate = node_date_part[1] + ' ' + node_date_part[2] + ' ' + Timeshift.process.fixShortYear(node_date_part[3]);
                    shiftDate = true;
                } else
                {
                    var node_date_part = node_date[i].match(/(\d{2,2}(?:\d{2,2})?)-(\d{2,2})-(\d{2,2})/);  //  Look for (yy)yy-mm-dd dates
                    if (node_date_part != null)
                    {
                        stringDate = node_date_part[2] + '\/' + node_date_part[3] + '\/' + Timeshift.process.fixShortYear(node_date_part[1]);
                        shiftDate = true;
                    }
                }
            }

            var shiftTime = false;  // Only becomes true if there is a time to shift
            var node_date_time_part = node_date[i].match(/((?:\d{1,2}:){1,2}\d{1,2})(?:(?:&NBSP;|\s)*([AP]+M?))?/i);  // Get the useful bits of the string
            if (node_date_time_part != null)
            {
                node_date_time_part.shift();  // Get rid of the whole time string from the array
                stringDate += ' ' + node_date_time_part.join(' ');  // Join the time back together with only a space between the time and the am/pm
                var node_date_time_precision = stringDate.split(':');  // Split the time so we can figure the precision
                var timePrecision = node_date_time_precision.length;  // The precision eg hh:mm or hh:mm:ss etc
                shiftTime = true;
            }

            stringDate += ' GMT'; // We are pretending to be working with UTC time
            var tempDate = new Date(stringDate);  // Create a javascript date

            // If there is no date then we need to figure out if the time was yesterday, today or tomorrow
            if (shiftDate == false)
            {
                var tempOffsetCheck = new Date(tempDate - offsetMilliseconds); // Take away the offset milliseconds
                var tempOffsetCheckDate = tempOffsetCheck.getUTCDate();
                var tempDateDate = tempDate.getUTCDate();
                // Tomorrow
                if (tempOffsetCheckDate > tempDateDate)
                {
                    tempDate.setUTCDate(tempDateDate - 1)
                }
                // Yesterday
                else if (tempOffsetCheckDate < tempDateDate)
                {
                    tempDate.setUTCDate(tempDateDate + 1)
                }
            }

            newDate = tempDate.getUTCFullYear() + '-' + Timeshift.process.leadingZero(tempDate.getUTCMonth() + 1) + '-' + tempDate.getUTCDate(); // Create date part for datetime attribute

            // If there is a time part add that for the datetime attribute
            if (shiftTime == true)
            {
                var tempTime = 'T' + Timeshift.process.leadingZero(tempDate.getUTCHours()) + ':' + Timeshift.process.leadingZero(tempDate.getUTCMinutes());
                if (timePrecision >= 3)
                {
                    tempTime += ':' + Timeshift.process.leadingZero(tempDate.getUTCSeconds());
                }
                if (optSite.offset)
                {
                    tempTime += optSite.offset;
                }
                else
                {
                    tempTime += 'Z';
                }
                newDate += tempTime;
            }

            // Add time node to document
            var nodeBefore = node.nodeValue.substr(0, node.nodeValue.search(node_date[i]));  // Get the text before the date/time
            var nodeBeforeText = doc.createTextNode(nodeBefore);  // Create a new node with the text before date/time
            node.parentNode.insertBefore(nodeBeforeText, node);  // Add the new node before the current node
            var newNode = doc.createElement('time');  // Create a new time node
            newNode.setAttribute('datetime', newDate);  // Add the datetime attribute
            var newNodeText = doc.createTextNode(node_date[i]);  // Create a new node with the existing date/time
            newNode.appendChild(newNodeText);  // Add the new node to the time node
            node.parentNode.insertBefore(newNode, node);  // Add the time node before the current node
            node.nodeValue = node.nodeValue.replace(nodeBefore + node_date[i], '');  // Delete the data in the new nodes from the current node
        }
    }
};

// Convert HTML5 <time> tags
Timeshift.process.convertTimeTags = function(doc) {
    var node = doc.body; // Get the body node (we don't want to stuff around with headers)
    var timeNodes = doc.evaluate("//time", node, null, 6, null);
    var timeNode;
    for (var i = 0; timeNode = timeNodes.snapshotItem(i); i++)
    {
        var tempDateTime = timeNode.getAttribute('datetime');

        var tempDate = new Date(Date.parse(tempDateTime));

        // If we are showing old time on mouseover
        if (Timeshift.prefs.optShowOld)
        {
            timeNode.setAttribute('title', timeNode.textContent);
        }

        // Create the string which will replace the original date and time
        var newDate = Timeshift.process.formatDate(tempDate);  // Format it
        if (tempDateTime.match(/T/i))  // If there is a time component
        {
            newDate += ' ' + Timeshift.process.formatTime(tempDate, 3);  // Format it
        }

        // Replace the original date and time with the new one
        timeNode.textContent = newDate;
    }

    // Set the timeshift attribute for the tab to shifted
    if (timeNodes.snapshotItem(0)) {
        Timeshift.setDocShifted (doc, "shifted");
        Timeshift.debug.trace('process', 80, doc.location.href, 'convertTimeTags');
    }
};

// Formats a date to the required format
Timeshift.process.formatDate = function(sourceDate) {
    var sourceDay = sourceDate.getDate();
    var sourceMonth = sourceDate.getMonth() + 1;
    var sourceYear = sourceDate.getFullYear();
    if (Timeshift.prefs.optDateFormat == 1)
    {
        var dateReturn = Timeshift.process.leadingZero(sourceDay) + '\/' + Timeshift.process.leadingZero(sourceMonth) + '\/' + sourceYear;
    } else if (Timeshift.prefs.optDateFormat == 2)
    {
        var dateReturn = sourceDay + '\u00a0' + Timeshift.process.MonthReturn(sourceMonth, 'abbr') + '\u00a0' + sourceYear;
    } else if (Timeshift.prefs.optDateFormat == 3)
    {
        var dateReturn = sourceDay + '\u00a0' + Timeshift.process.MonthReturn(sourceMonth, 'full') + '\u00a0' + sourceYear;
    } else if (Timeshift.prefs.optDateFormat == 4)
    {
        var dateReturn = sourceYear + '-' + Timeshift.process.leadingZero(sourceMonth) + '-' + Timeshift.process.leadingZero(sourceDay);
    } else if (Timeshift.prefs.optDateFormat == 5)
    {
        var dateReturn = Timeshift.process.leadingZero(sourceMonth) + '\/' + Timeshift.process.leadingZero(sourceDay) + '\/' + sourceYear;
    }
    return dateReturn;
};

// Formats a time to the required format
Timeshift.process.formatTime = function(sourceTime, timePrecision) {
    var timeHours = sourceTime.getHours();
    var timeEnd = '';
    if (Timeshift.prefs.optTimeFormat == 2)
    {
        timeEnd += '\u00a0';
        if (timeHours < 12)
        {
            timeEnd += Timeshift.process.TimeAMPM('am');
        } else
        {
            timeHours = timeHours - 12;
            timeEnd += Timeshift.process.TimeAMPM('pm');
        }
        if (timeHours == 0)
        {
            timeHours = 12;
        }
    }
    var timeReturn = Timeshift.process.leadingZero(timeHours) + ':' + Timeshift.process.leadingZero(sourceTime.getMinutes());
    if (timePrecision >= 3)
    {
        timeReturn += ':' + Timeshift.process.leadingZero(sourceTime.getSeconds());
        if (sourceTime.getMilliseconds() > 0)
        {
            timeReturn += '.' + sourceTime.getMilliseconds();
        }
    }
    timeReturn += timeEnd;
    return timeReturn;
};

// If the year is expressed as 06 instead of 2006 then fix that
Timeshift.process.fixShortYear = function(sourceYear) {
    var sourceReturn = String(sourceYear);
    if (sourceReturn.length <= 2) // if it is a short year
    {
        if (Number(sourceYear) < 80)  //  Use 1980 as the cut off for 19's
        {
            sourceReturn = '20' + sourceReturn;
        } else
        {
            sourceReturn = '19' + sourceReturn;
        }
    }
    return sourceReturn;
};

// Add a leading zero to single digit numbers eg 5 becomes 05
Timeshift.process.leadingZero = function(sourceNumber) {
    var tempNumber = '00' + String(sourceNumber);
    var returnNumber = tempNumber.substr(tempNumber.length - 2);
    return returnNumber;
};

// Get local month names
Timeshift.process.MonthReturn = function(sourceMonth, sourceType) {
    return Timeshift.locale.getString('month_' + String(sourceMonth) + '_' + sourceType);
};

// Get local am/pm names
Timeshift.process.TimeAMPM = function(sourceType) {
    return Timeshift.locale.getString('time_' + sourceType);
};

