/*
//Add Admin cloud function
const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    const showUser = functions.httpsCallable('showUser');

    //Call the function
    addAdminRole({ email: adminEmail }).then(result => {
        console.log(result);
    });

    //Call the function
    showUser( auth.currentUser() ).then(result => {
        console.log(result);
    });

});
*/


//Listen to auth changes
auth.onAuthStateChanged(user => {
    //User logged-in
    if (user){

        user.getIdTokenResult().then(idTokenResult => {
            //Get data
            user.admin = idTokenResult.claims.admin;
            setupUI(user);
        });

    } else{
        setupUI();
    }
});


//Sign-up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    // sign-up the user & add firestore data
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        console.log(cred.user);
        //Update the user display name
/*        cred.user.updateProfile({
            displayName: signupForm['signup-name'].value
        }).then(function() {
            // Update successful.
        }).catch(function(error) {
            // An error happened.
        });*/

        //Save the name of the new user in the user account
        return db.collection('users').doc(cred.user.uid).set({
            name: signupForm['signup-name'].value,
        });

    }).then(() => {
        const modal = document.querySelector('#modal-signup');
        //Close the modal after signing in
        M.Modal.getInstance(modal).close();
        //Clear the sign up fields
        signupForm.reset();
        signupForm.querySelector('.error').innerHTML = ''
    }).catch(err => {
        signupForm.querySelector('.error').innerHTML = err.message;
        console.log(err);
    });
});


//Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
});


//Login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    //log the user in
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // close the sign-up modal & reset form
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        //Clear the logging fields
        loginForm.reset();
        loginForm.querySelector('.error').innerHTML = '';
    }).catch(err => {
        loginForm.querySelector('.error').innerHTML = err.message;
    });
});







