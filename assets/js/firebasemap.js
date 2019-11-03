// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAOBNCQoIpk9OxjFzPDPlHCFWSXhcrSifA",
    authDomain: "instamap-1571822648090.firebaseapp.com",
    databaseURL: "https://instamap-1571822648090.firebaseio.com",
    projectId: "instamap-1571822648090",
    storageBucket: "instamap-1571822648090.appspot.com",
    messagingSenderId: "256545083049",
    appId: "1:256545083049:web:713bbeb59c00540934e3b8",
    measurementId: "G-7QLKFB80F5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

/////////////////////////////////////////////////////////////////////////////////////
////////////             FUNCTIONS FOR GOOGLE MAP API USE              ///////////////
/////////////////////////////////////////////////////////////////////////////////////
var infoWindow;
var instantClickID;

var events = [];

function initMap() {

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////            USER'S ACTUAL LOCATION CENTERED MAP           ///////////////
    /////////////////////////////////////////////////////////////////////////////////////

    ////////////  GIVE USER'S LOCATION T TIME (MOVING UPDATE)   /////////////////////////
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
        zoom: 6,
        center: {lat: 36.3380, lng: 127.4021}
    });

    infoWindow = new google.maps.InfoWindow;

    // HTML5 geolocation to center map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
             var positionNow = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(positionNow);
            infoWindow.setContent('You are here');
            infoWindow.open(map);
            map.setCenter(positionNow);
        })
    }
    else{console.log("Something went wrong with geolocation")}

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////             REAL TIME UPDATE MARKERS ON MAP              ///////////////
    /////////////////////////////////////////////////////////////////////////////////////
    // var markers = [];


    function updateMarker(markerIndex, change){

        if (change.type == 'removed')
        {deleteMarker(markerIndex);}

        if (change.type == 'modified')
        {
            deleteMarker(markerIndex);
            createMarker(change.doc);
        }

        else if (change.type == 'added')
        {createMarker(change.doc);}
    }

    function deleteMarker(markerIndex){

        var marker = events[markerIndex].marker;
        //Remove the marker of the map
        marker.setMap(null);
        //Remove the marker from "markers" array
        events.splice(markerIndex, 1);
    }

    function createMarker(event){

        var latEvent          = event.data().position._lat;
        var lngEvent          = event.data().position._long;
        var nameEvent         = event.data().name;
        var descriptionEvent  = event.data().description;
        var idEvent           = event.id;

        var newMarker = new google.maps.Marker({
            position: {lat: latEvent, lng: lngEvent},
            map: map,
            title: nameEvent,
            myOwnProperty: idEvent
        });

        var event = {marker: newMarker, name: nameEvent, description: descriptionEvent, upvotes: 0, downvotes: 0}

        // //Add Name and Description to InfoBox
        // var infoBox = '<div>' +
        //     '<h3 class="name">' + nameEvent + '</h3>' +
        //     '<div>' +
        //     '<p class="description">' + descriptionEvent + '</p>' +
        //     '</div>' +
        //     '</div>';

        // //Check function up for info about it
        attachInfo(newMarker);

        // Add newMarker to "markers" array
        // markers.push(newMarker);
        events.push(event);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////             REAL TIME UPDATE FROM DATABASE               ///////////////
    /////////////////////////////////////////////////////////////////////////////////////

    db.collection('events').onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        //For each change in the Database
        changes.forEach(change => {

            //Keep track of Added(= -1) or Modified/Removed(> -1)
            var markerIndex = -1;

            events.forEach(event => {

                //Check if marker already exist - id (strings) are equal or not
                if ( event.marker.myOwnProperty == change.doc.id ) {
                    //Keep track of the marker's index that already exists
                    markerIndex = events.indexOf(event);
                }
            });

            //Take action
            updateMarker(markerIndex, change);

        });
    });


    /////////////////////////////////////////////////////////////////////////////////////
    ////////////                   ADD EVENT BUTTON ACTIONS               ///////////////
    /////////////////////////////////////////////////////////////////////////////////////
    const add_form = document.querySelector('#add-event-form');
    const del_form = document.querySelector('#delete-event-form');
    const new_del_form = document.querySelector('#delete-new-form');

    //Create a new invisible marker (not linked to map)
    var marker = new google.maps.Marker({
        position: {lat:0,lng:0},
        draggable: true,
        title: "Drag me to your event!",
        icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}
    });

    //Create an InfoWindow linked to the previous marker
    var window = new google.maps.InfoWindow({
        content: 'Please add an event'
    });

    const changeEventSidebar = document.querySelector('#createEvent');
    

    //Add event to Database
    add_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();

        db.collection('events').add({
            name : add_form.name.value,
            description : add_form.description.value,
            position : new firebase.firestore.GeoPoint(marker.position.lat(), marker.position.lng())
        });
        //Clear the text in the forms after adding
        add_form.name.value = '';
        add_form.description.value = '';
        changeEventSidebar.style.display = "none";
    });

    //Delete event from Database
    del_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();
        db.collection('events').doc(instantClickID).delete();
        changeEventSidebar.style.display = "none";
    });

    //Remove the marker of adding an event (blue one)
    new_del_form.addEventListener('submit', (e) =>{
        //Prevent reloading the page
        e.preventDefault();
        marker.setMap(null);
        changeEventSidebar.style.display = "none";
    });

    ///////////////////////
    //CLICK TO ADD EVENT//
    ///////////////////////

    //Listen for a double click on the map
    map.addListener('dblclick', function(e) {
        changeEventSidebar.style.display = "block";


        //Remove from the map previous markers if there were some
        marker.setMap(null);

        //Update the marker's position
        placeMarkerAndPanTo(e.latLng, map, marker);

        //Display the new marker on the map
        marker.setMap(map);

        console.log("New Point");
        console.log("Lat: ", e.latLng.lat(), "Long: ", e.latLng.lng());

        //Check marker's position at any time
        marker.addListener('dragend', function(e) {
            //SHOW THE NEW LOCATION AFTER DRAG:)
            console.log("Dragged Point");
            console.log("Lat: ", marker.position.lat(), "Long: ", marker.position.lng());
            console.log("Marker Position: ", marker.position.lat(), marker.position.lng());
        });
        //Delete the listener => Only one event creation
        //google.maps.event.removeListener(addEventListener);
    });

    map.addListener('click', function(){
        eventSidebar.style.display = "none";
    });

    //Listen for a click on the marker added by dbclick
    marker.addListener('click', function() {
        window.open(marker.get('map'), marker);
    });

}

