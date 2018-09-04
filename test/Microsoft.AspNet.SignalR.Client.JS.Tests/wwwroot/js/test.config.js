﻿// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

(function ($, window) {
    // If we're being run in Karma
    if (window.__karma__) {
        // Try to set the testUrl based on the args
        const args = window.__karma__.config.args;

        for (let i = 0; i < args.length; i += 1) {
            switch (args[i]) {
                case "--server":
                    i += 1;
                    window.document.testUrl = args[i];
                    break;
            }
        }
    }

    if (!window.document.testUrl) {
        window.document.testUrl = 'auto';
    }

    function failConnection() {
        $("iframe").each(function () {
            var loadEvent;

            if (this.stop) {
                this.stop();
            } else {
                try {
                    cw = this.contentWindow || this.contentDocument;
                    if (cw.document && cw.document.execCommand) {
                        cw.document.execCommand("Stop");
                    }
                }
                catch (e) {
                    console.log("Network Mock Error occurred, unable to stop iframe.  Message = " + e.message);
                }
            }

            if (window.document.createEvent) {
                loadEvent = window.document.createEvent("Event");
                loadEvent.initEvent("load", true, true);
            } else {
                loadEvent = window.document.createEventObject();
                loadEvent.eventType = "load";
            }

            if (this.dispatchEvent) {
                this.dispatchEvent(loadEvent);
            } else {
                this.fireEvent("onload", loadEvent);
            }
        });
    }

    // Configure masks to help mock foreverFrame transports and ajaxSends to be used for network mocking
    $.signalR.transports.foreverFrame.networkLoss = failConnection;
    $.network.mask.create($.signalR.transports.foreverFrame, ["networkLoss"], ["receive"]);
    $.network.mask.subscribe($.signalR.transports.foreverFrame, "started", failConnection);

})($, window);