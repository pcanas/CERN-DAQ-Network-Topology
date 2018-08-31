
let activeConnections = [];
let dragging = false;
let draggingCounter = 0; // This variable will be used to skip the repainting in the first dragging iteration
let devicesInfo = {};
let autosearchDevicesInfo = [];
let currentScale = 1;

/*
    Make a call to the database to get the racks of the room.
    We store the useful information and create the room with the predefined settings.
      - id is the hardcoded id that the team gave to the racks
      - dbId is the id given by the database. We store this variable for querying the devices when clicking a rack
*/
function fillRacksRoom(i) {
  if (i === undefined) i = 0;
  $.ajax({
    'url': '/es/api/v1/rack/',
    'type': 'GET',
    'data': {
      format: 'json',
      room: rooms[i].name,
      limit: 500
    },
    success: function(data) {
      let racksRoom = [];
      for (let j = 0; j < data.objects.length; j++) {
        let rackElement = {
          dbId: data.objects[j].id,
          id: ((rooms[i].rack_info[data.objects[j].name] && rooms[i].rack_info[data.objects[j].name].id) ? rooms[i].rack_info[data.objects[j].name].id : ""),
          type: ((rooms[i].rack_info[data.objects[j].name] && rooms[i].rack_info[data.objects[j].name].type) ? rooms[i].rack_info[data.objects[j].name].type : ""),
          name: data.objects[j].name,
          room: data.objects[j].room,
        }
        racksRoom.push(rackElement);
      }
      rooms[i].racks = racksRoom;
      createRoom(rooms[i].name, rooms[i].options, BOXWIDTH, BOXHEIGHT, rooms[i].racks, i);

      // If we are not in the last room, we call the same function for the next room.
      if (++i < rooms.length) fillRacksRoom(i);
    }
  });
}


/*
    Make a call to the databse to get all the devices.
    We will store the info obtained in 2 different arrays:
      - An associative array that will store a device info based on the device name --> devicesInfo
      - An array storing the necessary info for the autocomplete search functionality --> autosearchDeviceInfo
*/
function fillDevicesInfo(url) {
  $.ajax({
    'url': url || '/es/api/v1/device/?format=json&limit=1000',
    'type': 'GET',
    'data': {},
    success: function(data) {
      for (let i = 0; i < data.objects.length; i++) {
        let deviceLocation;
        if (!data.objects[i].rack) {
          deviceLocation = "[null]";
        } else {
          deviceLocation = "[" + data.objects[i].rack.room + "] [" + data.objects[i].rack.name + "]";

          devicesInfo[data.objects[i].name] = {
            id: data.objects[i].id,
            rack: data.objects[i].rack.name,
            room: data.objects[i].rack.room,
            rack_unit: data.objects[i].rack_unit
          };
        }

        let autosearchDeviceInfo = {
          value: data.objects[i].name,
          label: data.objects[i].name,
          desc: deviceLocation,
        }
        autosearchDevicesInfo.push(autosearchDeviceInfo);
      }

      // If we have not obtained all the devices, perform the next call
      if (data.meta.limit + data.meta.offset <= data.meta.total_count) {
        fillDevicesInfo(data.meta.next);

        /*
           I have set this condition to increase UX by reducing the initial loading page time.

           Although the devices arrays are not completely full, setting this conditional will considerably reduce the time to
           load the page while it also gives the necessary time for the devices arrays to get filled before the user performs
           any action that requires them.

           We perform the second checking so that this operation is only done once
        */
        if ((data.meta.limit + data.meta.offset > data.meta.total_count / 2) &&
            (window.getComputedStyle(document.getElementById("readyContainer"), null).getPropertyValue("visibility") === "hidden")) {
          document.getElementById("onLoadContainer").style.display = "none";
          document.getElementsByTagName("html")[0].classList.remove('loadingProcess');
          document.getElementById("readyContainer").style.visibility = "visible";
          setPropertyDraggableToElement ($("#roomMenu"), false);
          setPanzoom();
        }
      } else {
        setDeviceAutocompleteSearch();
      }
    }
  });
}


/*
    jQuery autocomplete function for our search bar.
      - minLength: minimum number of characters to write before the feature to start
      - numberOfResults: constraint to the number of the results shown by the system
*/
function setDeviceAutocompleteSearch() {
  let minLength = 3;
  let numberOfResults = 10

  $("#deviceSearchInput").autocomplete({
      minLength: minLength,
      delay: 0,
      source: autosearchDevicesInfo,
      focus: function(event, ui) {
        document.getElementById("deviceSearchInput").value = ui.item.label;
        return false;
      },
      select: function(event, ui) {
        document.getElementById("deviceSearchInput").value = ui.item.label + " " + ui.item.desc;

        return false;
      },
      create: function() {
        $(this).data('ui-autocomplete')._renderMenu = function(ul, items) {
          let results = 0;
          let that = this;
          $.each(items, function(index, item) {
            if (results === numberOfResults) {
              ul.append("<hr><li id='autocompleteNumberResultsText'><div><strong>Showing the first " + numberOfResults + " results out of " + items.length + "</strong></div></li>")
              return false;
            }
            that._renderItemData(ul, item);
            results++;
          });
        };
      }
    })
    .autocomplete("instance")._renderItem = function(ul, item) {
      return $("<li>")
        .append("<br><div><strong>" + item.label + "</strong>&nbsp;" + item.desc + "</div>")
        .appendTo(ul);
    };
}


document.addEventListener("DOMContentLoaded", function(event) {

  window.scrollTo(0, 0);

  fillRacksRoom();

  fillDevicesInfo();

  // We set this container for the lines to have a common place to be allocated.
  // If the lines were placed within each room, we would have a position mismatch when connecting lines between different rooms.
  jsPlumb.ready(function() {
    jsPlumb.setContainer(document.getElementById("container"));
  });

  // We will update our devices array every hour in case there is a change in the DB
  setInterval(function() {
    autosearchDevicesInfo = [];
    fillDevicesInfo();
  }, 1000 * 60 * 60);
});
