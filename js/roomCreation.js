/*
  Adds all the necessary components to create a room.
    - roomOptions contains number of rows, columns, room type, rack format, room template, doors, elevators, walls and stairs location.
    - The roomId will be the room name replacing the spaces by "_".
*/
function createRoom(roomName, roomOptions, boxWidth, boxHeight, racksArray, roomIndex) {
  let roomId = roomName.replace(/ /g, "_");
  appendNavigationBarButton(roomId, roomName);
  appendRoomMenuEntry(roomId, roomName);
  appendRoomContainer(roomId, roomName, roomIndex);
  appendBoxes(roomId, roomOptions, racksArray, roomIndex);

  setUpRoomSizes(roomId, roomOptions.columns, roomOptions.rows, boxWidth, boxHeight);

  let containerScale = document.getElementById("zoomSlider").value;
  applyZoomToRepresentation(1);
  appendMapElements(roomId, roomOptions, $(".box", "#" + roomId))
  applyZoomToRepresentation(containerScale);

  /*
    Some browsers automatically modify elements sizes in a resize, so we add this listener to prevent weird behaviour
  */
  window.addEventListener("resize", function() {
    setUpRoomSizes(roomId, roomOptions.columns, roomOptions.rows, boxWidth, boxHeight);
  });

  setPropertyDraggableToElement($("#" + roomId));
};


// Button in the top navigation bar
function appendNavigationBarButton(roomId, roomName) {
  $("#navigationBar>ul").append("<li>" +
                                  "<span id='navigation-button-" + roomId + "' onmouseup=\"toggleRoomVisibility('" + roomId + "')\">" + roomName + "</span>" +
                                "</li>");
}


// Dotted box that represents if any connection is going to that room, when the room is hidden
function appendRoomMenuEntry(roomId, roomName) {
  $("#container>#roomMenu").append( "<div id='room-" + roomId + "' class='room-menu-element'>" +
                                      "<div class='room-menu-element-text'>Room:&nbsp;" + roomName + "</div>" +
                                    "</div>");

  addLineHighlightHoverFunction("room-" + roomId);
}


// Room header and structure structure
function appendRoomContainer(roomId, roomName, roomIndex) {
  // Show # devices button, with the loading symbol that appears when clicking it
  let loadingSymbol = "<div class='loadingSymbol' id='loading-" + roomId + "'>Loading" +
                        "<div class='sk-circle'>" +
                        "<div class='sk-circle1 sk-child'></div>" +
                        "<div class='sk-circle2 sk-child'></div>" +
                        "<div class='sk-circle3 sk-child'></div>" +
                        "<div class='sk-circle4 sk-child'></div>" +
                        "<div class='sk-circle5 sk-child'></div>" +
                        "<div class='sk-circle6 sk-child'></div>" +
                        "<div class='sk-circle7 sk-child'></div>" +
                        "<div class='sk-circle8 sk-child'></div>" +
                        "<div class='sk-circle9 sk-child'></div>" +
                        "<div class='sk-circle10 sk-child'></div>" +
                        "<div class='sk-circle11 sk-child'></div>" +
                        "<div class='sk-circle12 sk-child'></div>" +
                        "</div>" +
                      "</div>";
  let showNumberDevicesButton = "<div class='showNumberDevicesButton' onclick=\"showNumberDevices('" + roomIndex + "')\">Show # of Devices</div>"
  let showNumberDevices = "<div class='showNumberDevices'>" + showNumberDevicesButton + loadingSymbol + "</div>";

  // Information button, with the toolbox that appears when hovering it
  let listOfRackTypes = getListOfRackTypes();
  let legendElement = "<div class='legend-scale'>" +
                        "<ul class='legend-labels'>" + listOfRackTypes + "</ul>" +
                      "</div>"
  let infoButton = "<div class='infoContainer'><span class='infoIcon'>&#9432;<div class='tooltip'>" + legendElement + "</div></span></div>";

  // Close button
  let closeButton = "<div class='close roomHeaderClose' onmouseup=\"toggleRoomVisibility('" + roomId + "')\"></div>";

  // Room header, containing all the previous elements
  let roomHeader = "<div class='roomHeader'>" + showNumberDevices + roomName + infoButton + closeButton + "</div>";

  // Racks container, that will contain all the racks for the room
  let racksContainer = "<div class='racksContainer'></div>";

  $("#roomsContainer").append("<div class='roomContainer' id='" + roomId + "' style='z-index: " + roomIndex + "'>" +
                                roomHeader + racksContainer +
                              "</div>");
}


// Generates the legend that will be contained in the information toolbox
function getListOfRackTypes() {
  list = "";
  for (let i = 0; i < RACKTYPES.length; i++) {
    list += "<li><span class='" + RACKTYPES[i].toLowerCase().replace(/ /g, "-") + "'></span>" + RACKTYPES[i] + "</li>"
  }
  return list;
}


