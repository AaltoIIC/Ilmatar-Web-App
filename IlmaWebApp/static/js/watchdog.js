
// Check if running in a Web worker and set required variables if so
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    var webWorker = true;
    onmessage = function(msg) {
        console.log('Watchdog worker started');
        apiUrl = msg.data.apiUrl;
        readingControls = msg.data.readingControls;
        setInterval(watchdog, 250, msg.data.accessCode);
    };
}

let watchdogQuery = new XMLHttpRequest();
let statusQuery = new XMLHttpRequest();

let watchdogNum = 1;

let server = "Ilmatar";
let nodeIdAC = "ns=7;s=scf.plc.dx_custom_v.controls.accesscode";
let nodeIdWD = "ns=7;s=scf.plc.dx_custom_v.controls.watchdog";
let nodeIdWDF = "ns=7;s=scf.plc.dx_custom_v.status.watchdogfault";
let nodeIdRC = "ns=7;s=scf.plc.dx_custom_v.status.readingcontrols";

let queryGetStatus = `
    {
        watchdogFault: node(server: "${server}", nodeId: "${nodeIdWDF}") {variable{value}}
        readingControls: node(server: "${server}", nodeId: "${nodeIdRC}") {variable{value}}
    }
`;

function watchdog(accessCode) {
    watchdogNum = (watchdogNum % 30000) + 1;
    let querySetValues = `
        mutation{
            accessCode: setValue(server: "${server}", nodeId: "${nodeIdAC}", value: ${accessCode}, dataType: "Int32") {ok}
            watchdog: setValue(server: "${server}", nodeId: "${nodeIdWD}", value: ${watchdogNum}, dataType: "Int16") {ok}
        }
    `;
    let query = querySetValues;

    if (watchdogQuery.readyState == 4 || watchdogQuery.readyState == 0) {
        watchdogQuery.open('POST', apiUrl);
        watchdogQuery.setRequestHeader('Content-Type', 'application/json');
        watchdogQuery.onload = function() {
            res = JSON.parse(watchdogQuery.response);
            if (res.errors) {console.log(res);}
        };
        watchdogQuery.send(JSON.stringify({query}));
    }

    checkStatus();
}

function checkStatus() {
    let query = queryGetStatus;

    if (statusQuery.readyState === 4 || statusQuery.readyState === 0) {
        statusQuery.open('POST', apiUrl);
        statusQuery.setRequestHeader('Content-Type', 'application/json');
        statusQuery.onload = function() {
            res = JSON.parse(statusQuery.response);

            if (res.errors) {
                console.log(res);
                readingControls = false;
            } else if (statusQuery.status === 200) {
                data = res.data;
                if (data.watchdogFault.variable.value === true) {
                    console.log("Watchdog fail");
                }
                if (data.readingControls.variable.value === true && readingControls == false) {
                    console.log("Reading controls");
                    readingControls = true;
                } else if (data.readingControls.variable.value === false && readingControls == true) {
                    console.log("Not reading controls");
                    readingControls = false;
                }
            } else {
                console.log("Connection to API failed");
                readingControls = false;
            }
        };
        statusQuery.send(JSON.stringify({query}));

        if (webWorker === true) {
            self.postMessage(readingControls);
        } else {
            if (readingControls === true) {
                $("#readingControl").css("background-color", "lightgreen");
            } else {
                $("#readingControl").css("background-color", "lightcoral");
            }
        }
    }
}