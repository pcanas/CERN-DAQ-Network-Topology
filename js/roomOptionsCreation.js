
function appendMapElements(roomId, roomOptions, boxElement) {
  appendDoors(roomId, roomOptions);
  appendElevators(roomId, roomOptions, boxElement);
  appendWalls(roomId, roomOptions, boxElement);
  appendStairs(roomId, roomOptions, boxElement);
}


/*
  Traverses the doors array and draws the doors.
  Door format is the following 'rack_position_rotation', where:
    - 'rack' is the rack location where the door should be
    - 'position' is where the door shall be located with respect to that rack
    - 'rotation' indicates if the door shall be rotated or not
*/
function appendDoors(roomId, roomOptions) {
  if (roomOptions && roomOptions.doors) {
    let cols = roomOptions.columns;
    let rows = roomOptions.rows;
    for (let i = 0; i < roomOptions.doors.length; i++) {
      let doorInfo = roomOptions.doors[i].split("_");
      let doorRack = doorInfo[0];
      let doorRackCoordinates = doorRack.split(".")[1];
      let doorColumn = doorRackCoordinates.split("-")[0];
      let doorRow = doorRackCoordinates.split("-")[1];
      let doorLocation = doorInfo[1];
      let doorRotation = doorInfo[2];


      // We will identify if the door is a wall or not. If it is a wall, the device will be slightly different due to the padding in the room
      if (doorLocation && (doorColumn > 0 && doorColumn <= cols) && (doorRow > 0 && doorRow <= rows)) {
        if (doorLocation === "left") {
          let isWall;
          if ((roomOptions.roomType === SDXROOMTYPE && doorColumn == cols) ||
            (roomOptions.roomType === USA15ROOMTYPE && doorColumn == 1)) isWall = true;
          else isWall = false;
          insertLeftDoor(roomId, doorRack, doorRotation, isWall);
        } else if (doorLocation === "right") {
          let isWall;
          if ((roomOptions.roomType === SDXROOMTYPE && doorColumn == 1) ||
            (roomOptions.roomType === USA15ROOMTYPE && doorColumn == cols)) isWall = true;
          else isWall = false;
          insertRightDoor(roomId, doorRack, doorRotation, isWall);
        } else if (doorLocation === "bottom") {
          let isWall;
          if ((roomOptions.roomType === SDXROOMTYPE && doorRow == rows) ||
            (roomOptions.roomType === USA15ROOMTYPE && doorRow == 1)) isWall = true;
          else isWall = false;
          insertBottomDoor(roomId, doorRack, doorRotation, isWall);
        } else if (doorLocation === "top") {
          let isWall;
          if ((roomOptions.roomType === SDXROOMTYPE && doorRow == 1) ||
            (roomOptions.roomType === USA15ROOMTYPE && doorRow == rows)) isWall = true;
          else isWall = false;
          insertTopDoor(roomId, doorRack, doorRotation, isWall);
        }
      }
    }
  }
}


// Defining the parameters for a left door insertion
function insertLeftDoor(roomId, doorRack, doorRotation, isWall) {
  let roomIdElement = $("#" + roomId);
  let doorRackElement = $("#" + formatNameForJQuery(doorRack));

  let arcOptions = {
    height: BOXHEIGHT,
    width: BOXWIDTH,
    x: 0,
    y: 0,
    radius: BOXHEIGHT - 2.5,
    startAngle: 146,
    endAngle: 180
  };
  let arcLeftLocation;
  if (isWall) arcLeftLocation = -parseFloat(roomIdElement.css("border-left-width"));
  else arcLeftLocation = doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("border-left-width"));
  let arcLocation = {
    top: doorRackElement.offset().top - roomIdElement.offset().top,
    left: arcLeftLocation
  };

  let entranceOptions = {
    height: BOXHEIGHT,
    width: 3,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: BOXHEIGHT - 2.5
  };
  let entranceLeftLocation;
  if (isWall) entranceLeftLocation = -parseFloat(roomIdElement.css("border-left-width"));
  else entranceLeftLocation = doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("border-left-width"));
  let entranceLocation = {
    top: doorRackElement.offset().top - roomIdElement.offset().top,
    left: entranceLeftLocation
  };

  if (doorRotation === "inverse") insertDoor(roomId, doorRack + "-left-" + doorRotation, arcOptions, arcLocation, entranceOptions, entranceLocation, "rotateX(180deg)");
  else insertDoor(roomId, doorRack + "-left", arcOptions, arcLocation, entranceOptions, entranceLocation);
}


