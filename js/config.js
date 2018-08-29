const BOXWIDTH = 74;
const BOXHEIGHT = 78;

/*
  Room type is only used to determine the coordinate system used.
    - For SDX rooms, top-left corner represents the highest row and lowest column
    - For USA15 rooms, top-left corner represents the lowest row and highest column
*/
const SDXROOMTYPE = "SDX";
const USA15ROOMTYPE = "USA15";

/*
  We save the rackFormat of each room so that we can focus on the coordinates when creating the room: 'YY-XX', representing column and row number.

  Door's format: rack_position_rotation, where position can be "left", "right", "top" or "bottom", and rotation (optional) defines the rotation of the door
  Stair's format: rack_size_direction, where rack is the top left rack, size is of type "width x height" in rack units and direction is "up" or "down"
  Elevator's format: rack_size, where rack is the top left rack, size is of type "width x height" in rack units
  Wall's format: rack_length_direction_position_long, where rack is the top left rack; length is the length in rack units; direction and position can be:
  "horizontal" and "top" or "bottom", or "vertical" and "left" or "right", respectively; and long indicates if the wall goes a bit longer (concretely, the margin of a rack)
*/
const SDXLEVEL1_OPTIONS = {
    columns: 21,
    rows: 7,
    roomType: SDXROOMTYPE,
    rackFormat: "Y.YY-XX.D1",
    roomTemplate: ["Y.20-02.D1","Y.19-02.D1","Y.18-02.D1","Y.17-02.D1","Y.16-02.D1","Y.15-02.D1","Y.14-02.D1","Y.13-02.D1","Y.12-02.D1","Y.11-02.D1","Y.10-02.D1","Y.09-02.D1","Y.08-02.D1","Y.07-02.D1","Y.06-02.D1","Y.05-02.D1","Y.04-02.D1","Y.03-02.D1",
                    "Y.20-04.D1","Y.19-04.D1","Y.18-04.D1","Y.17-04.D1","Y.16-04.D1","Y.15-04.D1","Y.14-04.D1","Y.13-04.D1","Y.12-04.D1","Y.11-04.D1","Y.10-04.D1","Y.09-04.D1","Y.08-04.D1","Y.07-04.D1","Y.06-04.D1","Y.05-04.D1","Y.04-04.D1","Y.03-04.D1",
                    "Y.20-06.D1","Y.19-06.D1","Y.18-06.D1","Y.17-06.D1","Y.16-06.D1","Y.15-06.D1","Y.14-06.D1","Y.13-06.D1","Y.12-06.D1","Y.11-06.D1","Y.10-06.D1","Y.09-06.D1","Y.08-06.D1","Y.07-06.D1","Y.06-06.D1","Y.05-06.D1","Y.04-06.D1","Y.03-06.D1"
                  ],
    doors: ["Y.21-02.D1_left", "Y.21-07.D1_bottom", "Y.02-07.D1_bottom"]
  };

