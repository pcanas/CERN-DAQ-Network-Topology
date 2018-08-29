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
  When moving the mouse wheel with the control key pressed, we will
  prevent the zooming event and we will move our own zoom slidebar.
*/
window.addEventListener("wheel", function(e) {

  if (e.ctrlKey) {
    e.preventDefault();

    if (window.getComputedStyle(document.getElementById("readyContainer"), null).getPropertyValue("visibility") === "visible") {
      let sliderValue = parseFloat(document.getElementById("zoomSlider").value);
      let sliderMinValue = parseFloat(document.getElementById("zoomSlider").min);
      let sliderMaxValue = parseFloat(document.getElementById("zoomSlider").max);
      let sliderStep = parseFloat(document.getElementById("zoomSlider").step);
      if (e.deltaY > 0) {
        if (sliderValue > sliderMinValue) {
          applyZoomToRepresentation(sliderValue - sliderStep);
        }
      } else {
        if (sliderValue < sliderMaxValue) {
          applyZoomToRepresentation(sliderValue + sliderStep);
        }
      }
    }

  }
});


function applyZoomToRepresentation(scale) {
  document.getElementById("container").style.transform = "scale(" + scale + ")";
  document.getElementById("zoomSlider").value = scale;
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
    - The movement is constraint within the rooms container element
    - In the start, we will set a flag to true so that we do not trigger click events while dragging.
      We also set the ui positions to 0 so that we do not make a jump when start dragging the objects (only occurs when scale !== 1)
    - While dragging, we will calculate the new position based on the scale we have, and we will repaint all the connections.
    - We are skiping the first repainting due to a bug in the painting process. That is why 'draggingCounter' is used.
*/
function setPropertyDraggableToElement(element) {
  element.draggable({
    cancel: ".rackDetailsDeviceList",
    containment: "#roomsContainer",
    start: function(e, ui) {
      if (!e.ctrlKey) {
        ui.position.left = 0;
        ui.position.top = 0;
        draggingCounter = 0;
        dragging = true;
      }
    },
    drag: function(e, ui) {
      if (!e.ctrlKey) {
        let containerScale = document.getElementById("zoomSlider").value;
        let changeLeft = ui.position.left - ui.originalPosition.left;
        let newLeft = ui.originalPosition.left + changeLeft / containerScale;
        let changeTop = ui.position.top - ui.originalPosition.top;
        let newTop = ui.originalPosition.top + changeTop / containerScale;
        ui.position.left = newLeft;
        ui.position.top = newTop;

        if (draggingCounter > 0) jsPlumb.repaintEverything();

        draggingCounter++;
      }
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


var clicked = false, clickY, clickX;
$("#roomsContainer").on({
    'mousemove': function(e) {
        if (clicked && e.ctrlKey){
          updateScrollPos(e);
        } else {
          clicked = false;
          $("#roomsContainer").css('cursor', 'auto');
        }
    },
    'mousedown': function(e) {
        if (e.ctrlKey){
          clicked = true;
          $("#roomsContainer").css('cursor', 'crosshair');
          clickY = e.pageY;
          clickX = e.pageX;
        }
    },
    'mouseup': function() {
        clicked = false;
        $("#roomsContainer").css('cursor', 'auto');
    }
});

var updateScrollPos = function(e) {
    $(window).scrollTop($(window).scrollTop() + (clickY - e.pageY));
    $(window).scrollLeft($(window).scrollLeft() + (clickX - e.pageX));
}
