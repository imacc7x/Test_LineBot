'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, Payload } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.handler = (request, response, db) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function activation(agent) {
        agent.add('ขอบคุณมากค่ะ ดิฉันมั่นใจว่าข้อมูลที่คุณให้จะเป็นประโยชน์แก่ทีมผู้สรัางดิฉัน ในการพัฒนาการดูแลผู้ดื่มเหล้าต่อไปแน่นอนค่ะ');
        agent.add('ข้อมูลเบื้องต้นที่ดิฉันจำเป็นต้องทราบ คุณอายุเท่าไหร่คะ');
    }

    function setAge(agent) {
        console.log("This is setProfile function");
        const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;
        console.log("userId: " + userId);
        agent.add("Your userID: " + userId);
        const age = agent.parameters.age;
        agent.add("Your age: " + age);
        db.collection("Users").doc(userId).update({
            age: age
        });

        let careerPayload = new Payload(`LINE`, careerJson, { sendAsMessage: true });
        agent.add(careerPayload);

        // let alcoholTimePayLoad = new Payload(`LINE`, alcoholTimeJson, { sendAsMessage: true });
        // agent.add(alcoholTimePayLoad);

        // agent.add(new Payload(`LINE`, careerJson, { sendAsMessage: true }));
        // agent.add(new Payload(`LINE`, alcoholTimeJson, { sendAsMessage: true }));

        // agent.add(" ดิฉันอยากรู้ปริมาณการดื่มที่คุณดื่มบ่อยๆค่ะ ช่วยเลือกรูปที่อธิบายปริมาณการดื่มของคุณได้ดีที่สุดนะคะ");
    }

    function setCareer(agent){
        console.log("This is setCareer function");
        const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;
        const career = agent.parameters.career;
        agent.add("Your career: " + career);
        db.collection("Users").doc(userId).update({
            career: career
        });
    }


    function test(agent) {
        agent.add('success');
        //agent.add(JSON.stringify(request.body.originalDetectIntentRequest.payload.data.source.userId));
        const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;
        agent.add('userId ' + userId);
        console.log("console log ", userId);
        const users = db.collection("Users");

        return users.doc(userId).get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    agent.add("This is User ID: " + doc.data().name);
                }
            });
    }

    const careerJson = {
        type: "text",
        text: "คุณทำงานอะไรเป็นอาชีพหลักคะ",
        quickReply: {
            items: [
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "ตำรวจ",
                        text: "police"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "ทหาร",
                        text: "soldier"
                    }
                }
            ]
        }
    }

    const alcoholTimeJson = {
        type: "text",
        text: "คุณดื่มเครื่องดื่มแอลกอฮอล์บ่อยไหมคะ",
        quickReply: {
            items: [
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "ไม่เคย",
                        text: "Never"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "ไม่เกินเดือนละครั้ง",
                        text: "Not more than once a month"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "เดือนละ 2 - 4 ครั้ง",
                        text: "2-4 times a month"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "สัปดาห์ละ 2 - 3 ครั้ง",
                        text: "2-3 times a week"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "message",
                        label: "มากกว่า 3 ครั้งต่อสัปดาห์",
                        text: "More than 3 times a week"
                    }
                }
            ]
        }
    }

    const alocoholTypeJson = {
        type: "text",
        text: "โดยส่วนใหญ่ ถ้าคุณดื่ม คุณดื่มอะไรคะ",
        quickReply: {
            items: [
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "เบียร์",
                        data: "Beer"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "ไวน์",
                        data: "wine"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "สุรา",
                        data: "spirits"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "วอดก้า",
                        data: "vodka"
                    }
                },
            ]
        }
    }




    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Activating-confirm', activation);
    intentMap.set('Set Age', setAge);
    intentMap.Map('Set Career', setCareer);
    intentMap.set('test', test);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
};

    // [
    //     {
    //         "quickReplies": {
    //             "title": "test quick replies",
    //             "quickReplies": [
    //                 "1",
    //                 "2"
    //             ]
    //         },
    //         "platform": "LINE"
    //     },
    //     {
    //         "text": {
    //             "text": [
    //                 ""
    //             ]
    //         }
    //     }
    // ]

