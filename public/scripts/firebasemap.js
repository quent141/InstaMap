
/////////////////////////////////////////////////////////////////////////////////////
////////////             FUNCTIONS FOR GOOGLE MAP API USE              ///////////////
/////////////////////////////////////////////////////////////////////////////////////

var infoWindow;
var instantClickID;
const existingMarkerLink = document.querySelectorAll('.clickMarker');
const dbclickHideLink = document.querySelectorAll('.dbclickedHide');
const doubleTapOnTheMapToAdd = document.querySelectorAll('.infoDoubleTap');
const addEventWarning = document.querySelector('#guide-list');


function initMap() {

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////            USER'S ACTUAL LOCATION CENTERED MAP           ///////////////
    /////////////////////////////////////////////////////////////////////////////////////

    ///  GIVE USER'S LOCATION T TIME (MOVING UPDATE)   /////////////////////////
    /////////// clearWatch() - Stops the watchPosition() method. ////////////////////////
    /*
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(showPosition, showError);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
    */

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 36.37, lng: 127.36},
        disableDoubleClickZoom: true,
        fullscreenControl: false,
        gestureHandling: 'greedy',
    });
    infoWindow = new google.maps.InfoWindow;
    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);



    // HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            var positionNow = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(positionNow);
            infoWindow.setContent(
                '<div class="container">' +
                '<ul class="collapsible z-depth-0 guides logged-in" style="border: none;">' +
                '<h6 class="center-align">' + "You are here" + '</h6>' +
                '</ul>' +
                '</div>'
            );
            infoWindow.open(map);
            map.setCenter(positionNow);
            map.setZoom(16);

        }, error =>{
            console.log("error detecting position")
        }, {
            enableHighAccuracy: true,
        });
    }
    else{ alert.log("In order for the app to run easily, please turn on geolocation") }

    //Listen for a click on the map
    map.addListener('click', function() {
        //Removes the "delete marker button" from UI
        existingMarkerLink.forEach(item => item.style.display = 'none');
        doubleTapOnTheMapToAdd.forEach(item => item.style.display = 'block');
        //Info Window of new event marker
        window.close();
        //Info Window of "you are around here" localization
        infoWindow.close()
    });


    /////////////////////////////////////////////////////////////////////////////////////
    ////////////             REAL TIME UPDATE MARKERS ON MAP              ///////////////
    /////////////////////////////////////////////////////////////////////////////////////
    var markers = [];
    // Add a marker clusterer to manage the markers
    var mcOptions = {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    };
    var markerClusterer = new MarkerClusterer(map, markers,mcOptions);

    function updateMarker(markerIndex, change){

        if (change.type == 'removed')
        {deleteMarker(markerIndex);}

        if (change.type == 'modified')
        {
            deleteMarker(markerIndex);
            createMarker(change.doc);
        }

        if (change.type == 'added')
        {
            //Get the document id of the event
            var id = change.doc.id;
            //Get expiration date of the event
            var expirationDate = change.doc.data().expirationDate.toDate();
            var actualDate = new Date();
            //Checks if expired
            var elapsedMs = expirationDate - actualDate;
            var expiryMs = Math.max(elapsedMs, 0);

            //Only Not Expired events are shown on the map
            if(expiryMs != 0) {
                createMarker(change.doc);
            }
            //Otherwise we try to delete the expired events
            else {
                db.collection('events').doc(id)
                    .delete()
                    .then(() => {
                        console.log("Trying to delete an expired event...")
                    })
                    .catch(err =>{
                        console.log("...but this event needs to be deleted by another user: ", err)
                    });
            }
        }

    }

    function deleteMarker(markerIndex){
        var marker = markers[markerIndex];
        //Remove the marker of the map
        marker.setMap(null);
        //Remove the marker from "markers" array
        markers.splice(markerIndex, 1);
        //Update Cluster of markers
        markerClusterer.clearMarkers();
        markerClusterer.addMarkers(markers);
    }

    // Attaches an info window to a marker with a message showing name and description of the event.
    // When the marker is clicked, the info window will show the info. When the map is clicked, the info
    // window/s of selected marker/s will disappear
    function attachInfo(marker, info) {
        var infowindow = new google.maps.InfoWindow({
            content: info
        });

        //Listen for a click on the Marker
        marker.addListener('click', function() {
            infowindow.open(marker.get('map'), marker);
            instantClickID = marker.myOwnProperty[0];
            //Allows the "delete marker button to appear"
            existingMarkerLink.forEach(item => item.style.display = 'block');
            doubleTapOnTheMapToAdd.forEach(item => item.style.display = 'none');
        });

        map.addListener('click', function () {
            infowindow.close();
        });
    }
    function createMarker(event){

        var latEvent          = event.data().position._lat;
        var lngEvent          = event.data().position._long;
        var nameEvent         = event.data().name;
        var descriptionEvent  = event.data().description;
        var expirationDate    = event.data().expirationDate;
        var idEvent           = event.id;
        var author = "";

        //Get the author name
        db.collection('users').doc(event.data().id).get().then( function(doc) {
            if (doc.exists) {
                author = doc.data().name;
            } else {
                author = "an unknown artist"
            }

            var newMarker = new google.maps.Marker({
                position: {lat: latEvent, lng: lngEvent},
                map: map,
                animation: google.maps.Animation.DROP,
                label: {
                    color: 'black',
                    text: '💌',
                },
                myOwnProperty: [idEvent, expirationDate],
            });

            /*//Set a special ICON for the user's markers
            if (event.data().id == undefined || auth.currentUser.uid == null){}
            else {
                //Set a green marker indeed
                if ((event.data().id).localeCompare(auth.currentUser.uid) == 0) {
                    newMarker.setIcon("/images/maps.png");
                }
                //Usual Red marker for an event
                else {}
            }*/

            //Add Name and Description to InfoBox
            var infoBox = '<div>' +
                '<h6>' + nameEvent + '</h6>' +
                '<div>' +
                '<p>' + descriptionEvent + '</p>' +
                '<p>' + '</p>' +
                '<p>Written by: <b>' + author + '</b></p>' +
                '</div>' +
                '</div>';

            console.log(author);

            //Attach an InfoWindow to marker
            attachInfo(newMarker, infoBox);

            // Add newMarker to "markers" array
            markers.push(newMarker);
            //Update the cluster of markers
            markerClusterer.addMarkers(markers);


        }).catch(function(error) {
            console.log("Error getting author:", error);
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////             REAL TIME UPDATE FROM DATABASE               ///////////////
    /////////////////////////////////////////////////////////////////////////////////////

    //Constantly checks for a change on the Database documents
    // of 'events' (added, removed, modified)
    db.collection('events').onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        //For each change in the Database
        changes.forEach(change => {
            //Keep track of Added(= -1) or Modified/Removed(> -1)
            var markerIndex = -1;

            markers.forEach(marker => {
                //Check if marker already exist (modified or deleted marker)
                if ( marker.myOwnProperty[0] == change.doc.id ) {
                    //Keep track of the existing marker's index
                    markerIndex = markers.indexOf(marker);
                }

            });

            //Take action
            updateMarker(markerIndex, change);

        });
    });

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////                 HANDLING EXPIRED EVENTS                  ///////////////
    /////////////////////////////////////////////////////////////////////////////////////

    //Function to remove expired markers from map
    function handleExpiredMarker(){

        markers.forEach(marker => {

            //Get marker's ID
            var id = marker.myOwnProperty[0];

            //Get expiration date of the marker
            var expirationDate = marker.myOwnProperty[1].toDate();
            var actualDate = new Date();

            //Checks if expired
            var elapsedMs = expirationDate - actualDate;
            var expiryMs = Math.max(elapsedMs, 0);

            //Expired event
            if(expiryMs == 0) {
                //Tries to delete marker from Database (NEED LOGIN)
                console.log("inside expiryMs == 0");
                db.collection('events').doc(id)
                    .delete()
                    .then(() => {
                        console.log("Trying to delete an expired event...")
                    })
                    .catch(err =>{
                        console.log("...but this event needs to be deleted by another user: ", err)
                    });
            }
        });
    }

    //Handle Expired markers every 10 minutes
    setInterval(function () {
        handleExpiredMarker();
    }, 10 * 60 * 1000);


    /////////////////////////////////////////////////////////////////////////////////////
    ////////////            ADD/REMOVE EVENT BUTTON ACTIONS               ///////////////
    /////////////////////////////////////////////////////////////////////////////////////
    const add_form = document.querySelector('#add-event-form');
    const del_form = document.querySelector('#delete-event-form');
    const new_del_form = document.querySelector('#delete-new-form');

    //Create a new invisible marker (not linked to map)
    var marker = new google.maps.Marker({
        position: {lat:0,lng:0},
        draggable: true,
        title: "Drag me to your event!",
        icon: "/images/blue-marker.png",
        animation : null
    });

    //Attach InfoWindow to marker to explain how to create a new event
    var window = new google.maps.InfoWindow({
        content: 'My new event!'
    });


    //Add event to Database
    add_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();
        //Remove the marker of adding an event (blue one)
        marker.setMap(null);

        //Remove the "ADD EVENT" menu from website
        dbclickLink.forEach(item => item.style.display = 'none');
        existingMarkerLink.forEach(item => item.style.display = 'none');
        dbclickHideLink.forEach(item => item.style.display = 'block');
        doubleTapOnTheMapToAdd.forEach(item => item.style.display = 'block');

        //Get current time (in ms)
        var time = new Date().getTime();
        //Set Time to live for a marker before deletion
        var TTL = 24 * 60 * 60 * 1 * 1000;
        //Parse ms to Date()
        var date = new Date(time + TTL);

        if( typeof(add_form.name.value) == "string" && typeof(add_form.description.value) == "string" ) {

            if( add_form.name.value.length >= 4 && add_form.name.value.length <= 30
                && add_form.description.value.length <= 900 ) {

                db.collection('events').add({
                    name : add_form.name.value,
                    description : add_form.description.value,
                    expirationDate : firebase.firestore.Timestamp.fromDate(date),
                    position : new firebase.firestore.GeoPoint(marker.position.lat(),
                        marker.position.lng()),
                    id : auth.currentUser.uid,
                }).then(() => {
                    console.log("success add");
                }).catch((err) => {
                    console.log("failed add: ", err);
                });

                //Clear the text in the forms after adding
                add_form.name.value = '';
                add_form.description.value = '';

                //Don't display any warning
                addEventWarning.querySelector('.warning').innerHTML = '';

            } else {
                addEventWarning.querySelector('.warning').innerHTML = "'Name' length :" +
                    " between 4 and 30 characters. 'Description' length : less than 900 characters";
            }

        } else {
            addEventWarning.querySelector('.warning').innerHTML = 'Please fill all the fields to add an event';
        }
    });

    //Delete event from Database
    del_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();
        db.collection('events').doc(instantClickID).delete()
            .then(() => {
                console.log("successfull delete");
            }).catch((err) => {
            console.log("fail delete: ", err);
        }, err => {
                console.log("error: ", err)
        });
        existingMarkerLink.forEach(item => item.style.display = 'none');
        doubleTapOnTheMapToAdd.forEach(item => item.style.display = 'block');
    });

    //Remove the marker of adding an event (blue one)
    new_del_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();
        marker.setMap(null);
        //Remove the "ADD EVENT" menu from website
        dbclickLink.forEach(item => item.style.display = 'none');
        dbclickHideLink.forEach(item => item.style.display = 'block');
    });


    /////////////////////////////////////////////////////////////////////////////////////
    ////////////        ADDING AN POTENTIAL EVENT BY DOUBLE CLICK         ///////////////
    /////////////////////////////////////////////////////////////////////////////////////
    const dbclickLink = document.querySelectorAll('.dbclicked');

    //Listen for a double click on the map to add potential new event
    map.addListener('dblclick', function(e) {

        //Remove from the map previous markers if there were some
        marker.setMap(null);

        //Update the marker's position
        placeMarkerAndPanTo(e.latLng, map, marker);

        //Display the new marker on the map
        marker.setMap(map);

        //Check marker's position at any time
        marker.addListener('dragend', function(e) {

        });
        //Delete the listener => Only one event creation
        //google.maps.event.removeListener(addEventListener);

        existingMarkerLink.forEach(item => item.style.display = 'none');
        dbclickLink.forEach(item => item.style.display = 'block');
        dbclickHideLink.forEach(item => item.style.display = 'none');
    });

    //Listen for a click on the potential new events' marker (added with double click)
    marker.addListener('click', function() {
        window.open(marker.get('map'), marker);
        existingMarkerLink.forEach(item => item.style.display = 'none');
    });
}

