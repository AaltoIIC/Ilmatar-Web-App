
if (typeof sensorMonitorQuery === "undefined") {var sensorMonitorQuery = new XMLHttpRequest();}
if (typeof sensorListParentNodeId === "undefined") {var sensorListParentNodeId = "";}
if (typeof monitoredList === "undefined") {var monitoredList = {};}
if (typeof sensorList === "undefined") {var sensorList = {};}
if (typeof autoUpdate === "undefined") {var autoUpdate = false;}
if (typeof dataUpdateInterval === "undefined") {var dataUpdateInterval = 500;}

$(function () {
    "use strict";
    console.log("Custom");

    $("#monitor").append($("<div>").attr("id", "customNav").attr("class", "d-flex"))

    // Setup auto update data button
    $("#customNav").append($("<span>").text("Auto update: ").addClass("mr-1"));
    $("#customNav").append($("<button>").attr("id", "autoUpdateButton").text("Off").addClass("btn btn-clr mr-auto"));

    $("#autoUpdateButton").on("click", function() {
        if (autoUpdate === false) {
            updateData();
            autoUpdate = setInterval(updateData, dataUpdateInterval);
            $("#autoUpdateButton").text("On");
        }
        else {
            clearInterval(autoUpdate);
            autoUpdate = false;
            $("#autoUpdateButton").text("Off");
        } 
    });

    // First get availabe sensors from OPC UA server
    getSensorList("Ilmatar", sensorListParentNodeId)

});

function updateData() {

    let monitoredCount = 0;
    let query = "query{";
    for (const [name, item] of Object.entries(monitoredList)) {
        query = query + name +
        `: node(server: "${item.server}", nodeId: "${item.nodeId}") {variable{ value }} `;
        monitoredCount++;
    }
    query = query + "}";
    if (monitoredCount > 0) {
        if (sensorMonitorQuery.readyState == 4 || sensorMonitorQuery.readyState == 0) {
            sensorMonitorQuery.open('POST', apiUrl);
            sensorMonitorQuery.setRequestHeader('Content-Type', 'application/json');
            sensorMonitorQuery.onload = function() {
                res = JSON.parse(sensorMonitorQuery.response);
                if (res.errors) { console.log(res); return false;}
                else if (sensorMonitorQuery.status === 200) {printData(res.data);}
                else {return false;}
            };
            sensorMonitorQuery.send(JSON.stringify({query}));
        }
    }
}

function printData(data) {
    $("#customTable tr").remove();
    for (const [name, node] of Object.entries(data)) {
        let tableRow = $("<tr>");
        let value = node.variable.value;
        if (Number(value) === value && value % 1 !== 0) {
            value = value.toFixed(3);
        }
        tableRow.append($("<td>").text(name.split("_")[0]).attr("class", "monitoredName").css("word-break", "break-all"));
        tableRow.append($("<td>").text(value).attr("class", "monitoredValue"));
        tableRow.append($("<td>").text(name.split("_")[1]).attr("class", "monitoredUnit"));
        tableRow.append($("<td>").text("X"
            ).attr("class", "monitoredDelete rounded dngr-clr align-self-center"
            ).css({
                "min-width" : "20%",
                "cursor" : "pointer",
                "font-weight" : "bold",
                "text-align" : "center",
                "vertical-align" : "middle"
            })
        );
        $("#customTable").append(tableRow);
    }
}

function getSensorList(server, nodeId) {
    let query = `query{node(server: "${server}", nodeId: "${nodeId}") { variableSubNodes {server nodeId path}}}`;
    if (Object.keys(sensorList).length === 0) {
        console.log("Retrieving sensors from OPC UA server...");
        $("#customNav").append($("<div>").addClass("loader"));

        let sensorListQuery = new XMLHttpRequest();
        sensorListQuery.open('POST', apiUrl);
        sensorListQuery.setRequestHeader('Content-Type', 'application/json');
        sensorListQuery.onload = function() {
            res = JSON.parse(sensorListQuery.response);

            if (res.errors) {
                console.log(res); return false;
            }
            else if (sensorListQuery.status === 200) {
                console.log("Success");
                let values = Object.values(res.data.node.variableSubNodes);
                values.forEach(function (item) {
                    let pathList = item.path.split("/");
                    pathList = pathList.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                    let name = pathList.join("");
                    sensorList[name] = {
                        "server": item.server,
                        "nodeId": item.nodeId
                    };
                });
                buildSensorDropdown();
            }
            else {
                console.log("No sensors could be retrieved"); return false;
            }
            $("#customNav .loader").remove();
        };
        sensorListQuery.send(JSON.stringify({query}));

    } else {
        buildSensorDropdown();
        $("#customNav .loader").remove();
    }
}

function buildSensorDropdown() {
    // Setup dropdown list

    $("#customNav").append(
        $("<div>").attr("id", "sensorDrowdown").attr("class", "dropdown show").append(
            $("<button>"
                ).attr("class", "btn dropdown-toggle"
                ).attr("id", "dropdownMenuButton"
                ).attr("type", "button"
                ).attr("data-toggle", "dropdown"
                ).attr("aria-haspopup", "true"
                ).attr("aria-hasexpanded", "true"
                ).text("Add sensor"
            )
        ).append(
            $("<div>"
                ).attr("id", "sensorDropdownItems"
                ).attr("class", "dropdown-menu dropdown-menu-right pre-scrollable shadow"
                ).css({
                    "width": "100vw",
                    "max-width": "700px"
                }
            )
        )
    );

    for (const [name, item] of Object.entries(sensorList)) {
        if (!(name in monitoredList)) {
            $("#sensorDropdownItems").append(
                $("<a>").attr("class", "sensorItem dropdown-item").text(name)
            );
        }
    }

    $("#sensorDropdownItems").on("click", ".sensorItem", function() {
        let name = $(this).text();
        monitoredList[name] = sensorList[name];
        updateData();
        $(".sensorItem").filter(function() {
            return $(this).text() === name;
        }).remove();
    });

    // Setup sensor data table
    $("#monitor").append($("<table>").attr("id", "customTable").addClass("table table-dark table-sm table-borderless mt-2 mb-0 w-100 rounded opacity8 shadow"));
    $("#customTable").on("click", ".monitoredDelete", function() {
        let unit = $(this).siblings(".monitoredUnit").text();
        let name = $(this).siblings(".monitoredName").text();
        if (unit !== "") {
            name =  name + "_" + unit;
        }
        delete monitoredList[name];
        $(this).parent().remove();
        $("#sensorDropdownItems").prepend(
            $("<a>").attr("class", "sensorItem dropdown-item").text(name)
        );
    });

    if (Object.keys(monitoredList).length > 0) {
        updateData();
    }
}