// Defining the parameters for a right door insertion
function insertRightDoor(roomId, doorRack, doorRotation, isWall) {
  let roomIdElement = $("#" + roomId);
  let doorRackElement = $("#" + formatNameForJQuery(doorRack));

  let arcOptions = {
    height: BOXHEIGHT,
    width: BOXWIDTH,
    x: BOXWIDTH + 2,
    y: 0,
    radius: BOXHEIGHT - 2.5,
    startAngle: 180,
    endAngle: 214
  };
  let arcLeftLocation;
  if (isWall) arcLeftLocation = roomIdElement.innerWidth() - BOXWIDTH;
  else arcLeftLocation = doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("border-left-width"));
  let arcLocation = {
    top: doorRackElement.offset().top - roomIdElement.offset().top,
    left: arcLeftLocation
  };
  let entranceOptions = {
    height: BOXHEIGHT,
    width: 3,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: BOXHEIGHT - 2.5
  };
  let entranceLeftLocation;
  if (isWall) entranceLeftLocation = roomIdElement.innerWidth();
  else entranceLeftLocation = doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("border-left-width")) + BOXWIDTH;
  let entranceLocation = {
    top: doorRackElement.offset().top - roomIdElement.offset().top,
    left: entranceLeftLocation
  };

  if (doorRotation === "inverse") insertDoor(roomId, doorRack + "-right-" + doorRotation, arcOptions, arcLocation, entranceOptions, entranceLocation, "rotateX(180deg)");
  else insertDoor(roomId, doorRack + "-right", arcOptions, arcLocation, entranceOptions, entranceLocation);
}


// Defining the parameters for a top door insertion
function insertTopDoor(roomId, doorRack, doorRotation, isWall) {
  let roomIdElement = $("#" + roomId);
  let doorRackElement = $("#" + formatNameForJQuery(doorRack));

  let arcOptions = {
    height: BOXWIDTH,
    width: BOXHEIGHT + 3,
    x: 0,
    y: 0,
    radius: BOXHEIGHT,
    startAngle: 90,
    endAngle: 124
  };
  if (isWall) arcTopLocation = roomIdElement.innerHeight() - $(".racksContainer", "#" + roomId).outerHeight();
  else arcTopLocation = doorRackElement.offset().top - roomIdElement.offset().top - parseFloat(doorRackElement.css("border-top-width"));
  let arcLocation = {
    top: arcTopLocation,
    left: doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("margin-left"))
  };
  let entranceOptions = {
    height: 3,
    width: BOXHEIGHT,
    x1: 0,
    y1: 0,
    x2: BOXHEIGHT,
    y2: 0
  };
  if (isWall) entranceTopLocation = roomIdElement.innerHeight() - $(".racksContainer", "#" + roomId).outerHeight();
  else entranceTopLocation = doorRackElement.offset().top - roomIdElement.offset().top - parseFloat(doorRackElement.css("border-top-width"));
  let entranceLocation = {
    top: entranceTopLocation,
    left: doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("margin-left"))
  };

  if (doorRotation === "inverse") insertDoor(roomId, doorRack + "-top-" + doorRotation, arcOptions, arcLocation, entranceOptions, entranceLocation, "rotateY(180deg)");
  else insertDoor(roomId, doorRack + "-top", arcOptions, arcLocation, entranceOptions, entranceLocation);
}


// Defining the parameters for a bottom door insertion
function insertBottomDoor(roomId, doorRack, doorRotation, isWall) {
  let roomIdElement = $("#" + roomId);
  let doorRackElement = $("#" + formatNameForJQuery(doorRack));

  let arcOptions = {
    height: BOXWIDTH,
    width: BOXHEIGHT + 3,
    x: BOXHEIGHT + 3,
    y: BOXWIDTH + 2,
    radius: BOXHEIGHT,
    startAngle: 270,
    endAngle: 304
  };
  if (isWall) arcTopLocation = roomIdElement.innerHeight() - BOXWIDTH;
  else arcTopLocation = doorRackElement.offset().top - roomIdElement.offset().top - parseFloat(doorRackElement.css("border-top-width"));
  let arcLocation = {
    top: arcTopLocation,
    left: doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("margin-left"))
  };
  let entranceOptions = {
    height: 5,
    width: BOXHEIGHT,
    x1: 0,
    y1: 0,
    x2: BOXHEIGHT,
    y2: 0
  };
  if (isWall) entranceTopLocation = roomIdElement.innerHeight();
  else entranceTopLocation = doorRackElement.offset().top - roomIdElement.offset().top - parseFloat(doorRackElement.css("border-top-width")) + BOXHEIGHT - 1;
  let entranceLocation = {
    top: entranceTopLocation,
    left: doorRackElement.offset().left - roomIdElement.offset().left - parseFloat(doorRackElement.css("margin-left"))
  };

  if (doorRotation === "inverse") insertDoor(roomId, doorRack + "-bottom-" + doorRotation, arcOptions, arcLocation, entranceOptions, entranceLocation, "rotateY(180deg)");
  else insertDoor(roomId, doorRack + "-bottom", arcOptions, arcLocation, entranceOptions, entranceLocation);
}


