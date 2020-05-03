const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": "Bearer Pp6phRvvrfzI5GGPZ+ByKEq/ypv5edDTfh8du1Ij0SCl9if21h0VyCcGRwurc6bCjCshMnMqZ2F+oxfSfiSXKHpDewSloJZloS8WOjhfgnctfwvc/nDLiJc/RED3FXj/ufaL/L84qllM51lv3ZcBewdB04t89/1O/w1cDnyilFU="
};

exports.handler = (req, res, db) => {
    if (req.method === "POST") {
        const event = req.body.events[0];
        const replyToken = req.body.events[0].replyToken;
        const userId = req.body.events[0].source.userId;
        const messageType = req.body.events[0].message.type;

        switch (event.type) {
            case "follow":
                follow(db, userId)
                break;

            case "message" && messageType === "text":
                postToDialogflow(req);
                break;

            case "unfollow":
                db.collection("Users").doc(userId).update({
                    follow: false
                });
                break;

            default:
                const messages = [
                    {
                        type: "text",
                        text: JSON.stringify(req.body)
                    }
                ];
                reply(replyToken, messages);
                break;
        }
    }
    return res.status(200).send(req.method);
};

const reply = (replyToken, messages) => {
    return request.post({
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: replyToken,
            messages: messages
        })
    });
};
const push = (userId, messages) => {
    return request.post({
        uri: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            to: userId,
            messages: messages
        })
    });
};

const follow = (db, userId) => {
    const messages = [];
    const document = db.collection("Users").doc(userId);
    document.get().then(docSnapshot => {
        if (!docSnapshot.exists) {
            document.set({
                follow: true
            });
            messages.push({
                type: "text",
                text: "คุณจะอนุญาตได้ไหมคะ",
                quickReply: {
                    items: [
                        {
                            type: "action",
                            action: {
                                type: "message",
                                label: "อนุญาต",
                                text: "ยืนยันการใช้งาน"
                            }
                        },
                        {
                            type: "action",
                            action: {
                                type: "message",
                                label: "ไม่อนุญาต",
                                text: "ปฏิเสธการใช้งาน"
                            }
                        }
                    ]
                }
            });
        } else {
            document.update({
                follow: true
            });
            messages.push({
                type: "text",
                text: "ดีใจที่คุณกลับมา"
            });
        }
    });
    push(userId, messages);
};

const postToDialogflow = req => {
    req.headers.host = "bots.dialogflow.com";
    return request.post({
        uri: "https://bots.dialogflow.com/line/2507c003-79b0-4ae8-ab7b-e02a15b246b1/webhook",
        headers: req.headers,
        body: JSON.stringify(req.body)
    });
};
