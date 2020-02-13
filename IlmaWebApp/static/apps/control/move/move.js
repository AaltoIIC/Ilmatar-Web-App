
$(function() {
    "use strict";

    buildControlTable();

    let speed = 100;

    $(".direction").on("mousedown touchstart", function() {
        $(this).removeClass("border-bottom").removeClass("shadow").removeClass("opacity8");
        $(this).addClass("btn-clr");

        let direction = $(this).attr("id");
        moveCrane(direction, true, speed);
    }).on('mouseup mouseleave touchend touchcancel', function() {
        $(this).removeClass("btn-clr")
        $(this).addClass("border-bottom").addClass("shadow").addClass("opacity8");

        let direction = $(this).attr("id");
        moveCrane(direction, false, speed);
    });

    $(".direction").contextmenu(function() {
        return false;
    });
});

function buildControlTable() {
    
    $("#control").append(`
        <table id="moveTable">
            <tbody>
                <tr>
                    <td></td>
                    <td id="left" class="direction">panorama_fish_eye</td>
                    <td></td>
                    <td></td>
                    <td id="up" class="direction">keyboard_arrow_up</td>
                </tr>
                <tr>
                    <td id="forward" class="direction">crop_square</td>
                    <td></td>
                    <td id="backward" class="direction">change_history</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td id="right" class="direction">crop_7_5</td>
                    <td></td>
                    <td></td>
                    <td id="down" class="direction">keyboard_arrow_down</td>
                </tr>
            </tbody>
        </table>
    `);

    $("#moveTable .direction").addClass(`
        material-icons
        rounded-circle
        border-bottom
        shadow
        opacity8
    `);

}

function moveCrane(direction, move=false, speed=0) {

    let target;

    if (["up", "down"].includes(direction)) {
        target = "hoist";
    }
    else if (["left", "right"].includes(direction)) {
        target = "trolley";
        if (direction === "left") {direction = "forward";}
        else {direction = "backward";}
    }
    else if (["forward", "backward"].includes(direction)) {
        target = "bridge";
    }
    else {
        return False;
    }

    let server = "Ilmatar";
    let nodeIdDir = "ns=7;s=scf.plc.dx_custom_v.controls." + target + "." + direction;
    let nodeIdSpd = "ns=7;s=scf.plc.dx_custom_v.controls." + target + ".speed";
    let query = `
        mutation{
            direction: setValue(server: "${server}", nodeId: "${nodeIdDir}", value: ${move}, dataType: "Boolean") {ok}
            speed: setValue(server: "${server}", nodeId: "${nodeIdSpd}", value: ${speed}, dataType: "Float") {ok}
        }
    `;

    let moveQuery = new XMLHttpRequest();
    moveQuery.open('POST', apiUrl);
    moveQuery.setRequestHeader('Content-Type', 'application/json');
    moveQuery.onload = function() {
        res = JSON.parse(moveQuery.response);
        if (res.errors) { console.log(res); return false;}
        else if (moveQuery.status === 200) {return res.data.direction.ok;}
        else {return false;}
    };
    moveQuery.send(JSON.stringify({query}));
}