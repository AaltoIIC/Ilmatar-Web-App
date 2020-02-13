$(function() {
    "use strict";

    buildControlTable();

    // Needs to be Float type for OPC UA server
    let speed = 100;

    let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    let fontColor = getComputedStyle(document.documentElement).getPropertyValue('--font-color');
    let darkFontColor = getComputedStyle(document.documentElement).getPropertyValue('--dark-font-color');
    let contentBackground = getComputedStyle(document.documentElement).getPropertyValue('--content-background');

    let marvelmindQuery = new XMLHttpRequest()
    let craneCalibrateQuery = new XMLHttpRequest()
    let calibrateQuery = new XMLHttpRequest()
    let craneQuery = new XMLHttpRequest()

    var craneLocationCalibrated = [0,0,0]

    var intervalMarvelmind

    $(".direction").on("mousedown touchstart", function() {
      $(this).removeClass("border-bottom").removeClass("shadow").removeClass("opacity8");
      $(this).addClass("btn-clr");


      intervalMarvelmind = setInterval(moveMarvelmind, 100, marvelmindQuery, craneQuery, craneLocationCalibrated);

    }).on('mouseup mouseleave touchend touchcancel', function() {
      $(this).removeClass("btn-clr")
      $(this).addClass("border-bottom").addClass("shadow").addClass("opacity8");

      clearInterval(intervalMarvelmind)
      stopCrane()
    });


    $(".calibrate").on("mousedown touchstart", function() {
      $(this).removeClass("border-bottom").removeClass("shadow").removeClass("opacity8");
      $(this).addClass("btn-clr");
      console.log("Started calibrating");
      calibrate(calibrateQuery, craneQuery, craneLocationCalibrated)

    }).on('mouseup mouseleave touchend touchcancel', function() {
      $(this).removeClass("btn-clr")
      $(this).addClass("border-bottom").addClass("shadow").addClass("opacity8");
    });




});

function buildControlTable() {

    $("#control").append(
      $("<table>").attr("id", "marvelmindTable").append(
        $("<tr>").append(
          $("<td>"
            ).attr("id", "move"
            ).attr("class", "direction"
            ).text("drive_eta"
          )
        ).append(
          $("<td>"
            ).attr("id", "calibrate"
            ).attr("class", "calibrate genericButton ml-3"
            ).text("explore"
          )
        )
      )
    );

    $("#marvelmindTable td").addClass(`
      material-icons
      rounded
      border-0
      shadow
      opacity8
    `)
}


function calibrateCrane(craneCalibrateQuery, craneLocationCalibrated) {

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



    if (craneCalibrateQuery.readyState == 4 || craneCalibrateQuery.readyState == 0) {
        craneCalibrateQuery.open('POST', apiUrl);
        craneCalibrateQuery.setRequestHeader('Content-Type', 'application/json');
        craneCalibrateQuery.onload = function() {
            res = JSON.parse(craneCalibrateQuery.response);
            if (res.errors) {console.log(res); return false;}
            else if (craneCalibrateQuery.status === 200) {
                craneLocationCalibrated[0] = res.data.Bridge.variable.value
                craneLocationCalibrated[1] = res.data.Trolley.variable.value
                craneLocationCalibrated[2] = res.data.Hoist.variable.value
            }
            else {return false;}
        };
        craneCalibrateQuery.send(JSON.stringify({query}));
    }
}


function craneLocation(craneQuery, craneLocationCalibrated, dataMarvelMind){

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




  if(craneQuery.readyState === 4 || craneQuery.readyState === 0){
    craneQuery.open('POST', apiUrl);
    craneQuery.setRequestHeader('Content-Type', 'application/json');
    craneQuery.onload = function(){
      if(this.status == 200){

        var res = JSON.parse(this.response)





        var x = craneLocationCalibrated[0] - res.data.Bridge.variable.value
        var y = craneLocationCalibrated[1] - res.data.Trolley.variable.value
        var z = craneLocationCalibrated[2] - res.data.Hoist.variable.value

        console.log("crane x:" + x)
        console.log("crane y:" + y)
        console.log("crane z:" + z)
        console.log("marvelMind x:" + dataMarvelMind[0] * 1000)
        console.log("marvelMind y:" + dataMarvelMind[1] * 1000)
        console.log("marvelMind z:" + dataMarvelMind[2] * 1000)

        var diffrenceX = - x - dataMarvelMind[0] * 1000
        var diffrenceY = y - dataMarvelMind[1] * 1000
        var diffrenceZ = z - dataMarvelMind[2] * 1000




        if(diffrenceX > 20){
          console.log("bridge backward")
          speed = diffrenceX / 20
          moveCrane("bridge", "backward", speed)
        }
        else if(diffrenceX < -20){
          console.log("bridge forward")
          speed = diffrenceX / -20
          moveCrane("bridge", "forward", speed)
        }
        else{
          console.log("bridge stop")
          stop("bridge")
        }
        if(diffrenceY > 20){
          console.log("trolley forward")
          speed = diffrenceY / 20
          moveCrane("trolley", "forward", speed)
        }
        else if(diffrenceY < -20){
          console.log("trolley backward")
          speed = diffrenceY / -20
          moveCrane("trolley", "backward", speed)
        }
        else{
          console.log("trolley stop")
          stop("trolley")
        }

      }
      else{
        console.log("Error")
      }
    }

    craneQuery.onerror = function() {
      console.log("Error")
    }
    craneQuery.send(JSON.stringify({query}));
  }
}


