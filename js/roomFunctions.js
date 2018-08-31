
/*
    Function triggered when clicking in the navigation bar or in the room close button
      - If the room is hidden, we will make it visible and update our connections
      - Else, we will hide it and update our connections
      - Parameter 'button' checks with which mouse button the mouseup event was fired. We only take into account left clicks (1)
*/
function toggleRoomVisibility(roomId, button) {
  if (!dragging && button==1 && document.getElementById(roomId)) {
    if (window.getComputedStyle(document.getElementById(roomId), null).getPropertyValue("visibility") === "hidden") {
      document.getElementById("navigation-button-" + roomId).classList.add("active");
      document.getElementById(roomId).style.visibility = "visible";

      updateConnectionsRoomVisible(roomId);
    } else {
      document.getElementById("navigation-button-" + roomId).classList.remove("active");
      document.getElementById(roomId).style.visibility = "hidden";

      // We have to delete all the rackDetails windows related to such room
      $(".rackDetails-" + roomId).remove();
      updateConnectionsRoomHidden(roomId);
    }
  }
}


/*
    Unfortunately, due to some failures of jsPlumb, we cannot delete individual connections.
    As a result, we have to delete all of our connections and later repaint the ones that we would like to keep.

    As the room is now visible, we have to update all connections going to such room and redirect them to the rack
*/
function updateConnectionsRoomVisible(roomId) {
  jsPlumb.deleteEveryEndpoint();
  for (let i = activeConnections.length - 1; i >= 0; i--) {
    if (activeConnections[i].target === "room-" + roomId) {
      activeConnections[i].target = activeConnections[i].targetRack;
    } else if (activeConnections[i].source === "room-" + roomId) {
      activeConnections[i].source = activeConnections[i].sourceRack;
    }
    if (!connectionExists("line-" + activeConnections[i].source, "line-" + activeConnections[i].target)) {
      insertConnection(activeConnections[i]);
    }
  }
  jsPlumb.repaintEverything();
}


/*
    Unfortunately, due to some failures of jsPlumb, we cannot delete individual connections.
    As a result, we have to delete all of our connections and later repaint the ones that we would like to keep.

    As the room is now hidden, we have to update all connections going to a device or rack in such room and redirect them to the room menu
      - If a connection is made withing that room, we would delete the connection
      - If the other endpoint of the connection we are updating is not a device, we would also delete the connection (cannot have room-room or room-rack connections)
*/
function updateConnectionsRoomHidden(roomId) {
  jsPlumb.deleteEveryEndpoint();
  for (let i = activeConnections.length - 1; i >= 0; i--) {
    if (activeConnections[i].sourceRoom === roomId && activeConnections[i].targetRoom === roomId) {
      activeConnections.splice(i, 1);
      continue;
    } else if (activeConnections[i].sourceRoom === roomId) {
      if (activeConnections[i].target === activeConnections[i].targetDevice) {
        activeConnections[i].source = "room-" + activeConnections[i].sourceRoom;
      } else {
        activeConnections.splice(i, 1);
        continue;
      }
    } else if (activeConnections[i].targetRoom === roomId) {
      if (activeConnections[i].source === activeConnections[i].sourceDevice) {
        activeConnections[i].target = "room-" + activeConnections[i].targetRoom;
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
