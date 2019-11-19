const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
    // check request is made by an admin
    if ( context.auth.token.admin !== true ) {
        return { error: 'Only admins can add other admins' }
    }
    // get user and add admin custom claim
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        })
    }).then(() => {
        return { message: `Success! ${data.email} has been made an admin.` }
    }).catch(err => {
        return err;
    });
});

exports.showUser = functions.https.onCall((data, context) => {
    return admin.auth().getUser(data.uid)
        .then(function(userRecord) {
            console.log('Successfully fetched user data:', userRecord);
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully fetched user data:', userRecord.toJSON());
        })
        .catch(function(error) {
            console.log('Error fetching user data:', error);
        });
});

function listAllUsers(nextPageToken) {
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
                console.log('user', userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                // List next batch of users.
                listAllUsers(listUsersResult.pageToken);
            }
        })
        .catch(function(error) {
            console.log('Error listing users:', error);
        });
}
// Start listing users from the beginning, 1000 at a time.