//Place a new marker (event) on a map and center on it
function placeMarkerAndPanTo(latLng, map, marker) {

    //Update marker's position
    marker.position = latLng;

    //Add the marker on the clicked location
    map.panTo(latLng);
}


/**
 * The CenterControl adds a control to the map that recenters the map on
 * the user location
 * This constructor takes the control DIV as an argument.
 * @constructor
 */
function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '8px';
    controlUI.style.marginRight = '8px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'My Position';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '16px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = "<img src='/images/locate.png' alt='locate-me' style='margin-top: 5px; margin-bottom: 3px;'>";
    controlUI.appendChild(controlText);


    // Setup the click event listeners: simply set the map to user location
    controlUI.addEventListener('click', function() {

        // HTML5 geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {

                var positionNow = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(positionNow);
                infoWindow.setContent(
                    '<div class="container">' +
                    '<ul class="collapsible z-depth-0 guides logged-in" style="border: none;">' +
                    '<h6 class="center-align">' + "You are here" + '</h6>' +
                    '</ul>' +
                    '</div>'
                );
                infoWindow.open(map);
                map.setCenter(positionNow);

            }, error => {
                console.log("error detecting position")
            }, {
                enableHighAccuracy: true,
            });
        } else { alert ("You need to turn on geolocation on your device") }
    });

}



// ++++++++++TO DO+++++++++++
// ----------------------------
// Handle dates to delete the obsolete markers
// Make the user choose the date when to delete the marker
// Handle security rules/access (del,add etc.)


//Don't add expired data in createMarker()
//SetInterval 1minute after