function moveMarvelmind(marvelmindQuery, craneQuery, craneLocationCalibrated){

  if(marvelmindQuery.readyState === 4 || marvelmindQuery.readyState === 0){
    marvelmindQuery.open("GET", "http://192.168.0.78:7000/marvelmindPosition")

    marvelmindQuery.onload = function(){
      if(this.status == 200){


        var data = JSON.parse(this.responseText)

        craneLocation(craneQuery, craneLocationCalibrated, data)


      }
      else{
        console.log("Error")
      }
    }

    marvelmindQuery.onerror = function() {
      console.log("Error")
    }
    marvelmindQuery.send()

  }


}


function calibrate(calibrateQuery, craneCalibrateQuery, craneLocationCalibrated){
    calibrateCrane(craneCalibrateQuery, craneLocationCalibrated)
  /* if(calibrateQuery.readyState === 4 || calibrateQuery.readyState === 0){ */
    calibrateQuery.open("GET", "http://192.168.0.78:7000/calibrate")
    calibrateQuery.onload = function(){
      if(this.status == 200){
        var data = JSON.parse(this.responseText)

        console.log(data)

        }
        else{
            console.log("Error")
        }
      }

    calibrateQuery.onerror = function() {
        console.log("Error")
    }
    console.log("sending calibration query")
    calibrateQuery.send()

 /*  } */


}


function stop(part){
  var stopList = []
  if(part == "hoist")
    stopList = ["up", "down", "speed"]
  else
    stopList = ["forward", "backward", "speed"]
  let query = `
      mutation{
          a: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.${part}.${stopList[0]}", value: false) {ok}
          b: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.${part}.${stopList[1]}", value: false) {ok}
          c: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.${part}.${stopList[2]}", value: 0) {ok}
      }
  `;



  let moveQuery = new XMLHttpRequest();
  moveQuery.open('POST', apiUrl);
  moveQuery.setRequestHeader('Content-Type', 'application/json');
  //moveQuery.setRequestHeader('X-CSRFToken', csrf_token);
  moveQuery.onload = function() {
      res = JSON.parse(moveQuery.response);
      if (res.errors) { console.log(res); return false;}
      else if (moveQuery.status === 200) {return true;}
      else {return false;}
  };
  moveQuery.send(JSON.stringify({query}));
}


function stopCrane(){
  let query = `
      mutation{
          a: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.bridge.forward", value: false) {ok}
          b: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.bridge.backward", value: false) {ok}
          c: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.bridge.speed", value: 0) {ok}
          d: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.trolley.forward", value: false) {ok}
          e: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.trolley.backward", value: false) {ok}
          f: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.trolley.speed", value: 0) {ok}
          g: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.hoist.up", value: false) {ok}
          h: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.hoist.down", value: false) {ok}
          i: setValue(server: "Ilmatar", nodeId: "ns=7;s=scf.plc.dx_custom_v.controls.hoist.speed", value: 0) {ok}
      }
  `;

  let moveQuery = new XMLHttpRequest();
  moveQuery.open('POST', apiUrl);
  moveQuery.setRequestHeader('Content-Type', 'application/json');
  //moveQuery.setRequestHeader('X-CSRFToken', csrf_token);
  moveQuery.onload = function() {
      res = JSON.parse(moveQuery.response);
      if (res.errors) { console.log(res); return false;}
      else if (moveQuery.status === 200) {return true;}
      else {return false;}
  };

  moveQuery.send(JSON.stringify({query}));
}


function moveCrane(target, direction, speed=0) {
    var directionOpposite = ""
    if(direction == "forward")
      directionOpposite = "backward"
    else
      directionOpposite = "forward"
    console.log(directionOpposite)

    let server = "Ilmatar";
    let nodeIdDir = "ns=7;s=scf.plc.dx_custom_v.controls." + target + "." + direction;
    let nodeIdDirOpposite = "ns=7;s=scf.plc.dx_custom_v.controls." + target + "." + directionOpposite;
    let nodeIdSpd = "ns=7;s=scf.plc.dx_custom_v.controls." + target + ".speed";
    let move = false;
    let moveOpposite = false;
    speed = Math.max(speed, 10)
    if (speed > 0) {
        move = true;
    }
    let query = `
        mutation{
            directionOpposite: setValue(server: "${server}", nodeId: "${nodeIdDirOpposite}", value: ${moveOpposite}) {ok}
            direction: setValue(server: "${server}", nodeId: "${nodeIdDir}", value: ${move}) {ok}
            speed: setValue(server: "${server}", nodeId: "${nodeIdSpd}", value: ${speed}) {ok}
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
