'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const region = "asia-east2";
const runtimeOpts = {
    timeoutSeconds: 10,
    memory: "2GB"
};

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https//test-chatbot-uyotlh.firebaseio.com",
    storageBucket: "gs://test-chatbot-uyotlh.appspot.com"
});

exports.webhook = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
    require('./webhook').handler(req, res, admin);
});
exports.dialogflow = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
    require('./dialogflow').handler(req, res, admin);
});