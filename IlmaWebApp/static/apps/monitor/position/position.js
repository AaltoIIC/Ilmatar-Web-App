
if (typeof positionMonitorQuery === "undefined") {var positionMonitorQuery = new XMLHttpRequest();}

$(function() {
    "use strict";
    console.log("Position");

    if (typeof autoUpdate === "undefined") {var autoUpdate = false;}
    if (typeof dataUpdateInterval === "undefined") {var dataUpdateInterval = 500;}

    // Setup auto update button
    $("#monitor").prepend($("<button>").attr("id", "autoUpdateButton").text("Off").addClass("btn btn-clr"));
    $("#monitor").prepend($("<span>").text("Auto update: ").addClass("mr-1"));
    $("#autoUpdateButton").on("click", function() {
        if (autoUpdate === false) {
            updatePosition();
            autoUpdate = setInterval(updatePosition, dataUpdateInterval);
            $("#autoUpdateButton").text("On");
        }
        else {
            clearInterval(autoUpdate);
            autoUpdate = false;
            $("#autoUpdateButton").text("Off");
        } 
    });

    buildPositionTable();
    updatePosition();
});

function buildPositionTable() {

    $("#monitor").append(`
        <table id="positionTable">
            <tbody>
                <tr>
                    <td>Hoist</td>
                    <td id="hoistPos"> -- </td>
                    <td>mm</td>
                </tr>
                <tr>
                    <td>Trolley</td>
                    <td id="trolleyPos"> -- </td>
                    <td>mm</td>
                </tr>
                <tr>
                    <td>Bridge</td>
                    <td id="bridgePos"> -- </td>
                    <td>mm</td>
                </tr>
            </tbody>
        </table>
    `);

    $("#monitor > #positionTable").addClass(`
        table
        table-sm
        table-dark
        table-borderless
        mt-2
        mb-0
        rounded
        opacity8
        shadow
    `);

}

function updatePosition() {

    let server = "Ilmatar"
    let positionHoist = "ns=7;s=scf.plc.dx_custom_v.status.hoist.position.position_mm";
    let positionTrolley = "ns=7;s=scf.plc.dx_custom_v.status.trolley.position.position_mm";
    let positionBridge = "ns=7;s=scf.plc.dx_custom_v.status.bridge.position.position_mm";
    let query = `
        query{
            Hoist: node(server: "${server}", nodeId: "${positionHoist}") {variable{value}}
            Trolley: node(server: "${server}", nodeId: "${positionTrolley}") {variable{value}}
            Bridge: node(server: "${server}", nodeId: "${positionBridge}") {variable{value}}
        }
    `;

    if (positionMonitorQuery.readyState == 4 || positionMonitorQuery.readyState == 0) {
        positionMonitorQuery.open('POST', apiUrl);
        positionMonitorQuery.setRequestHeader('Content-Type', 'application/json');
        positionMonitorQuery.onload = function() {
            res = JSON.parse(positionMonitorQuery.response);
            if (res.errors) {console.log(res); return false;}
            else if (positionMonitorQuery.status === 200) {
                printPosition(res.data.Hoist, res.data.Trolley, res.data.Bridge);
            }
            else {return false;}
        };
        positionMonitorQuery.send(JSON.stringify({query}));
    }
}

function printPosition(hoist, trolley, bridge) {

    $("#hoistPos").text(hoist.variable.value);
    $("#trolleyPos").text(trolley.variable.value);
    $("#bridgePos").text(bridge.variable.value);
    
}