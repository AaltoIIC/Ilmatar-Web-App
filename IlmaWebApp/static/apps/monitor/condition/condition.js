
$(function() {
    "use strict";

    buildConditionTable();
    getNodes("Ilmatar", "ns=7;s=scf.plc.dx_custom_v.conditionmonitoring");

});

function getNodes(server, nodeId) {

    let query = `query{node(server: "${server}", nodeId: "${nodeId}") { variableSubNodes {name variable{value dataType statusCode}}}}`;
    
    $.post({
        url: apiUrl,
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({query}),
        success: function(res) {
            printConditionData(res.data.node.variableSubNodes);
        },
        error: function(res) {
            console.log(res);
        }
    });
    
}

function buildConditionTable() {
    
    $("#monitor").append($("<table>").attr("id", "conditionTable"));

    $("#conditionTable").append($("<thead>"));
    $("#conditionTable").append($("<tbody>").attr("id", "conditionData"));

    $("#conditionTable thead").append($("<tr>"));
    //$("#conditionTable thead tr").append($("<th>").text("node path"));
    $("#conditionTable thead tr").append($("<th>").text("name"));
    $("#conditionTable thead tr").append($("<th>").text("value"));
    $("#conditionTable thead tr").append($("<th>").text("data type"));
    //$("#conditionTable thead tr").append($("<th>").text("source timestamp"));
    $("#conditionTable thead tr").append($("<th>").text("status code"));
}

function printConditionData(data) {

    $("#conditionData tr").remove();

    data.forEach((row) => {
        let tableRow = $("<tr>");
        tableRow.append($("<td>").text(row.name));
        tableRow.append($("<td>").text(row.variable.value));
        tableRow.append($("<td>").text(row.variable.dataType));
        tableRow.append($("<td>").text(row.variable.statusCode));
        $("#conditionData").append(tableRow);
    });
}