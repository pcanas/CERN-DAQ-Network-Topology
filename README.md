## Net Vision Web

Application made by __Pablo Canas Castellanos__ during the CERN Summer Students Program 2018.

The application is a Visualization Tool for DAQ Network Topology. In it you can:
* Display an accurate map of the rooms in the data center
* Get some information about the racks, such as their devices, their type or their id
* Display the connections between devices, racks and rooms

The main motivations to create this app are:
* To provide a visual representation of the Network DB, to accelerate the learning process of new Netadmins
* To reduce intervention time, as it is very easy to locate devices, interfaces and links
* To provide a more specific visualization tool for the DAQ team, also including the connections between devices.

Technologies used in the development of the application are:
* Front-end: HTML, CSS and JS. Frameworks include jQuery, jsPlumb and Panzoom
* Back-end: Django and Tastypie

The two main files users should look at to configure the applications are:
```
js/config.js
css/config.css
```
In those files you can configure the rooms and the basic styling of the app

<br />
### Possible improvements for the app

We underline some of the main improvements that future developers could work on:
* Implement our own connections generator:
  * Will not depend on jsPlumb any more (bad documented library)
  * Will reduce the performance issues when we have hundreds of connections at the same time
* Implement our own dragging function:
  * Solve the dragging issue for rooms when they are scaled
  * Will solve some performance issues with jQuery dragging
* Make a dashline for connections that are going to rooms which are hidden by colliding with other rooms
* Solve issues with label generation:
  * Include a list of interfaces when the device is connected by more than 1 interface
  * Include a list of devices when a the rack details box is hidden and several connections go to the rack
* Make the page printable so that users can save representations of the room for their records
* Increase support to other browsers (currently Firefox and Chrome).

<br />
For any further enquiries, you can contact me at: pablocanas97@gmail.com
