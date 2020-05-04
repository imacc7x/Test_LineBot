const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.LINE_HEADER_AUTH}`
};

exports.handler = (req, res, db) => {
    if (req.method === "POST") {
        console.log("Reqest body: ", req.body);

        const event = req.body.events[0];
        const { type, source } = event;
        const docUser = db.collection("Users").doc(source.userId);

        if (type === "follow") {
            follow(docUser, event.replyToken)
                .then( res.status(200).send("Follow is ok.") )
                .catch((err) => console.error("Follow Error: ", err))
        }
        else if (type === "unfollow") {
            docUser.update({ active: false })
                .then( res.status(200).send("Unfollow is ok.") )
                .catch((err) => console.error("Unfollow Error: ", err))
        }
        else if (type === "message") {
            const message = event.message;
            if (message.type === "text") {
                postToDialogflow(req);
            }
            else {
                reply(event.replyToken, [{ type: "text", text: req.body }]);
            }
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

const follow = async (docUser, replyToken) => {
    const user = await docUser.get();
    if (!user.exists) {
        await docUser.set({ active: true });
    }
    else {
        await docUser.update({ active: true });
    }
    const messages = [
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
                            text: "ACTIVATING_CONFIRM"
                        }
                    },
                    {
                        type: "action",
                        action: {
                            type: "postback",
                            label: "ไม่อนุญาติ",
                            text: "ACTIVATING_NOT_CONFIRM"
                        }
                    }
                ]
            }
        }
    ];
    console.log("Reply token from Follow: ", replyToken);
    await reply(replyToken, messages);
    return new Promise((resolve, reject) => {
        resolve();
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