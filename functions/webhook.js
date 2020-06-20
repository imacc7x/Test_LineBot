const functions = require('firebase-functions');
const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${functions.config().webhook.line_header_auth}`
};

exports.handler = (req, res, firebaseAdmin) => {
    if (req.method === "POST") {
        const event = req.body.events[0];
        const { type, source } = event;
        const docUser = firebaseAdmin.firestore().collection("Users").doc(source.userId);

        if (type === "follow") {
            follow(docUser, source.userId, event.replyToken)
                .then(() => res.status(200).send("Follow is ok."))
                .catch((err) => console.error("Follow Error: ", err))
        }
        else if (type === "unfollow") {
            unfollow(docUser, source.userId)
                .then(() => res.status(200).send("Unfollow is ok."))
                .catch((err) => console.error("Unfollow Error: ", err))
        }
        else if (type === "message") {
            const message = event.message;
            if (message.type === "text") {
                postToDialogflow(req);
            }
            else {
                firebaseAdmin.storage().bucket().file('images/bottle.png').get()
                    .then(data => console.log(JSON.stringify(data[1])))
                    .catch(err => console.log(err))
                reply(event.replyToken, [{ type: "text", text: JSON.stringify(event) }]);
            }
            res.status(200).send("post to dialogflow is OK");
        }
    }
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

const delayPush = (userId, messages, delayTime) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(push(userId, messages))
        }, delayTime);
    });
}

const follow = async (documentUser, userId, replyToken) => {
    const user = await documentUser.get()
    if (!user.exists) {
        await documentUser.set({ active: true });

        reply(replyToken, [
            {
                type: "text",
                text: "สวัสดีค่ะ ดิฉันเป็นบอทผู้ช่วยนักให้คำปรึกษาของศูนย์เลิกเหล้า 1413 ยินดีที่ได้พูดคุยกับคุณในวันนี้ค่ะ"
            }
        ]);

        await delayPush(userId, [
            {
                type: "text",
                text: "ฉันสามารถให้ข้อมูลเบื้องต้นเกี่ยวกับการดื่มแก่คุณได้ตลอด 24 ชั่วโมง แม้ว่าบางคำถามของคุณ ดิฉันอาจไม่สามารถเข้าใจได้"
            }
        ], 2000);

        await delayPush(userId, [
            {
                type: "text",
                text: "แต่ดิฉันก็จะช่วยสรุปข้อมูลที่สำคัญทั้งหมดและส่งต่อให้แก่นักให้คำปรึกษาค่ะดิฉันมั่นใจว่านักให้คำปรึกษาจะช่วยคุณได้แน่นอน"
            }
        ], 3000);

        await delayPush(userId, [
            {
                type: "text",
                text: "โดยข้อมูลที่ได้จากการสนทนาที่จะสามารถระบุตัวตนของคุณได้จะไม่มีการเผยแพร่ ดิฉันจึงอยากขอให้คุณอนุญาตให้พวกเขาทำเช่นนั้นก่อน"
            }
        ], 4000);

        await delayPush(userId, [
            {
                type: "text",
                text: "คุณจะอนุญาตได้ไหมคะ",
                quickReply: {
                    items: [
                        {
                            type: "action",
                            action: {
                                type: "message",
                                label: "อนุญาต",
                                text: "อนุญาต"
                            }
                        },
                        {
                            type: "action",
                            action: {
                                type: "message",
                                label: "ไม่อนุญาต",
                                text: "ไม่อนุญาต"
                            }
                        }
                    ]
                }
            }
        ], 5000);
    }
    else {
        await documentUser.update({ active: true });
    }

    return new Promise((resolve, reject) => resolve());
};

// const follow = async (documentUser, replyToken) => {
//     const user = await documentUser.get()
//     if (!user.exists) {
//         await documentUser.set({ active: true });
//         reply(
//             replyToken,
//             [
//                 {
//                     type: "text",
//                     text: "สวัสดีค่ะ ดิฉันเป็นบอทผู้ช่วยนักให้คำปรึกษาของศูนย์เลิกเหล้า 1413 ยินดีที่ได้พูดคุยกับคุณในวันนี้ค่ะ"
//                 },
//                 {
//                     type: "text",
//                     text: "ฉันสามารถให้ข้อมูลเบื้องต้นเกี่ยวกับการดื่มแก่คุณได้ตลอด 24 ชั่วโมง แม้ว่าบางคำถามของคุณ ดิฉันอาจไม่สามารถเข้าใจได้"
//                 },
//                 {
//                     type: "text",
//                     text: "แต่ดิฉันก็จะช่วยสรุปข้อมูลที่สำคัญทั้งหมดและส่งต่อให้แก่นักให้คำปรึกษาค่ะดิฉันมั่นใจว่านักให้คำปรึกษาจะช่วยคุณได้แน่นอน"
//                 },
//                 {
//                     type: "text",
//                     text: "โดยข้อมูลที่ได้จากการสนทนาที่จะสามารถระบุตัวตนของคุณได้จะไม่มีการเผยแพร่ ดิฉันจึงอยากขอให้คุณอนุญาตให้พวกเขาทำเช่นนั้นก่อน"
//                 },
// {
//     type: "text",
//             text: "คุณจะอนุญาตได้ไหมคะ",
//             quickReply: {
//                 items: [
//                     {
//                         type: "action",
//                         action: {
//                             type: "message",
//                             label: "อนุญาต",
//                             text: "อนุญาต"
//                         }
//                     },
//                     {
//                         type: "action",
//                         action: {
//                             type: "message",
//                             label: "ไม่อนุญาต",
//                             text: "ไม่อนุญาต"
//                         }
//                     }
//                 ]
//             }
//         }
//     ]
// );
//     }
//     else {
//         await documentUser.update({ active: true });
//     }

//     return new Promise((resolve, reject) => resolve());
// };

const unfollow = async (documentUser, userId) => {
    await documentUser.update({
        active: false
    });
    console.log(userId + ": unfollow");
    return new Promise((resolve, reject) => resolve());
};

const postToDialogflow = req => {
    req.headers.host = "bots.dialogflow.com";
    return request.post({
        uri: "https://bots.dialogflow.com/line/2507c003-79b0-4ae8-ab7b-e02a15b246b1/webhook",
        headers: req.headers,
        body: JSON.stringify(req.body)
    });
};




