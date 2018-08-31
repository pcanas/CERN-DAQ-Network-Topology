
/*
    Function triggered when clicking in a rack or in the rack details close button
      - If the rack details window is created, we will delete it and update our connections
      - Else, we will create this rack details window and update our connections
      - Parameter 'button' checks with which mouse button the mouseup event was fired. We only take into account left clicks (1)
*/
function toggleRackDetails(rackId, button) {
  if (!dragging && button==1) {

    if (!document.getElementById("details-" + rackId)) {
      addLoadingCursor();
      let roomId = document.getElementById(rackId).parentNode.parentNode.id;

      // For creating this window, we first need to access to the devices of that rack
      $.ajax({
        'url': '/es/api/v1/device/',
        'type': 'GET',
        'data': {
          format: 'json',
          rack: document.getElementById(rackId).dataset.rackid,
          order_by: 'rack_unit',
          limit: 200
        },
        success: function(data) {
          let devicesList = [];
          for (let i = 0; i < data.objects.length; i++) {
            devicesList.unshift(data.objects[i].name);
          }

          // Once we have the devices, we can create the box
          createRackDetails(roomId, rackId, devicesList);
          updateConnectionsCreateRackDetails(rackId);
          removeLoadingCursor();
        }
      });
    } else {
      deleteRackDetails(rackId);
      updateConnectionsDeleteRackDetails(rackId);
    }
  }
}


/*
  Creates a box containing the list of devices for a rack.
*/
function createRackDetails(roomId, rackId, devicesList) {
  let rackIdElement = $("#" + formatNameForJQuery(rackId));

  appendRackDetailsBox(roomId, rackId, rackIdElement, devicesList);

  let rackIdDetailsElement = $("#details-" + formatNameForJQuery(rackId));

  setPositionRackDetails(rackIdElement, rackIdDetailsElement);

  setPropertyDraggableToElement(rackIdDetailsElement, true);
}


// Creates the rack details box for the selected rack
function appendRackDetailsBox(roomId, rackId, rackIdElement, rackDetailsDeviceList) {
  let rackDetailsBoxHeader = "[" + roomId.replace(/_/g, " ") + "] [" + rackId + "]";
  let rackDetailsCloseButton = "<div id='close-"+rackId+"' class='close rackDetailsHeaderClose'></div>";
  let rackType = document.getElementById(rackId).classList[2]; // We only need the rack type for the colouring
  let htmlRackDetailsDeviceList = formatRackDetailsDeviceList(rackId, rackDetailsDeviceList);

  // We insert the box in #roomsContainer because we want the dragging of the room and the rack details box to be independent
  $("#roomsContainer").append("<div class='rackDetails rackDetails-" + roomId + "' id='details-" + rackId + "'>" +
                                "<div class='rackDetailsHeader " + (rackType ? rackType : 'rackDetailsHeaderColor') + "'>" +
                                  rackDetailsBoxHeader + rackDetailsCloseButton +
                                "</div>" +
                                "<div class='rackDetailsDeviceList'>" + htmlRackDetailsDeviceList + "</div>" +
                              "</div>");

  for (let i = 0; i < rackDetailsDeviceList.length; i++) {
    addLineHighlightHoverFunction(rackDetailsDeviceList[i]);
    document.getElementById(rackDetailsDeviceList[i]).addEventListener("mouseup", function(e){
      toggleConnections(rackDetailsDeviceList[i], e.which);
    });
  }
  document.getElementById("close-"+rackId).addEventListener("mouseup", function(e){
    toggleRackDetails(rackId, e.which);
  });
}


// Function that takes a list of devices and generates an html formating of such list
function formatRackDetailsDeviceList(rackId, devices) {
  let htmlDevicesList = "";
  if (devices) {
    for (let i = 0; i < devices.length; i++) {
      htmlDevicesList +=
        "<div class='rackDetailsDevice' id='" + devices[i] + "'>" +
          "<div class='rackDetailsDeviceText'>" + devices[i] + "<span class='rackDetailsDeviceRackUnit'>[" + devicesInfo[devices[i]].rack_unit + "]</span></div>" +
        "</div>";
    }
  }
  if (htmlDevicesList === "") {
    htmlDevicesList += "<div class='rackDetailsDevice'></div>";
  }
  return htmlDevicesList;
}


/*
  In order to apply a real positioning, we need to scale the container to 1, set the position, and scale the container to its original scale.
*/
function setPositionRackDetails(rackIdElement, rackIdDetailsElement) {
  let matrix = $("#container").panzoom("getMatrix");
  $("#container").panzoom("setMatrix", [ 1, matrix[1], matrix[2], 1, matrix[4], matrix[5]]);
  rackIdDetailsElement.css("left", rackIdElement.offset().left - $("#roomsContainer").offset().left + rackIdElement.width() + 16 + "px");
  rackIdDetailsElement.css("top", rackIdElement.offset().top - $("#roomsContainer").offset().top - 16 + "px");
  $("#container").panzoom("setMatrix", matrix);
}


/*
    Unfortunately, due to some failures of jsPlumb, we cannot delete individual connections.
    As a result, we have to delete all of our connections and later repaint the ones that we would like to keep.

    As a new rack details box has been created, we have to update all connections going to such rack and redirect them to the device
*/
function updateConnectionsCreateRackDetails(rackId) {
  jsPlumb.deleteEveryEndpoint();
  for (let i = activeConnections.length - 1; i >= 0; i--) {
    if (activeConnections[i].target === rackId) {
      activeConnections[i].target = activeConnections[i].targetDevice;
    } else if (activeConnections[i].source === rackId) {
      activeConnections[i].source = activeConnections[i].sourceDevice;
    }
    if (!connectionExists("line-" + activeConnections[i].source, "line-" + activeConnections[i].target)) {
      insertConnection(activeConnections[i]);
    }
  }
  jsPlumb.repaintEverything();
}


// Deletes the rack details window
function deleteRackDetails(rackId) {
  let toDelete = document.getElementById("details-" + rackId);
  toDelete.parentNode.removeChild(toDelete);
}


/*
    Unfortunately, due to some failures of jsPlumb, we cannot delete individual connections.
    As a result, we have to delete all of our connections and later repaint the ones that we would like to keep.

    As the rack details box has been deleted, we have to update all connections going to a device in the rack and redirect them to the rack
      - If both devices belong to that rack, we would delete the connection
      - If the other endpoint of the connection we are updating is not a device, we would also delete the connection (cannot have rack-rack or room-rack connections)
*/
function updateConnectionsDeleteRackDetails(rackId) {
  jsPlumb.deleteEveryEndpoint();
  for (let i = activeConnections.length - 1; i >= 0; i--) {
    if (activeConnections[i].sourceRack === rackId && activeConnections[i].targetRack === rackId) {
      activeConnections.splice(i, 1);
      continue;
    } else if (activeConnections[i].sourceRack === rackId) {
      if (activeConnections[i].target === activeConnections[i].targetDevice) {
        activeConnections[i].source = activeConnections[i].sourceRack;
      } else {
        activeConnections.splice(i, 1);
        continue;
      }
    } else if (activeConnections[i].targetRack === rackId) {
      if (activeConnections[i].source === activeConnections[i].sourceDevice) {
        activeConnections[i].target = activeConnections[i].targetRack;
      } else {
        activeConnections.splice(i, 1);
        continue;
      }
    }
    if (!connectionExists("line-" + activeConnections[i].source, "line-" + activeConnections[i].target)) {
      insertConnection(activeConnections[i]);
    }
  }
  jsPlumb.repaintEverything();
}
