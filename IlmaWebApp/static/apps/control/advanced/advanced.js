
if (typeof latencies === "undefined") {var latencies = [];}

$(function() {
    "use strict";

    createLatencyTestUI();

    var times;

    $("#latencyTest").on("click", async function() {
        times = $("#latencyTestNumber").val();
        latencies = [];
        for (let i = 0; i < times; i++) {
            lagRequest();
            await sleep(100);
        }
    });

    $("#copy").on("click", function() {
        var copy = document.getElementById("latencyResult");
        copy.select();
        copy.setSelectionRange(0, 99999);
        document.execCommand("copy");
    });

    $("#clearResult").on("click", function() {
        $("#latencyResult").val("");
    });

    $("#stopTest").on("click", function() {
        times = 0;
    });

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createLatencyTestUI () {

    $("#control").append(
        $("<input>"
            ).attr("type", "text"
            ).attr("id", "latencyTestNumber"
            ).attr("class", "form-control mr-2 w-75"
            ).attr("placeholder", "Number of write requests"
        )
    );
    $("#control").append($("<div>"));
    $("#control div").append($("<button>").attr("id", "latencyTest").text("Test"));
    $("#control div").append($("<button>").attr("id", "stopTest").text("Stop"));
    $("#control div").append($("<button>").attr("id", "copy").text("Copy results"));
    $("#control div").append($("<button>").attr("id", "clearResult").text("Clear"));
    $("#control").append($("<textarea>").attr("id", "latencyResult").css("word-break", "break-all").attr("class", "w-100"));

    $("#control div > button").attr("class", "btn mr-1 mt-2 mb-2")
}

function lagRequest() {

    let server = "Ilmatar";
    let nodeId1 = "ns=7;s=scf.plc.dx_custom_v.controls.watchdog";
    let nodeId2 = "ns=7;s=scf.plc.dx_custom_v.controls.accesscode";
    /* let server = "TestServer";
    let nodeId1 = "ns=2;i=77";
    let nodeId2 = "ns=2;i=88"; */
    let query = `
        mutation{
            direction: setValue(server: "${server}", nodeId: "${nodeId1}", value: 222, dataType: "Int16") {ok}
            speed: setValue(server: "${server}", nodeId: "${nodeId2}", value: 0, dataType: "Int32") {ok}
        }
    `;

    let startTime = Date.now();
    let latencyQuery = new XMLHttpRequest();
    latencyQuery.open('POST', apiUrl);
    latencyQuery.timeout = 500;
    latencyQuery.setRequestHeader('Content-Type', 'application/json');
    latencyQuery.onload = function() {
        res = JSON.parse(latencyQuery.response);
        if (res.errors) {
            console.log(res);
            return false;}
        else if (latencyQuery.status === 200) {
            let time = Date.now() - startTime;
            latencies.push(time);
            $("#latencyResult").val(latencies);
        }
        else {
            return false;
        }
    };
    latencyQuery.send(JSON.stringify({query}));
}