// This function decides which coordinate system to choose based on the type of room, and inserts the boxes in that order
function appendBoxes(roomId, roomOptions, racksArray, roomIndex) {
  let racksContainerElement = $("#" + roomId + " .racksContainer");

  if (roomOptions.roomType === SDXROOMTYPE) {
    for (let row = 1; row <= roomOptions.rows; row++) {
      for (let col = roomOptions.columns; col > 0; col--) {
        insertBox(row, col, roomOptions, racksArray, racksContainerElement, roomIndex)
      }
    }
  } else if (roomOptions.roomType === USA15ROOMTYPE) {
    for (let row = roomOptions.rows; row > 0; row--) {
      for (let col = 1; col <= roomOptions.columns; col++) {
        insertBox(row, col, roomOptions, racksArray, racksContainerElement, roomIndex)
      }
    }
  }
}


/*
    - Inserts the column and row in the room format
    - Checks if the room is a rack (indexOfRack). If so, insert the rack.
    - If it is not a rack but it is contained in the roomTemplate, insert and empty rack.
    - If it is not a rack and it is not in the template, we will insert a corridor (invisible to the user)
*/
function insertBox(row, column, roomOptions, racksArray, racksContainerElement, roomIndex) {
  let rackNameComponents = roomOptions.rackFormat.split(".");
  let rackName = rackNameComponents[0] + "." + numberToRackCoordinate(column) + "-" + numberToRackCoordinate(row) + "." + rackNameComponents[2];
  let indexOfRack = getIndexOfRack(racksArray, rackName);
  if (indexOfRack >= 0) {
    insertRack(racksContainerElement, racksArray[indexOfRack], roomIndex);
  } else if (roomOptions && roomOptions.roomTemplate && roomOptions.roomTemplate.includes(rackName)) {
    insertEmptyRack(racksContainerElement, rackName);
  } else {
    insertCorridor(racksContainerElement, rackName);
  }
}


// Checks if a specific rack is included in a list of racks.
function getIndexOfRack(racksArray, rackName) {
  for (let i = 0; i < racksArray.length; i++) {
    if (racksArray[i].name === rackName) return i;
  }
  return -1;
}


/*
  We use this function to match a given integer with how coordinates are represented
  in the database --> "01","02",...,"10","11"...
*/
function numberToRackCoordinate(n) {
  if (n > 9) return "" + n;
  else return "0" + n;
}


/*
  Inserts a rack. Remarks:
    - We need to store the database Id to query the devices in case the user clicks in the rack.
    - We save the z-index to associate that z-index to a line endpoint in case it goes to the rack.
      We do this to hide endpoints when 2 rooms are colliding and the destination rack is hidden from the user.
*/
function insertRack(racksContainerElement, rack, roomIndex) {
  let numberDevices = "<div id='nDevices-" + rack.name + "' class='nDevicesText'></div>";
  racksContainerElement.append( "<div class='box rack " + rack.type.toLowerCase().replace(/ /g, "-") + "' id='" + rack.name + "' data-rackId='" + rack.dbId + "'" +
                                "onmouseup=\"toggleRackDetails('" + rack.name + "')\" style='z-index:" + roomIndex + ";'>" +
                                  "<div class='rackHeader'>" +
                                    "<div class='rackHeaderText'>" + rack.name + "</div>" +
                                  "</div>" +
                                  "<div class='rackContent'>" +
                                    rack.id + "<br>" + numberDevices +
                                  "</div>" +
                                "</div>");
  addLineHighlightHoverFunction(rack.name);
}


function insertEmptyRack(racksContainerElement, rackId) {
  racksContainerElement.append("<div class='box emptyRack' id='" + rackId + "'></div>");
}


function insertCorridor(racksContainerElement, rackId) {
  racksContainerElement.append("<div class='box corridor' id='" + rackId + "'></div>");
}


/*
  Sets the width and height of the different components of the room.
    - outerWidth(true) and outerHeight(true) gets the width/height including padding, border and margin.
*/
function setUpRoomSizes(roomId, cols, rows, boxWidth, boxHeight) {
  let boxElement = $(".box", "#" + roomId);
  let rackHeaderElement = $(".rackHeader", "#" + roomId);
  let rackContentElement = $(".rackContent", "#" + roomId);
  let rackHeaderTextElement = $(".rackHeaderText", "#" + roomId);
  boxElement.width(boxWidth);
  boxElement.height(boxHeight);
  rackHeaderElement.height(boxHeight / 4);
  rackContentElement.height(boxHeight * 3 / 4 - parseFloat(rackHeaderElement.css("border-bottom-width")) - parseFloat(rackContentElement.css("padding-top")));
  // Centers the text vertically.
  rackHeaderTextElement.css("padding-top", rackHeaderElement.height() / 2 - rackHeaderTextElement.height() / 2);

  let roomElement = $("#" + roomId);
  let roomRacksContainerElement = $("#" + roomId + " .racksContainer");
  roomRacksContainerElement.width(boxElement.outerWidth(true) * cols);
  roomRacksContainerElement.height(boxElement.outerHeight(true) * rows);

  roomElement.width(roomRacksContainerElement.outerWidth(true));
}
