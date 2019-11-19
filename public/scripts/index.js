const guideList = document.querySelector('.guides');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
let accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');

const setupUI = (user) => {
    if (user){
        if (user.admin) {
            adminItems.forEach(item => item.style.display = 'block');
        }

        //console.log("user: ", user);
        console.log("user.uid: ", user.uid);
        //console.log("user Name: ", db.collection('users').doc(user.uid));

        const html = `<h4>Welcome</h4>
        <div>E-mail address: ${user.email}</div>
        <div class="pink-text">${user.admin ? 'Admin' : ''}</div>`;
        //<div>Your age: ${snapshot.data().age}</div>
        accountDetails.innerHTML = html;

        //toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
    }else{
        //Account info
        accountDetails = '';

        //toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
    }
};

//setting up guides
const setupGuides = (user) => {

    //Login vs Non Login display
    if (user) {
        let html = "";
        const h5 = `<h5 class="center-align">Double-tap on the map to add events</h5>`;
        //Append to HTLM
        html += h5;
        //Output to the DOM at 'guide' class
        guideList.innerHTML = html;
    }else{
        let html = "";
        const h5 = `<h5 class="center-align">Login to add events</h5>`;
        //Append to HTLM
        html += h5;
        //Output to the DOM at 'guide' class
        guideList.innerHTML = html;
    }

};


// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

});
