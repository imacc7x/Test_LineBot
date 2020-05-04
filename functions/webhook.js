//test by Earth

const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.LINE_HEADER_AUTH}`
};

exports.handler = (req, res, db) => {
    if (req.method === "POST") {
        const event = req.body.events[0];
        const eventType = event.type; 
        const userId = event.source.userId;
        const messageType = event.message.type;
        const documentUser = db.collection("Users").doc(userId);

        if (eventType === "follow") {
            follow(documentUser, userId)
        }
        else if (eventType === "unfollow") {
            unfollow(documentUser, userId)
        }
        else if (eventType === "message" && messageType === "text") {
            postToDialogflow(req);
        }
        else {
            reply(
                event.replyToken,
                [{ type: "text", text: JSON.stringify(req.body) }]
            );
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

const follow = (documentUser, userId) => {
    return documentUser.get()
        .then(docSnapshot => {
            if (!docSnapshot.exists) {
                return documentUser.set({
                    active: true
                });
            }
            else {
                return documentUser.update({
                    active: true
                });
            }
        })
        .then(() => {
            return push(
                userId,
                [
                    {
                        type: "text",
                        text: "สวัสดีค่ะ ดิฉันเป็นบอทผู้ช่วยนักให้คำปรึกษาของศูนย์เลิกเหล้า 1413 ยินดีที่ได้พูดคุยกับคุณในวันนี้ค่ะ"
                    },
                    {
                        type: "text",
                        text: "ฉันสามารถให้ข้อมูลเบื้องต้นเกี่ยวกับการดื่มแก่คุณได้ตลอด 24 ชั่วโมง แม้ว่าบางคำถามของคุณ ดิฉันอาจไม่สามารถเข้าใจได้"
                    },
                    {
                        type: "text",
                        text: "แต่ดิฉันก็จะช่วยสรุปข้อมูลที่สำคัญทั้งหมดและส่งต่อให้แก่นักให้คำปรึกษาค่ะดิฉันมั่นใจว่านักให้คำปรึกษาจะช่วยคุณได้แน่นอน"
                    },
                    {
                        type: "text",
                        text: "โดยข้อมูลที่ได้จากการสนทนาที่จะสามารถระบุตัวตนของคุณได้จะไม่มีการเผยแพร่ ดิฉันจึงอยากขอให้คุณอนุญาตให้พวกเขาทำเช่นนั้นก่อน"
                    },
                    {
                        type: "text",
                        text: "คุณจะอนุญาตได้ไหมคะ",
                        quickReply: {
                            items: [
                                {
                                    type: "action",
                                    action: {
                                        type: "postback",
                                        label: "อนุญาติ",
                                        data: "ACTIVATING_CONFIRM"
                                    }
                                },
                                {
                                    type: "action",
                                    action: {
                                        type: "postback",
                                        label: "ไม่อนุญาติ",
                                        data: "ACTIVATING_NOT_CONFIRM"
                                    }
                                }
                            ]
                        }
                    }
                ]
            );
        })
};
const unfollow = (documentUser, userId) => {
    documentUser.update({
        active: false
    })
        .then(() => console.log(userId + ": unfollow"))
        .catch((err) => console.error("Unfollow error: ", err))
}

const postToDialogflow = req => {
    req.headers.host = "bots.dialogflow.com";
    return request.post({
        uri: "https://bots.dialogflow.com/line/2507c003-79b0-4ae8-ab7b-e02a15b246b1/webhook",
        headers: req.headers,
        body: JSON.stringify(req.body)
    });
};