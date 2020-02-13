
/*
Manages control access so that only one person at a time should
have control of the crane.
Communicates with the OPC UA server via a GraphQL API.

On control request:
Asks for a personal access code which is required for operating
the crane via the OPC UA server.
Checks if anyone else at the moment is controlling the crane from
app backend.
Starts up a watchdog runner, which increments a watchdog value on
the crane OPC UA server. Required for the crane to take control
commands.
Turns crane control options visible.

On control release:
Stops watchdog runner and hides crane controls.

Round indicator turns green once the crane is taking control
commands. This requires someone to press the dead-man's switch
on the crane's radio controller.

The control request query is easy to circumvent and in no way is
secure for serious applications. This is because javascript
communicates directly to the GraphQL API of the OPC UA server without
going through backend for access checks.
*/

let controlDriver = false;
let watchdogRunner = false;
let readingControls = false;
let watchdogWorker = undefined;
if (typeof accessCode === "undefined") {var accessCode = false;}

let dangerColor = $(":root").css("--danger");
let successColor = $(":root").css("--success");

$(function() {
    "use strict";

    $("#submitControlRequest").on("click", function() {

        $("#controlRequestAlert").addClass("d-none");

        accessCode = $("#accessCode").val();
        if (accessCode === "") {
            console.log("Nothing inputted to access code.")
        } else {
            accessCode = parseInt(accessCode);

            // Check if access code is valid and request control if it is
            console.log("AccessCode: " + accessCode);
            console.log("AccessCode is a number: " + !Number.isNaN(accessCode));
            if (!Number.isNaN(accessCode)) {
                console.log("AccessCode length is 8: " + (accessCode.toString().length === 8));
                if (accessCode.toString().length === 8) {
                    requestControl();
                } else {
                    alert("Access Code too short. Must be 8 numbers.");
                    accessCode = false;
                }
            } else {
                alert("AccessCode must be a number.");
                accessCode = false;
            }
        }
    });

    $("#releaseControl").on("click", function() {
        releaseControl();
    });

});

function requestControl() {
    console.log("Requesting control...");
    $.get({
        url: location.origin + "/requestcontrol",
        headers: {"X-CSRFToken": csrf_token},
        success: function(res) {
            res = JSON.parse(res);
            console.log("Control approved: " + res);
            if (res === true) {
                startControl();
                controlDriver = setInterval(controlLifeline, 8000);
            } else {
                $("#controlRequestAlert").removeClass("d-none");
                terminateControl();
            }
            return res;
        },
        error: function(res) {
            console.log(res);
            terminateControl();
            return false;
        }
    });
}

function releaseControl() {
    console.log("Releasing control...");
    $.get({
        url: location.origin + "/releasecontrol",
        headers: {"X-CSRFToken": csrf_token},
        success: function(res) {
            res = JSON.parse(res);
            console.log("Control released: " + res);
            terminateControl();
            return res;
        },
        error: function(res) {
            console.log(res);
            terminateControl();
            return false;
        }
    });
}

function controlLifeline() {
    $.get({
        url: location.origin + "/checkcontrol",
        headers: {"X-CSRFToken": csrf_token},
        success: function(res) {
            res = JSON.parse(res);
            console.log("Control permit: " + res);
            if (res !== true) {terminateControl();}
            return res;
        },
        error: function(res) {
            console.log(res);
            terminateControl();
            return false;
        }
    });
}

function startControl() {
    console.log("Starting control with Access Code: " + accessCode);

    if (typeof Worker !== "undefined") {
        if (typeof watchdogWorker === "undefined") {
            console.log("Starting watchdog worker...");
            watchdogWorker = new Worker("static/js/watchdog.js");
            watchdogWorker.postMessage({
                "accessCode": accessCode,
                "apiUrl": apiUrl,
                "readingControls": readingControls
            });
            watchdogWorker.addEventListener('message', function(msg) {
                readingControls = msg.data;
                if (readingControls === true) {
                    $("#readingControl").css("background-color", successColor);
                    $('#control').removeClass("notReadingControl").addClass("readingControl");
                }
                else if (readingControls === false) {
                    $("#readingControl").css("background-color", dangerColor);
                    $('#control').removeClass("readingControl").addClass("notReadingControl");
                }
            });
        }
    } else if (watchdogRunner === false) {
        console.log("Watchdog started");
        watchdogRunner = setInterval(watchdog, 250, accessCode);
    }

    $("#controlHeader").addClass("d-none");
    $("#controlledApp").removeClass("d-none");
    $("#readingControl").removeClass("d-none");
    $('#control').removeClass("readingControl").addClass("notReadingControl");
    $("#requestControl").removeClass("d-flex").addClass("d-none");
    $("#releaseControl").removeClass("d-none");
    $("#controlDropdown").removeClass("d-none");
    $("#control").removeClass("d-none");
}

function terminateControl() {
    if (controlDriver !== false) {
        console.log("Terminating control");
        clearInterval(controlDriver);
        controlDriver = false;
    }
    if (typeof Worker !== "undefined") {
        if (typeof watchdogWorker !== "undefined") {
            console.log("Terminating watchdog worker");
            watchdogWorker.terminate();
            watchdogWorker = undefined;
        }
    }
    if (watchdogRunner !== false) {
        console.log("Terminating watchdog");
        clearInterval(watchdogRunner);
        watchdogRunner = false;
    }

    $("#controlHeader").removeClass("d-none");
    $("#controlledApp").addClass("d-none");
    $("#readingControl").addClass("d-none");
    $('#control').removeClass("readingControl").addClass("notReadingControl");
    $("#requestControl").removeClass("d-none").addClass("d-flex");
    $("#releaseControl").addClass("d-none");
    $("#controlDropdown").addClass("d-none");
    $("#control").addClass("d-none");
}