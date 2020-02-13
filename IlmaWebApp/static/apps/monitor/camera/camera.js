
$(function() {
    "use strict";
    console.log("Camera");

    let camUrl = "http://10.213.1.171/mjpg/video.mjpg";

    $("#monitor").append(
        $("<img>", {
        id: "craneCam",
        scrolling: "no",
        src: camUrl,
        alt: "camera not reachable at " + camUrl
        })
    );

    $("img").on("error", function(){
        console.log("Camera not reachable");
    });
});