const SDXLEVEL1_RACKINFO = {
  "Y.19-02.D1" : { id: "95", type: "TPU" },
  "Y.18-02.D1" : { id: "94", type: "TPU" },
  "Y.17-02.D1" : { id: "93", type: "TPU" },
  "Y.16-02.D1" : { id: "92", type: "Empty" },
  "Y.15-02.D1" : { id: "91", type: "Empty" },
  "Y.14-02.D1" : { id: "90", type: "TPU" },
  "Y.13-02.D1" : { id: "89", type: "TPU" },
  "Y.12-02.D1" : { id: "88", type: "TPU" },
  "Y.11-02.D1" : { id: "87", type: "TPU" },
  "Y.10-02.D1" : { id: "86", type: "TPU" },
  "Y.09-02.D1" : { id: "85", type: "TPU" },
  "Y.08-02.D1" : { id: "84", type: "TPU" },
  "Y.07-02.D1" : { id: "83", type: "TPU" },
  "Y.06-02.D1" : { id: "82", type: "TPU" },
  "Y.05-02.D1" : { id: "81", type: "TPU" },
  "Y.04-02.D1" : { id: "80", type: "TPU" },
  "Y.03-02.D1" : { id: "79", type: "TPU" },
  "Y.20-04.D1" : { id: "78", type: "Garage" },
  "Y.19-04.D1" : { id: "77", type: "TPU" },
  "Y.18-04.D1" : { id: "76", type: "TPU" },
  "Y.17-04.D1" : { id: "75", type: "TPU" },
  "Y.16-04.D1" : { id: "74", type: "TPU" },
  "Y.15-04.D1" : { id: "73", type: "TPU" },
  "Y.14-04.D1" : { id: "72", type: "TPU" },
  "Y.13-04.D1" : { id: "71", type: "TPU" },
  "Y.12-04.D1" : { id: "70", type: "TPU" },
  "Y.11-04.D1" : { id: "69", type: "TPU" },
  "Y.10-04.D1" : { id: "68", type: "TPU" },
  "Y.09-04.D1" : { id: "67", type: "TPU" },
  "Y.08-04.D1" : { id: "66", type: "TPU" },
  "Y.07-04.D1" : { id: "65", type: "TPU" },
  "Y.06-04.D1" : { id: "64", type: "TPU" },
  "Y.05-04.D1" : { id: "63", type: "TPU" },
  "Y.04-04.D1" : { id: "62", type: "TPU" },
  "Y.03-04.D1" : { id: "61", type: "TPU" },
  "Y.19-06.D1" : { id: "60", type: "TPU" },
  "Y.18-06.D1" : { id: "59", type: "TPU" },
  "Y.17-06.D1" : { id: "58", type: "TPU" },
  "Y.16-06.D1" : { id: "57", type: "TPU" },
  "Y.15-06.D1" : { id: "56", type: "TPU" },
  "Y.14-06.D1" : { id: "55", type: "TPU" },
  "Y.13-06.D1" : { id: "54", type: "TPU" },
  "Y.12-06.D1" : { id: "53", type: "TPU" },
  "Y.11-06.D1" : { id: "52", type: "TPU" },
  "Y.10-06.D1" : { id: "51", type: "TPU" },
  "Y.09-06.D1" : { id: "50", type: "TPU" },
  "Y.08-06.D1" : { id: "49", type: "TPU" },
  "Y.07-06.D1" : { id: "48", type: "TPU" },
  "Y.06-06.D1" : { id: "47", type: "TPU" },
  "Y.05-06.D1" : { id: "46", type: "TPU" },
  "Y.04-06.D1" : { id: "45", type: "TPU" },
  "Y.03-06.D1" : { id: "44", type: "TPU" }
}

const SDXLEVEL2_OPTIONS = {
    columns: 21,
    rows: 7,
    roomType: SDXROOMTYPE,
    rackFormat: "Y.YY-XX.D2",
    roomTemplate: ["Y.19-02.D2","Y.18-02.D2","Y.17-02.D2","Y.16-02.D2","Y.15-02.D2","Y.14-02.D2","Y.13-02.D2","Y.12-02.D2","Y.11-02.D2","Y.10-02.D2","Y.09-02.D2","Y.08-02.D2","Y.07-02.D2","Y.06-02.D2","Y.05-02.D2","Y.04-02.D2","Y.03-02.D2",
                    "Y.20-04.D2","Y.19-04.D2","Y.18-04.D2","Y.17-04.D2","Y.16-04.D2","Y.15-04.D2","Y.14-04.D2","Y.13-04.D2","Y.12-04.D2","Y.11-04.D2","Y.10-04.D2","Y.09-04.D2","Y.08-04.D2","Y.07-04.D2","Y.06-04.D2","Y.05-04.D2","Y.04-04.D2","Y.03-04.D2",
                    "Y.20-06.D2","Y.19-06.D2","Y.18-06.D2","Y.17-06.D2","Y.16-06.D2","Y.15-06.D2","Y.14-06.D2","Y.13-06.D2","Y.12-06.D2","Y.11-06.D2","Y.10-06.D2","Y.09-06.D2","Y.08-06.D2","Y.04-06.D2","Y.03-06.D2"
                  ],
    doors: ["Y.06-07.D2_bottom"]
};

