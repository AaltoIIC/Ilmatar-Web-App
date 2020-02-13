
$(function() {
    "use strict";

    $(".monitorApp").on("click", function() {
        let appName = $(this).text().toLowerCase().replace(/\s/g, '');
        let appUrl = location.origin + "/static/apps/monitor/" + appName + "/" + appName;
        $("#monitor").empty();
        $("#monitor").append("<link rel='stylesheet' type='text/css' href=" + appUrl + ".css>");
        $.getScript(appUrl + ".js");
        $("#monitoredApp").text($(this).text());
    });

    $(".controlApp").on("click", function() {
        let appName = $(this).text().toLowerCase().replace(/\s/g, '');
        let appUrl = location.origin + "/static/apps/control/" + appName + "/" + appName;
        $("#control").empty();
        $("#control").append("<link rel='stylesheet' type='text/css' href=" + appUrl + ".css>");
        $.getScript(appUrl + ".js");
        $("#controlledApp").text($(this).text());
    });
});