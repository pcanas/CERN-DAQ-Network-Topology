/*
    When hovering an element, we will add the class 'jtk-hover' to all the lines going to that element.
    With this, we will increase the width of the line, and so the user will have a better visualization.
    When finishing the hovering, we will return to the original state.
*/
function addLineHighlightHoverFunction(elementId) {
  $("#" + formatNameForJQuery(elementId)).hover(function() {
    $(".line-" + formatNameForJQuery(elementId)).addClass("jtk-hover");
  }, function() {
    $(".line-" + formatNameForJQuery(elementId)).removeClass("jtk-hover");
  });
}


/*
  Prevents browser zooming
*/
window.addEventListener("wheel", function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
});


/*
    Sets panzoom for container and the focal zooming functionality
*/
function setPanzoom () {
  let $panzoom = $("#container").panzoom({
    minScale: 0.25,
    maxScale: 1.3,
    rangeStep: 0.05,
    which: 3,
  });

  // Initial zooming of the app.
  $panzoom.panzoom("zoom", true, {increment: 0.65, animate:false, focal:{clientX:0,clientY:0}});

  // Function that determines if the user scrolled for zoom in or zoom out, and performs such zooming where the cursor is
  $panzoom.parent().on('mousewheel.focal', function( e ) {
                          e.preventDefault();
                          var delta = e.delta || e.originalEvent.wheelDelta;
                          var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                          $panzoom.panzoom('zoom', zoomOut, {
                            increment: 0.05,
                            animate: false,
                            focal: e
                          });
                        });
}


/*
    Rack names have '.'. If we do not include an escape character, jQuery interprets that we are selecting a class.
    Therefore, we need to include these escape characters.
*/
function formatNameForJQuery(elementId) {
  return elementId.replace(/\./g, "\\.");
}


/*
  jQuery dragable function. I am generalizing this function for both rooms and rack details boxes, but it is not assured that ui positioning works for every element.
    - We will cancel the dragging if we are in a rack details device.
    - There is a constraint in the top so that it does not collide with the navigation bar
    - In the start, we will set a flag to true so that we do not trigger click events while dragging.
      We also set the ui positions to 0 so that we do not make a jump when start dragging the objects (only occurs when scale !== 1)
    - While dragging, we will calculate the new position based on the scale we have, and we will repaint all the connections.
    - We are skiping the first repainting due to a bug in the painting process. That is why 'draggingCounter' is used.
  The flag is just a boolean variable, to differentiate between room menu and room dragging, and rack details window dragging.
  BUG: room dragging performs an offset just when you start the dragging, if the room is scaled
*/
function setPropertyDraggableToElement(element, flag) {
  element.draggable({
    cancel: ".rackDetailsDeviceList",
    start: function(event, ui) {
      if (flag){
        ui.position.left = 0;
        ui.position.top = 0;
      }
      draggingCounter = 0;
      dragging = true;
    },
    drag: function(event, ui) {
      let matrix = $("#container").panzoom("getMatrix");
      let currentScale = $("#container").panzoom("getMatrix")[0];
      $("#container").panzoom("setMatrix", [ 1, matrix[1], matrix[2], 1, matrix[4], matrix[5]]);
      let changeLeft = ui.position.left - ui.originalPosition.left;
      let newLeft = ui.originalPosition.left + changeLeft / currentScale;
      let changeTop = ui.position.top - ui.originalPosition.top;
      let newTop = ui.originalPosition.top + changeTop / currentScale;
      ui.position.left = newLeft;
      ui.position.top = newTop;

      if (draggingCounter > 0) jsPlumb.repaintEverything();

      draggingCounter++;
      $("#container").panzoom("setMatrix", matrix);
    },
    stop: function() {
      jsPlumb.repaintEverything();
      draggingCounter = 0;
      dragging = false;
      document.getElementsByTagName("body")[0].style.cursor = ""; // Solves bug that will set 'cursor:wait' to body if we drag while loading # devices
    }
  });
}


// Adding this class will force every element to have the 'coursor:wait' property, increasing UX.
function addLoadingCursor() {
  let allElements = document.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].classList.add('loadingProcess');
  }
}


// Removes the 'cursor:wait' property from every element.
function removeLoadingCursor() {
  let allElements = document.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].classList.remove('loadingProcess');
  }
}


/*
    Function triggered when user clicks on the 'Show # devices' button
*/
function showNumberDevices(roomIndex) {
  let racks = rooms[roomIndex].racks;
  let roomId = rooms[roomIndex].name.replace(/ /g, "_");

  if (racks) {
    /*
      We will perform the ajax call only if the nDevices property of the first and last racks is undefined
          - if we only check the first rack, we could call displayNumberDevices() before all the nDevices are filled, thus being undefined
          - if we only check the last rack, the user could start click in the button and several thousand ajax calls could be made without reaching the last rack
    */
    if (racks[0].nDevices === undefined && racks[racks.length - 1].nDevices === undefined) {
      addLoadingCursor();
      document.getElementById("loading-" + roomId).style.visibility = "visible";
      // Make the ajax call to get the number of devices
      getNumberDevices(roomId, racks);
    }
  }
}


// Function that makes the call for a specific rack (defined by its dbId).
function getNumberDevices(roomId, racks, i) {
  if (i === undefined) i = 0;
  $.ajax({
    'url': '/es/api/v1/device/',
    'type': 'GET',
    'data': {
      format: 'json',
      rack: racks[i].dbId,
      order_by: 'rack_unit',
      limit: 200
    },
    success: function(data) {
      // We fill the nDevices property with the number of results (devices)
      racks[i].nDevices = data.objects.length;

      // Go to the next rack or display the results if we are in the last rack
      if (++i === racks.length) {
        displayNumberDevices(roomId, racks);
        removeLoadingCursor();
        document.getElementById("loading-" + roomId).style.visibility = "hidden";
      } else {
        getNumberDevices(roomId, racks, i);
      }
    }
  });
}


// Displays the # devices for each rack
function displayNumberDevices(roomId, racks) {
  for (let i = 0; i < racks.length; i++) {
    document.getElementById("nDevices-" + racks[i].name).innerHTML = '[#dev: ' + racks[i].nDevices + ']';
  }
}


// We use hsl color encoding to keep track of the saturation and light of the color, while generating a random hue
function calculateRandomColor() {
  let h = Math.floor(Math.random() * 361);
  return "hsl(" + h + ", 100%, 38%)";
}