const SDXLEVEL2_RACKINFO = {
  "Y.19-02.D2" : { id: "27", type: "ATLAS Infr" },
  "Y.18-02.D2" : { id: "28", type: "ATLAS Infr" },
  "Y.17-02.D2" : { id: "29", type: "ATLAS Infr" },
  "Y.16-02.D2" : { id: "30", type: "TDAQ Infr" },
  "Y.15-02.D2" : { id: "31", type: "NW Core" },
  "Y.14-02.D2" : { id: "32", type: "NW Core" },
  "Y.13-02.D2" : { id: "33", type: "NW Core" },
  "Y.12-02.D2" : { id: "34", type: "NW Core" },
  "Y.11-02.D2" : { id: "35", type: "Calib" },
  "Y.10-02.D2" : { id: "36", type: "Garage" },
  "Y.09-02.D2" : { id: "37", type: "Empty" },
  "Y.08-02.D2" : { id: "38", type: "Empty" },
  "Y.07-02.D2" : { id: "39", type: "Empty" },
  "Y.06-02.D2" : { id: "40", type: "Empty" },
  "Y.05-02.D2" : { id: "41", type: "SFO" },
  "Y.04-02.D2" : { id: "42", type: "SFO" },
  "Y.03-02.D2" : { id: "43", type: "SFO" },
  "Y.20-04.D2" : { id: "9", type: "TPU" },
  "Y.19-04.D2" : { id: "10", type: "TPU" },
  "Y.18-04.D2" : { id: "11", type: "TPU" },
  "Y.17-04.D2" : { id: "12", type: "TPU" },
  "Y.16-04.D2" : { id: "13", type: "TPU" },
  "Y.15-04.D2" : { id: "14", type: "TDAQ Infr" },
  "Y.14-04.D2" : { id: "15", type: "TDAQ Infr" },
  "Y.13-04.D2" : { id: "16", type: "TPU" },
  "Y.12-04.D2" : { id: "17", type: "TPU" },
  "Y.11-04.D2" : { id: "18", type: "TPU" },
  "Y.10-04.D2" : { id: "19", type: "TPU" },
  "Y.09-04.D2" : { id: "20", type: "TPU" },
  "Y.08-04.D2" : { id: "21", type: "TPU" },
  "Y.07-04.D2" : { id: "22", type: "TPU" },
  "Y.06-04.D2" : { id: "23", type: "TPU" },
  "Y.05-04.D2" : { id: "24", type: "TPU" },
  "Y.04-04.D2" : { id: "25", type: "TPU" },
  "Y.03-04.D2" : { id: "26", type: "TPU" },
  "Y.17-06.D2" : { type: "ATCN" },
  "Y.15-06.D2" : { type: "ATCN" },
  "Y.14-06.D2" : { type: "ATCN" },
  "Y.13-06.D2" : { id: "1", type: "TPU" },
  "Y.12-06.D2" : { id: "2", type: "TPU" },
  "Y.11-06.D2" : { id: "3", type: "TPU" },
  "Y.10-06.D2" : { id: "4", type: "TPU" },
  "Y.09-06.D2" : { id: "5", type: "TPU" },
  "Y.08-06.D2" : { id: "6", type: "TPU" },
  "Y.04-06.D2" : { id: "7", type: "TPU" },
  "Y.03-06.D2" : { id: "8", type: "TPU" }
}