/*
  Inserts a door drawing with the parameters given as arguments
  Door drawings have two components:
    - An dotted line arc filled with the room background color
    - An line (called entrance) which will hide the room border and one of the sides of the arc, to simulate a door
*/
function insertDoor(roomId, doorId, arcOptions, arcLocation, entranceOptions, entranceLocation, rotateValue) {
  $("#" + roomId).append( "<svg id='arc-door-" + doorId + "' class='arc-door-container' height='" + arcOptions.height + "' width='" + arcOptions.width + "'>" +
                            "<path class='arc-door' stroke='black' stroke-dasharray='7,7' stroke-width='2' d='" + describeArc(arcOptions.x, arcOptions.y, arcOptions.radius, arcOptions.startAngle, arcOptions.endAngle) + "' />" +
                          "</svg>" +
                          "<svg id='entrance-door-" + doorId + "' class='entrance-door-container' height='" + entranceOptions.height + "' width='" + entranceOptions.width + "'>" +
                            "<line class='entrance-door' x1='" + entranceOptions.x1 + "' y1='" + entranceOptions.y1 + "' x2='" + entranceOptions.x2 + "' y2='" + entranceOptions.y2 + "'/>" +
                          "</svg>"
  );
  let arcDoorElement = $("#arc-door-" + formatNameForJQuery(doorId));
  let entranceDoorElement = $("#entrance-door-" + formatNameForJQuery(doorId));

  arcDoorElement.css("top", arcLocation.top);
  arcDoorElement.css("left", arcLocation.left);
  entranceDoorElement.css("top", entranceLocation.top);
  entranceDoorElement.css("left", entranceLocation.left);

  if (rotateValue) {
    arcDoorElement.css("transform", rotateValue);
    entranceDoorElement.css("transform", rotateValue);
  }
}


/*
  Draws an arc with the parameters given as arguments
*/
function describeArc(x, y, radius, startAngleDegrees, endAngleDegrees) {
  let start = polarToCartesian(x, y, radius, endAngleDegrees);
  let end = polarToCartesian(x, y, radius, startAngleDegrees);

  let arcSweep = endAngleDegrees - startAngleDegrees <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "L", x, y,
    "L", start.x, start.y
  ].join(" ");
}


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}


/*
  Traverses the elevators array and draws the elevators.
  Elevator format is the following 'rack_size', where:
    - 'rack' is the rack location where the top left corner of the elevator should be
    - 'size' is "width x height" in rack units. That is, how many racks it has of width and height
*/
function appendElevators(roomId, roomOptions, boxElement) {
  if (roomOptions && roomOptions.elevators) {
    for (let i = 0; i < roomOptions.elevators.length; i++) {
      let elevatorComponents = roomOptions.elevators[i].split("_");
      let elevatorId = "elevator-" + elevatorComponents[0];
      let elevatorRackElement = $("#" + formatNameForJQuery(elevatorComponents[0]));
      let elevatorSize = elevatorComponents[1];

      // We calculate the width and height taking the number of boxes that we defined in config.js and multiplying it by the box sizes.
      let elevatorWidth = (parseInt(elevatorSize.split("x")[0]) - 1) * boxElement.outerWidth(true) + boxElement.outerWidth();
      let elevatorHeight = parseInt(elevatorSize.split("x")[1]) * boxElement.outerHeight();

      // We calculate the left and top position based on the top left rack we defined in config.js
      let elevatorLeft = elevatorRackElement.position().left - parseFloat(elevatorRackElement.css("border-left-width"));
      let elevatorTop = elevatorRackElement.position().top - $("#" + roomId).position().top - parseFloat(elevatorRackElement.css("border-top-width"));

      $("#" + roomId).append( "<div class='elevator' id='" + elevatorId + "'" +
                              "style='width:" + elevatorWidth + "px; height:" + elevatorHeight + "px; left:" + elevatorLeft + "px; top:" + elevatorTop + "px'>" +
                                "<div class='elevatorText' id='text-" + elevatorId + "'>Elevator</div>" +
                              "</div>");

      // Extra positioning for the elevator elements
      let elevatorIdElement = $("#" + formatNameForJQuery(elevatorId));
      let elevatorIdTextElement = $("#text-" + formatNameForJQuery(elevatorId));
      elevatorIdElement.css("top", parseFloat(elevatorIdElement.css("top")) - parseFloat(elevatorIdElement.css("margin-top")));
      elevatorIdTextElement.css("top", elevatorIdElement.height() / 2 - elevatorIdTextElement.height());
    }
  }
}


