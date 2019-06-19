const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const gcs = require('@google-cloud/storage')();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.onFileChange = functions.storage.object().onFinalize(event => {
    console.log(event)
    return 0;
})