const USA15LEVEL1_OPTIONS = {
    columns: 31,
    rows: 21,
    roomType: USA15ROOMTYPE,
    rackFormat: "Y.YY-XX.A1",
    roomTemplate: ["Y.22-21.A1","Y.23-21.A1","Y.24-21.A1","Y.25-21.A1","Y.26-21.A1","Y.27-21.A1","Y.28-21.A1","Y.29-21.A1","Y.30-21.A1",
                    "Y.03-19.A1","Y.04-19.A1","Y.05-19.A1","Y.06-19.A1","Y.07-19.A1","Y.08-19.A1","Y.09-19.A1","Y.22-19.A1","Y.23-19.A1","Y.24-19.A1","Y.25-19.A1","Y.26-19.A1","Y.27-19.A1","Y.28-19.A1","Y.29-19.A1","Y.30-19.A1",
                    "Y.03-16.A1","Y.04-16.A1","Y.05-16.A1","Y.06-16.A1","Y.07-16.A1","Y.08-16.A1","Y.09-16.A1","Y.22-16.A1","Y.23-16.A1","Y.24-16.A1","Y.25-16.A1","Y.26-16.A1","Y.27-16.A1","Y.28-16.A1","Y.29-16.A1","Y.30-16.A1",
                    "Y.03-14.A1","Y.04-14.A1","Y.05-14.A1","Y.06-14.A1","Y.07-14.A1","Y.08-14.A1","Y.09-14.A1","Y.22-14.A1","Y.23-14.A1","Y.24-14.A1","Y.25-14.A1","Y.26-14.A1","Y.27-14.A1","Y.28-14.A1","Y.29-14.A1","Y.30-14.A1",
                    "Y.07-12.A1",
                    "Y.03-11.A1","Y.04-11.A1","Y.05-11.A1","Y.06-11.A1","Y.22-11.A1","Y.23-11.A1","Y.24-11.A1","Y.25-11.A1","Y.26-11.A1","Y.27-11.A1","Y.28-11.A1","Y.29-11.A1","Y.30-11.A1",
                    "Y.22-07.A1","Y.23-07.A1",
                    "Y.02-05.A1","Y.03-05.A1","Y.04-05.A1","Y.05-05.A1","Y.06-05.A1","Y.22-05.A1","Y.23-05.A1","Y.24-05.A1","Y.25-05.A1","Y.26-05.A1","Y.27-05.A1","Y.28-05.A1","Y.29-05.A1","Y.30-05.A1",
                    "Y.02-02.A1","Y.03-02.A1","Y.04-02.A1","Y.05-02.A1","Y.06-02.A1","Y.07-02.A1","Y.08-02.A1","Y.09-02.A1","Y.10-02.A1","Y.11-02.A1","Y.12-02.A1","Y.13-02.A1","Y.14-02.A1","Y.15-02.A1","Y.20-02.A1","Y.21-02.A1","Y.22-02.A1","Y.23-02.A1","Y.24-02.A1","Y.25-02.A1","Y.26-02.A1","Y.27-02.A1","Y.28-02.A1","Y.29-02.A1","Y.30-02.A1"
                  ],
    doors: ["Y.22-21.A1_top_inverse", "Y.12-18.A1_left", "Y.12-17.A1_left_inverse", "Y.13-14.A1_top", "Y.14-14.A1_top_inverse", "Y.19-18.A1_right", "Y.19-17.A1_right_inverse"],
    stairs: ["Y.25-09.A1_1x3_up"],
    elevators: ["Y.11-09.A1_5x3"],
    walls: ["Y.12-21.A1_10_vertical_left", "Y.19-21.A1_18_vertical_right", "Y.12-14.A1_8_horizontal_top", "Y.16-14.A1_10_vertical_left", "Y.09-11.A1_3_horizontal_top_long",
            "Y.14-03.A1_6_horizontal_top", "Y.09-04.A1_7_horizontal_top_long", "Y.09-11.A1_7_vertical_left", "Y.14-04.A1_1_vertical_left", "Y.09-08.A1_2_horizontal_bottom_long",
            "Y.03-09.A1_4_horizontal_top", "Y.03-06.A1_4_horizontal_top", "Y.03-09.A1_3_vertical_left", "Y.06-09.A1_3_vertical_right",
            "Y.27-09.A1_4_horizontal_top", "Y.27-06.A1_4_horizontal_top", "Y.27-09.A1_3_vertical_left", "Y.30-09.A1_3_vertical_right"]
};