/*
  Traverses the walls array and draws the walls.
  Wall format is the following 'rack_length_direction_position_long', where:
    - 'rack' is the top left corner rack location where the wall starts to be created
    - 'length' describes how many racks the wall has of length
    - 'direction' describes if the door is horizontal or vertical
    - 'position' is where the wall shall be located with respect to that rack (top or bottom for horizontal direction; left or right for vertical)
    - 'long' indicates if the wall its a bit longer. How long? The margin of a rack. If we do not define this some horizontal walls may not match
      the vertical ones, decreasing UX experience
*/
function appendWalls(roomId, roomOptions, boxElement) {
  if (roomOptions && roomOptions.walls) {
    for (let i = 0; i < roomOptions.walls.length; i++) {
      let wallComponents = roomOptions.walls[i].split("_");

      let rackId = wallComponents[0];
      let rackCoordinates = rackId.split(".")[1];
      let rackColumn = parseInt(rackCoordinates.split("-")[0]);
      let rackRow = parseInt(rackCoordinates.split("-")[1]);

      let wallId = "wall-" + rackId;
      let wallRackElement = $("#" + formatNameForJQuery(rackId));
      let wallLength = parseInt(wallComponents[1]);
      let wallDirection = wallComponents[2];
      let wallPosition = wallComponents[3];
      let isWallLong = wallComponents[4];

      let wallLeft = wallRackElement.offset().left - $("#" + roomId).offset().left - parseFloat(wallRackElement.css("border-left-width"));
      let wallTop = wallRackElement.offset().top - $("#" + roomId).offset().top - parseFloat(wallRackElement.css("border-top-width"));

      if (wallDirection === "vertical") {
        appendVerticalWall (roomId, roomOptions, boxElement, rackRow, rackColumn, wallId, wallLength, wallDirection, wallPosition, isWallLong, wallLeft, wallTop);
      } else if (wallDirection === "horizontal") {
        appendHorizontalWall (roomId, roomOptions, boxElement, rackRow, rackColumn, wallId, wallLength, wallDirection, wallPosition, isWallLong, wallLeft, wallTop);
      }
    }
  }
}


/*
    Vertical wall appending. We will configure some of the parameters depending on the wall position and if it is the end of the room, and then append the wall
*/
function appendVerticalWall (roomId, roomOptions, boxElement, rackRow, rackColumn, wallId, wallLength, wallDirection, wallPosition, isWallLong, baseWallLeft, baseWallTop) {

  let wallLeft = baseWallLeft;
  let wallTop = baseWallTop;

  if (wallPosition === "right") wallLeft += BOXWIDTH;
  let wallHeight = wallLength * boxElement.outerHeight();

  // If the beginning of the wall is in a edge of the room, we will avoid the room padding to increase UX
  if ((roomOptions.roomType === SDXROOMTYPE && rackRow == 1) || (roomOptions.roomType === USA15ROOMTYPE && rackRow == roomOptions.rows)) {
    wallHeight += parseFloat($(".racksContainer", "#" + roomId).css("padding-top"));
    wallTop += -parseFloat($(".racksContainer", "#" + roomId).css("padding-top"));
  }

  // If the end of the wall is in a edge of the room, we will avoid the room padding to increase UX
  if ((roomOptions.roomType === SDXROOMTYPE && rackRow + wallLength > roomOptions.rows) || (roomOptions.roomType === USA15ROOMTYPE && rackRow - wallLength < 1)) {
    wallHeight += parseFloat($(".racksContainer", "#" + roomId).css("padding-bottom"));
  }

  $("#" + roomId).append( "<svg id='" + wallId + "' class='wall-container' height='" + wallHeight + "' width='4' style='left:" + wallLeft + "px; top:" + wallTop + "px'>" +
                            "<line class='wall' x1='0' y1='0' x2='0' y2='" + (wallHeight - 1) + "'/>" +
                          "</svg>");
}


