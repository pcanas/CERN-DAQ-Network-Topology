/*
  Generates or deletes connections based on the current status (if there is at least one active connection we will delete all of them)
    - Parameter 'button' checks with which mouse button the mouseup event was fired. We only take into account left clicks (1)
*/
function toggleConnections(deviceId, button) {
  if (!dragging && button==1) {
    let deviceIdLines = $(".line-" + deviceId, "#container");
    if (deviceIdLines.length === 0) {
      generateConnections(deviceId);
    } else {
      deleteConnectionsDevice(deviceId);
    }
  }
}


/*
    Performs an ajax call to get the connections for that device, and creates them.
      - We will use an array, activeConnections, to keep all the relevant information of every active connection
*/
function generateConnections(deviceId) {
  addLoadingCursor();
  $.ajax({
    'url': '/es/api/v1/interface/',
    'type': 'GET',
    'data': {
      format: 'json',
      device: devicesInfo[deviceId].id,
      limit: 1000
    },
    success: function(data) {
      for (let i = 0; i < data.objects.length; i++) {
        // We perform this check as some entries of the DB connect null racks
        if (data.objects[i].peer_device) {
          let targetDevice = data.objects[i].peer_device.split(",")[0];

          // We perform this check as some entries of the DB connect not existing racks
          if (devicesInfo[targetDevice]) {
            let sourceFormattedRoomId = devicesInfo[deviceId].room.replace(/ /g, "_");
            let targetFormattedRoomId = devicesInfo[targetDevice].room.replace(/ /g, "_");
            let lineColor = calculateRandomColor();
            // This is the base connection, later we will have to identify the target
            let connection = {
              source: deviceId,
              sourceRoom: sourceFormattedRoomId,
              sourceRack: devicesInfo[deviceId].rack,
              sourceDevice: deviceId,
              sourceInterface: data.objects[i].name,
              targetRoom: targetFormattedRoomId,
              targetRack: devicesInfo[targetDevice].rack,
              targetDevice: targetDevice,
              targetInterface: data.objects[i].peer_interface,
              color: lineColor,
              overlayVisibility: "hidden"
            };

            /*
                Conditional expressions to detect the target:
                  - If the targetDevice exists, we will perform a connection to the device
                  - If the targetDevice does not exist but the room is visible, we will connect to the rack
                  - If the room is not active, we will connect to the room menu

                Notice that in the device-device connection we first check that it exist before pushing it into the array.
                We do this because we do not want repeated connections between 2 devices, while for example we would like
                to store two connections going to the same rack (they may be going to different devices).
            */
            if (document.getElementById(targetDevice)) {
              connection.target = targetDevice;
              if (!connectionExists("line-" + connection.source, "line-" + connection.target)) {
                activeConnections.unshift(connection);
              }
            } else if (window.getComputedStyle(document.getElementById(targetFormattedRoomId), null).getPropertyValue("visibility") === "visible") {
              connection.target = devicesInfo[targetDevice].rack;
              activeConnections.unshift(connection);
            } else {
              connection.target = "room-" + targetFormattedRoomId;
              activeConnections.unshift(connection);
            }
            if (!connectionExists("line-" + connection.source, "line-" + connection.target)) {
              insertConnection(connection);
            }
          }
        }
      }
      jsPlumb.repaintEverything();
      removeLoadingCursor();
    }
  });
}


/*
    Unfortunately, due to some failures of jsPlumb, we cannot delete individual connections.
    As a result, we have to delete all of our connections and later repaint the ones that we would like to keep.
*/
function deleteConnectionsDevice(deviceId) {
  jsPlumb.deleteEveryEndpoint();
  for (let i = activeConnections.length - 1; i >= 0; i--) {
    // We delete from the arrays deviceId connections and re-insert the rest
    if (activeConnections[i].source === deviceId || activeConnections[i].target === deviceId) {
      activeConnections.splice(i, 1);
    } else {
      if (!connectionExists("line-" + activeConnections[i].source, "line-" + activeConnections[i].target)) {
        insertConnection(activeConnections[i]);
      }
    }
  }
  jsPlumb.repaintEverything();
}


