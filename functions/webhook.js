//test1

const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');


const region = "asia-east2";
const runtimeOpts = {
    timeoutSeconds: 4,
    memory: "2GB"
};
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';


const LINE_HEADER = {
    "Content-Type": "application/json",
    Authorization: "Bearer Pp6phRvvrfzI5GGPZ+ByKEq/ypv5edDTfh8du1Ij0SCl9if21h0VyCcGRwurc6bCjCshMnMqZ2F+oxfSfiSXKHpDewSloJZloS8WOjhfgnctfwvc/nDLiJc/RED3FXj/ufaL/L84qllM51lv3ZcBewdB04t89/1O/w1cDnyilFU="
};

admin.initializeApp();
const db = admin.firestore();

exports.Test_Chatbot = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
    if (req.method === "POST") {
        console.log("This is UID", req.body.events[0].source.userId);
        let event = req.body.events[0]
        if (event.type === "follow") {
            db.collection("Users").doc(event.source.userId).set({
                userId: event.source.userId,
                activation: 'false'
            });
            activation(req, res);
        }
        else if (event.type === "message" && event.message.type === "text") {
            postToDialogflow(req);
        } else {
            reply(req);
        }
    }
    return res.status(200).send(req.method);
});

const reply = req => {
    return request.post({
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [
                {
                    type: "text",
                    text: JSON.stringify(req.body)
                }
            ]
        })
    });
};

const postToDialogflow = req => {
    req.headers.host = "bots.dialogflow.com";
    return request.post({
        uri: "https://bots.dialogflow.com/line/2507c003-79b0-4ae8-ab7b-e02a15b246b1/webhook",
        headers: req.headers,
        body: JSON.stringify(req.body)
    });
};

const activation = ((req, res) => {
    return request({
        method: "POST",
        uri: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            to: req.body.events[0].source.userId,
            messages: [
                {
                    type: "text",
                    text: "คุณจะอนุญาตได้ไหมคะ",
                    quickReply: {
                        items: [
                            {
                                type: "action",
                                action: {
                                    type: "message",
                                    label: "ได้",
                                    text: "ยืนยันการใช้งาน"
                                }
                            },
                            {
                                type: "action",
                                action: {
                                    type: "message",
                                    label: "ไม่ได้",
                                    text: "ปฏิเสธการใช้งาน"
                                }
                            }
                        ]
                    }
                }
            ]
        })
    }).then(() => {
        return res.status(200).send("Done");
    }).catch(error => {
        return Promise.reject(error);
    });
});