//Place a new marker (event) on a map and center on it
function placeMarkerAndPanTo(latLng, map, marker) {

    //Update marker's position
    marker.position = latLng;
    marker.animation = google.maps.Animation.DROP;

    //Add the marker on the clicked location
    map.panTo(latLng);
}

const eventSidebar = document.querySelector('#event');
// Attaches an info window to a marker with a message showing name and description of the event.
// When the marker is clicked, the info window will show the info.
function attachInfo(marker, info) {
    var infowindow = new google.maps.InfoWindow({
        content: info
    });

    //Listen for a click on the Marker
    marker.addListener('click', function() {
        eventSidebar.style.display = "block";
        index = events.findIndex(i => i.marker === marker);
        var event = events[index];
        document.querySelector('#event-name').innerHTML = event.name;
        document.querySelector('#event-description').innerHTML = event.description;
        document.querySelector('#event-up-votes').innerHTML = event.upvotes;
        document.querySelector('#event-down-votes').innerHTML = event.downvotes;
        // var event = {marker: newMarker, description: descriptionEvent, upvotes: 0, downvotes: 0}
        instantClickID = marker.myOwnProperty;
    });
}

function showAccount(){
    var accountSidebar = document.getElementById("account");
    if (accountSidebar.style.display == "block") { accountSidebar.style.display = "none"; }
    else accountSidebar.style.display = "block";
    return true;
}


// ++++++++++RECAP+++++++++++
//----------------------------
//I was blocked by taking information from the infoWindow (HTML code) in order to
//add data in my database (submit buttons etc.)


// ++++++++++TO DO+++++++++++
//----------------------------
//=> Create a form to confirm our array : then "add" it to the DB
// Handle dates to delete the obsolete markers