const USA15LEVEL1_RACKINFO = {
  "Y.02-05.A1" : { type: "ROS" },
  "Y.03-05.A1" : { type: "ROS" },
  "Y.04-05.A1" : { type: "TDAQ Infr" },
  "Y.05-05.A1" : { type: "ROS" },
  "Y.06-05.A1" : { type: "NW Core" },
  "Y.04-11.A1" : { type: "ATCN" },
  "Y.04-14.A1" : { type: "ATCN" },
  "Y.08-14.A1" : { type: "ATCN" },
  "Y.09-14.A1" : { type: "ROS" },
  "Y.22-16.A1" : { type: "ROS" },
  "Y.23-16.A1" : { type: "ROS" },
  "Y.24-16.A1" : { type: "TDAQ Infr" },
  "Y.28-16.A1" : { type: "ATCN" },
  "Y.28-19.A1" : { type: "ATCN" },
  "Y.29-19.A1" : { type: "ATCN" },
  "Y.22-21.A1" : { type: "ATCN" },
  "Y.23-21.A1" : { type: "ATCN" },
  "Y.25-21.A1" : { type: "ROS" },
  "Y.26-21.A1" : { type: "ROS" }
};

const USA15LEVEL2_OPTIONS = {
    columns: 31,
    rows: 22,
    roomType: USA15ROOMTYPE,
    rackFormat: "Y.YY-XX.A2",
    roomTemplate: ["Y.04-21.A2","Y.05-21.A2","Y.06-21.A2","Y.07-21.A2","Y.08-21.A2","Y.09-21.A2","Y.10-21.A2","Y.11-21.A2","Y.12-21.A2","Y.13-21.A2","Y.14-21.A2","Y.15-21.A2","Y.16-21.A2","Y.17-21.A2","Y.18-21.A2","Y.22-21.A2","Y.23-21.A2","Y.24-21.A2","Y.25-21.A2","Y.26-21.A2","Y.27-21.A2","Y.28-21.A2","Y.29-21.A2",
                    "Y.04-19.A2","Y.05-19.A2","Y.06-19.A2","Y.07-19.A2","Y.08-19.A2","Y.09-19.A2","Y.10-19.A2","Y.11-19.A2","Y.12-19.A2","Y.13-19.A2","Y.14-19.A2","Y.15-19.A2","Y.16-19.A2","Y.17-19.A2","Y.18-19.A2","Y.22-19.A2","Y.23-19.A2","Y.24-19.A2","Y.25-19.A2","Y.26-19.A2","Y.27-19.A2","Y.28-19.A2","Y.29-19.A2",
                    "Y.04-16.A2","Y.05-16.A2","Y.06-16.A2","Y.07-16.A2","Y.08-16.A2","Y.09-16.A2","Y.10-16.A2","Y.11-16.A2","Y.12-16.A2","Y.13-16.A2","Y.14-16.A2","Y.15-16.A2","Y.16-16.A2","Y.17-16.A2","Y.18-16.A2","Y.22-16.A2","Y.23-16.A2","Y.24-16.A2","Y.25-16.A2","Y.26-16.A2","Y.27-16.A2","Y.28-16.A2","Y.29-16.A2",
                    "Y.04-14.A2","Y.05-14.A2","Y.06-14.A2","Y.07-14.A2","Y.08-14.A2","Y.09-14.A2","Y.10-14.A2","Y.11-14.A2","Y.12-14.A2","Y.13-14.A2","Y.14-14.A2","Y.15-14.A2","Y.16-14.A2","Y.17-14.A2","Y.18-14.A2","Y.22-14.A2","Y.23-14.A2","Y.24-14.A2","Y.25-14.A2","Y.26-14.A2","Y.27-14.A2","Y.28-14.A2","Y.29-14.A2",
                    "Y.04-11.A2","Y.05-11.A2","Y.06-11.A2","Y.07-11.A2","Y.08-11.A2","Y.22-11.A2","Y.23-11.A2","Y.24-11.A2","Y.25-11.A2","Y.26-11.A2","Y.27-11.A2","Y.28-11.A2","Y.29-11.A2",
                    "Y.05-09.A2","Y.06-09.A2","Y.07-09.A2","Y.24-09.A2","Y.25-09.A2",
                    "Y.05-07.A2","Y.06-07.A2","Y.07-07.A2","Y.24-07.A2","Y.25-07.A2",
                    "Y.04-05.A2","Y.05-05.A2","Y.06-05.A2","Y.07-05.A2","Y.08-05.A2","Y.25-05.A2","Y.26-05.A2","Y.27-05.A2","Y.28-05.A2","Y.29-05.A2",
                    "Y.04-02.A2","Y.05-02.A2","Y.06-02.A2","Y.07-02.A2","Y.08-02.A2","Y.09-02.A2","Y.10-02.A2","Y.11-02.A2","Y.12-02.A2","Y.16-02.A2","Y.17-02.A2","Y.18-02.A2","Y.19-02.A2","Y.20-02.A2","Y.21-02.A2","Y.22-02.A2","Y.23-02.A2","Y.24-02.A2","Y.25-02.A2","Y.26-02.A2","Y.27-02.A2","Y.28-02.A2","Y.29-02.A2"
                  ],
    doors: ["Y.20-22.A2_top_inverse"],
    stairs: ["Y.23-09.A2_1x3_down"],
    elevators: ["Y.11-09.A2_5x3"],
    walls: ["Y.19-11.A2_8_vertical_right", "Y.16-11.A2_4_horizontal_top", "Y.16-11.A2_7_vertical_left","Y.14-03.A2_6_horizontal_top",
            "Y.09-04.A2_7_horizontal_top_long", "Y.09-09.A2_5_vertical_left", "Y.14-04.A2_1_vertical_left", "Y.09-08.A2_2_horizontal_bottom_long"]
};