/*
    This function includes all the process of a connection creation, from the creation of the connection elements to the connection event functions
      - First we will decide the type of connector, overlay, anchor, endpoint and (optionally) zIndex for both the source and the target.
      - Later, we will insert the connection
      - Finally, we will set some css rules and listeners for the connection
*/
function insertConnection(connection) {
  let connector;
  let anchors = [];
  let overlays = [];
  let endpointCSSClasses = [];
  let baseEndpointCSSClasses = "endpoint-line-" + connection.source + " endpoint-line-" + connection.target;
  let zIndexRack;

  // If connection belongs to the same rack, it will be of type Flowchart
  if (connection.targetRack === connection.sourceRack) {
    connector = ["Flowchart", { cornerRadius: 5, midpoint: 0.11 }];
  } else {
    connector = ["Bezier", { curvinness: 100 }];
  }

  // Different labels, anchors and endpoints depending on where is the source (room, rack or device)
  if (connection.source === "room-" + connection.sourceRoom) {
    overlays.push(["Label", { label: connection.sourceRack + "<br>" + connection.sourceDevice, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.25 }]);
    anchors.push([ [0.5, 0.7, 0, 0] ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " room-endpoint");
  } else if (connection.source === connection.sourceRack) {
    overlays.push(["Label", { label: connection.sourceDevice, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.25 }]);
    anchors.push([ ["Top"], ["Bottom"], "Continuous" ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " rack-endpoint");
    zIndexRack = document.getElementById(connection.sourceRack).style.zIndex;
  } else if (connection.source === connection.sourceDevice) {
    overlays.push(["Label", { label: "I/F: " + connection.sourceInterface, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.25 }]);
    anchors.push([ ["Right"], ["Left"], "Continuous" ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " device-endpoint");
  }

  // Different labels, anchors and endpoints depending on where is the target (room, rack or device)
  if (connection.target === "room-" + connection.targetRoom) {
    overlays.push(["Label", { label: connection.targetRack + "<br>" + connection.targetDevice, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.75 }]);
    anchors.push([ [0.5, 0.7, 0, 0] ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " room-endpoint");
  } else if (connection.target === connection.targetRack) {
    overlays.push(["Label", { label: connection.targetDevice, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.75 }]);
    anchors.push([ ["Top"], ["Bottom"], "Continuous" ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " rack-endpoint");
    zIndexRack = document.getElementById(connection.targetRack).style.zIndex;
  } else if (connection.target === connection.targetDevice) {
    overlays.push(["Label", { label: "I/F: " + connection.targetInterface, cssClass: "label-line-" + connection.source + " label-line-" + connection.target, location: 0.75 }]);
    anchors.push([ ["Right"], ["Left"], "Continuous" ]);
    endpointCSSClasses.push(baseEndpointCSSClasses + " device-endpoint");
  }

  appendConnection(connection.source, connection.target, connection.color, endpointCSSClasses, connector, anchors, overlays);

  // We set the visibility of the labels
  $(".label-line-" + formatNameForJQuery(connection.source) + ".label-line-" + formatNameForJQuery(connection.target)).css("visibility", connection.overlayVisibility);

  // If an endpoint is belongs to a rack, it will share its same zIndex, so that we achieve the overlay hiding when two rooms are colliding
  if (zIndexRack) {
    $(".endpoint-line-" + formatNameForJQuery(connection.source) + ".endpoint-line-" + formatNameForJQuery(connection.target) + ".rack-endpoint", "#container").css("z-index", zIndexRack);
  }

  setLabelClickingFunctions(connection);
}


/*
    jsPlumb connect function. It recieves the source and target of the connection together we some extra configuration, and draws the connection.
      - color: color of the line
      - endpointCSSClasses: it will contain the source and target together with the type of endpoint (device, rack or room)
      - connector: type of line (Bezier or Flowchart)
      - anchors: where the endpoint is located within the object. Depends on the type of endpoint
      - overlays: labels of the line. Also depends on the type of endpoint
    For the arrays, assume that position 0 is for the source, and 1 is for the target.
*/
function appendConnection(source, target, color, endpointCSSClasses, connector, anchors, overlays) {
  let e1 = jsPlumb.addEndpoint(source, {
    anchors: anchors[0],
    endpoint: ["Dot", { radius: 7 }],
    endpointStyle: { fill: color },
    cssClass: endpointCSSClasses[0],
  });
  let e2 = jsPlumb.addEndpoint(target, {
    anchors: anchors[1],
    endpoint: ["Dot", { radius: 7 }],
    endpointStyle: { fill: color },
    cssClass: endpointCSSClasses[1],
  });
  jsPlumb.connect({
    cssClass: "line-" + source + " line-" + target,
    source: e1,
    target: e2,
    connector: connector,
    paintStyle: { stroke: color, strokeWidth: 2 },
    overlays: overlays,
  });
}


/*
    Trigger function when clicking in any of the elements of the connection (line, endpoint or label).
      - This function will toggle the visibility of the labels
*/
function setLabelClickingFunctions(connection) {
  $(".line-" + formatNameForJQuery(connection.source) + ".line-" + formatNameForJQuery(connection.target), "#container").mouseup(function() {
    labelClickingFunction(connection)
  });
  $(".endpoint-line-" + formatNameForJQuery(connection.source) + ".endpoint-line-" + formatNameForJQuery(connection.target), "#container").mouseup(function() {
    labelClickingFunction(connection)
  });
  $(".label-line-" + formatNameForJQuery(connection.source) + ".label-line-" + formatNameForJQuery(connection.target), "#container").mouseup(function() {
    labelClickingFunction(connection)
  });
}


function labelClickingFunction(connection) {
  if ($(".label-line-" + formatNameForJQuery(connection.source) + ".label-line-" + formatNameForJQuery(connection.target)).css("visibility") === "visible") {
    setLabelsVisibility(connection, "hidden");
  } else {
    setLabelsVisibility(connection, "visible");
  }
}


/*
    As some connections can be overlaping (eg: we have a connection going to 2 devices in the same rack but the rack details box is hidden)
    we do not only have to toggle the visibility of the current connection, but also the visibility of any other line matching the same source and target.
      - An exception is made when the connection is between 2 devices, as we assume that these are unique.
*/
function setLabelsVisibility(connection, visibility) {
  if (connection.source === connection.sourceDevice && connection.target === "room-" + connection.targetRoom) {
    setLabelsVisibilityAllMatchingConnections(connection.sourceDevice, "room-" + connection.targetRoom, visibility);
  } else if (connection.source === connection.sourceDevice && connection.target === connection.targetRack) {
    setLabelsVisibilityAllMatchingConnections(connection.sourceDevice, connection.targetRack, visibility);
  } else if (connection.source === connection.sourceDevice && connection.target === connection.targetDevice) {
    $(".label-line-" + formatNameForJQuery(connection.source) + ".label-line-" + formatNameForJQuery(connection.target)).css("visibility", visibility);
    connection.overlayVisibility = visibility;
  } else if (connection.target === connection.targetDevice && connection.source === "room-" + connection.sourceRoom) {
    setLabelsVisibilityAllMatchingConnections("room-" + connection.sourceRoom, connection.targetDevice, visibility);
  } else if (connection.target === connection.targetDevice && connection.source === connection.sourceRack) {
    setLabelsVisibilityAllMatchingConnections(connection.sourceRack, connection.targetDevice, visibility);
  }
}


// We traverse all the connections and we will set the given visibility for the source and target marching ones
function setLabelsVisibilityAllMatchingConnections(source, target, visibility) {
  for (let i = 0; i < activeConnections.length; i++) {
    if (activeConnections[i].source === source && activeConnections[i].target === target) {
      $(".label-line-" + formatNameForJQuery(activeConnections[i].source) + ".label-line-" + formatNameForJQuery(activeConnections[i].target)).css("visibility", visibility);
      activeConnections[i].overlayVisibility = visibility;
    }
  }
}


// Checks if a connection exist
function connectionExists(lineClass1, lineClass2) {
  return $("." + formatNameForJQuery(lineClass1) + "." + formatNameForJQuery(lineClass2), "#container").length;
}