/*
    Horizontal wall appending. We will configure some of the parameters depending on the wall position, isWallLong, and if it is the end of the room, and then append the wall
*/
function appendHorizontalWall (roomId, roomOptions, boxElement, rackRow, rackColumn, wallId, wallLength, wallDirection, wallPosition, isWallLong, baseWallLeft, baseWallTop) {

  let wallLeft = baseWallLeft;
  let wallTop = baseWallTop;

  if (wallPosition === "bottom") wallTop += BOXHEIGHT;
  let wallWidth = (wallLength - 1) * boxElement.outerWidth(true) + boxElement.outerWidth();

  // If the beginning of the wall is in a edge of the room, we will avoid the room padding to increase UX
  if ((roomOptions.roomType === SDXROOMTYPE && rackColumn == roomOptions.columns) || (roomOptions.roomType === USA15ROOMTYPE && rackColumn == 1)) {
    wallWidth += parseFloat($(".racksContainer", "#" + roomId).css("padding-left")) + parseFloat(boxElement.css("margin-left"));
    wallLeft += -parseFloat($(".racksContainer", "#" + roomId).css("padding-left")) - parseFloat(boxElement.css("margin-left"));
  }

  // If the end of the wall is in a edge of the room, we will avoid the room padding to increase UX
  if ((roomOptions.roomType === SDXROOMTYPE && rackColumn - wallLength < 1) || (roomOptions.roomType === USA15ROOMTYPE && rackColumn + wallLength > roomOptions.columns)) {
    wallWidth += parseFloat($(".racksContainer", "#" + roomId).css("padding-right")) + boxElement.outerWidth(true) - boxElement.outerWidth();
  } else if (isWallLong === "long") wallWidth += boxElement.outerWidth(true) - boxElement.outerWidth();

  $("#" + roomId).append( "<svg id='" + wallId + "' class='wall-container' height='5' width='" + wallWidth + "' style='left:" + wallLeft + "px; top:" + wallTop + "px'>" +
                            "<line class='wall' x1='0' y1='0' x2='" + (wallWidth - 1) + "' y2='0'/>" +
                          "</svg>");
}


/*
  Traverses the stairs array and draws the stairs.
  Stairs format is the following 'rack_size_direction', where:
    - 'rack' is the rack location where the top left corner of the stairs should be
    - 'size' is "width x height" in rack units. That is, how many racks it has of width and height
    - 'direction' is the direction of the stairs ('up' or 'down')
  We assume that the stairs are always vertical
*/
function appendStairs(roomId, roomOptions, boxElement) {
  if (roomOptions && roomOptions.stairs) {
    for (let i = 0; i < roomOptions.stairs.length; i++) {
      let stairsComponents = roomOptions.stairs[i].split("_");
      let stairsId = "stairs-" + stairsComponents[0];
      let stairsRackElement = $("#" + formatNameForJQuery(stairsComponents[0]));
      let stairsSize = stairsComponents[1];
      let stairsDirection = stairsComponents[2];

      // We calculate the width and height taking the number of boxes that we defined in config.js and multiplying it by the box sizes.
      let stairsWidth = (parseInt(stairsSize.split("x")[0]) - 1) * boxElement.outerWidth(true) + boxElement.outerWidth();
      let stairsHeight = parseInt(stairsSize.split("x")[1]) * boxElement.outerHeight();

      // We calculate the left and top position based on the top left rack we defined in config.js
      let stairsLeft = stairsRackElement.position().left - parseFloat(stairsRackElement.css("border-left-width"));
      let stairsTop = stairsRackElement.position().top - $("#" + roomId).position().top - parseFloat(stairsRackElement.css("border-top-width"));

      $("#" + roomId).append( "<div class='stairs' id='" + stairsId + "'" +
                              "style='width:" + stairsWidth + "px; height:" + stairsHeight + "px; left:" + stairsLeft + "px; top:" + stairsTop + "px'>" +
                                "<div class='arrow arrow-" + stairsDirection + "' id='arrow-" + stairsId + "'>" +
                                  "<span class='arrowhead'></span>" +
                                "</div>" +
                              "</div>");

      // Extra positioning for the stairs
      let stairsIdElement = $("#" + formatNameForJQuery(stairsId));
      let arrowElement = $("#arrow-" + formatNameForJQuery(stairsId));
      stairsIdElement.css("top", parseFloat(stairsIdElement.css("top")) - parseFloat(stairsIdElement.css("margin-top")));
      arrowElement.css("left", stairsIdElement.width() / 2 - arrowElement.width() / 2);

      // We now append several divs with a border so that we simulate the staircase
      let numberOfStairs = 3 * (parseInt(stairsSize.split("x")[1]) - 1);
      let heightOfStair = stairsHeight / numberOfStairs;
      for (let j = 1; j < numberOfStairs; j++) {
        stairsIdElement.append("<div class='stair' style='height:" + heightOfStair + "px;'></div>");
      }
    }
  }
}
