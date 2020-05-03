'use strict';

const webhook = require('./webhook');
const dialogflow = require('./dialogflow');

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const region = "asia-east2";
const runtimeOpts = {
    timeoutSeconds: 4,
    memory: "2GB"
};

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https//test-chatbot-uyotlh.firebaseio.com"
});
const db = admin.firestore();

exports.webhook = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
    webhook.handler(req, res, db);
});
exports.dialogflow = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
    dialogflow.handler(req, res, db);
});