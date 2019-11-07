function initApp() {
    // Login with Email/Password
    var txtEmail = document.getElementById('inputEmail');
    var txtPassword = document.getElementById('inputPassword');
    var btnLogin = document.getElementById('btnLogin');
    var btnGoogle = document.getElementById('btngoogle');
    var btnSignUp = document.getElementById('btnSignUp');
    //var btnFaceBok = document.getElementById('btnFaceBok');
    var home_page = "maps.html";


    //btnFaceBok.addEventListener('click', function () {
    //    var provider = new firebase.auth.FacebookAuthProvider();
    //    firebase.auth().signInWithPopup(provider).then(function (result) {
    //        // This gives you a Facebook Access Token. You can use it to access the Facebook API. 
    //        var token = result.credential.accessToken;
    //        // The signed-in user info. 
    //        var user = result.user;
    //        window.location = home_page;
    //    }).catch(function (error) {
    //        // Handle Errors here. 
    //        var errorCode = error.code;
    //        var errorMessage = error.message;
    //        // The email of the user's account used. 
    //        var email = error.email;
    //        // The firebase.auth.AuthCredential type that was used. 
    //        var credential = error.credential;
    //    });
    //});

    btnLogin.addEventListener('click', function () {
        var email = txtEmail.value;
        var password = txtPassword.value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function () {

                window.location = home_page;
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                create_alert("error", errorMessage);
                txtEmail.value = "";
                txtPassword.value = "";
            });
    });

    btnGoogle.addEventListener('click', function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                window.location = home_page;
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                create_alert("error", errorMessage);
                txtEmail.value = "";
                txtPassword.value = "";
            });
    });

    btnSignUp.addEventListener('click', function () {
        var email = txtEmail.value;
        var password = txtPassword.value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function () {
                create_alert("success", "You could sign in  right now!");
                txtEmail.value = "";
                txtPassword.value = "";
                window.location = home_page;
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                create_alert("error", errorMessage);
                txtEmail.value = "";
                txtPassword.value = "";
            });
    });

}

function create_alert(type, message) {
    var alertarea = document.getElementById('custom-alert');
    if (type == "success") {
        str_html = "<div class='alert alert-success alert-dismissible fade show' role='alert'><strong>Success! </strong>" + message + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
        alertarea.innerHTML = str_html;
    } else if (type == "error") {
        str_html = "<div class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Error! </strong>" + message + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
        alertarea.innerHTML = str_html;
    }
}

window.onload = function () {
    initApp();
}