const USA15LEVEL2_RACKINFO = {
  "Y.05-02.A2" : { type: "ROS" },
  "Y.12-02.A2" : { type: "ATCN" },
  "Y.20-02.A2" : { type: "ATCN" },
  "Y.29-02.A2" : { type: "ATCN" },
  "Y.25-09.A2" : { type: "ROS" },
  "Y.05-11.A2" : { type: "ATCN" },
  "Y.07-11.A2" : { type: "ROS" },
  "Y.11-14.A2" : { type: "ATCN" },
  "Y.12-14.A2" : { type: "ATCN" },
  "Y.18-14.A2" : { type: "ATCN" },
  "Y.04-16.A2" : { type: "ROS" },
  "Y.05-16.A2" : { type: "ROS" },
  "Y.06-16.A2" : { type: "ROS" },
  "Y.07-16.A2" : { type: "ROS" },
  "Y.08-16.A2" : { type: "ROS" },
  "Y.09-16.A2" : { type: "ROS" },
  "Y.10-16.A2" : { type: "ATCN" },
  "Y.11-16.A2" : { type: "ATCN" },
  "Y.12-16.A2" : { type: "ATCN" },
  "Y.13-16.A2" : { type: "ATCN" },
  "Y.18-16.A2" : { type: "ATCN" },
  "Y.17-19.A2" : { type: "ROS" },
  "Y.18-19.A2" : { type: "NW Core" },
  "Y.18-21.A2" : { type: "ATCN" }
};

/*
    Room names must match with the name in the DB
*/
let rooms = [
  {
    name: 'SDX Level 1',
    options: SDXLEVEL1_OPTIONS,
    rack_info: SDXLEVEL1_RACKINFO
  },
  {
    name: 'SDX Level 2',
    options: SDXLEVEL2_OPTIONS,
    rack_info: SDXLEVEL2_RACKINFO
  },
  {
    name: 'USA15 Level 1',
    options: USA15LEVEL1_OPTIONS,
    rack_info: USA15LEVEL1_RACKINFO
  },
  {
    name: 'USA15 Level 2',
    options: USA15LEVEL2_OPTIONS,
    rack_info: USA15LEVEL2_RACKINFO
  }
];

/*
  If you add a new rack type, do not forget to set a background color associated to it by:
      - Defining the variables with the background color in config.css
      - Creating the css rules for the new type in boxStyles.css
  You have the other rack types as reference.
*/
const RACKTYPES = ["NW Core", "ATCN", "ROS", "TPU", "SFO", "Calib", "ATLAS Infr", "TDAQ Infr", "Garage", "Empty"];
