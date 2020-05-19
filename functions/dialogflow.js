'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, Payload } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.handler = (request, response, db) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


    const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function activatingConfirm(agent) {
        agent.add('ขอบคุณมากค่ะ ดิฉันมั่นใจว่าข้อมูลที่คุณให้จะเป็นประโยชน์แก่ทีมผู้สรัางดิฉัน ในการพัฒนาการดูแลผู้ดื่มเหล้าต่อไปแน่นอนค่ะ');
        agent.add('ข้อมูลเบื้องต้นที่ดิฉันจำเป็นต้องทราบ คุณอายุเท่าไหร่คะ');
    }

    function setAge(agent) {
        console.log("This is setProfile function");
        console.log("userId: " + userId);
        agent.add("Your userID: " + userId);
        const age = agent.parameters.age;
        agent.add("Your age: " + age);
        db.collection("Users").doc(userId).update({
            age: age
        });

        agent.add(
            createQuickReply(
                "คุณทำงานอะไรเป็นอาชีพหลักคะ",
                [{ label: "ตำรวจ", text: "police" }, { label: "ทหาร", text: "soldier" }]
            )
        );
    }

    function setCareer(agent) {
        console.log("This is setCareer function");
        const career = agent.parameters.career;
        agent.add("Your career: " + career);
        db.collection("Users").doc(userId).update({
            career: career
        });

        agent.add(
            createQuickReply(
                "คุณดื่มเครื่องดื่มแอลกอฮอล์บ่อยไหมคะ",
                [
                    { label: "ไม่เคย", text: "Never" },
                    { label: "ไม่เกินเดือนละครั้ง", text: "Not more than once a month" },
                    { label: "เดือนละ 2 - 4 ครั้ง", text: "2-4 times a month" },
                    { label: "สัปดาห์ละ 2 - 3 ครั้ง", text: "2-3 times a week" },
                    { label: "มากกว่า 3 ครั้งต่อสัปดาห์", text: "More than 3 times a week" }
                ]
            )
        );
    }

    function setAlcoholTime(agent) {
        console.log("This is setAlcoholTime function");
        const time = agent.parameters.alcohol_time;
        agent.add("Time: " + time);
        db.collection("Users").doc(userId).update({
            alcohol_time: time
        });

        agent.add(
            createQuickReply(
                "โดยส่วนใหญ่ ถ้าคุณดื่ม คุณดื่มอะไรคะ",
                [
                    { label: "เบียร์", text: "beer" },
                    { label: "ไวน์", text: "wine" },
                    { label: "สุรา", text: "spirits" },
                    { label: "วอดก้า", text: "vodka" }
                ]
            )
        );
    }

    function setAlcoholType(agent) {
        console.log("This is setAlcoholTime function");
        const type = agent.parameters.alcohol_type;
        agent.add("Time: " + type);
        db.collection("Users").doc(userId).update({
            alcohol_type: type
        });
    }


    function test(agent) {
        agent.add('success');
        //agent.add(JSON.stringify(request.body.originalDetectIntentRequest.payload.data.source.userId));
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

    function createQuickReply(text, options) {
        if (options.length) {
            let items = options.map( (option) => ( { type: "action", action: { type: "message", ...option} } ) )
            return new Payload(
                `LINE`,
                {
                    type: "text",
                    text: text,
                    quickReply: {
                        items: [...items]
                    }
                },
                { sendAsMessage: true }
            );
        }
    }

   

    // const alocoholPackaging ={
    //     type: "template",
    //     altText: "Test image carousel",
    //     template: {
    //         type: "image_carousel",
    //         columns: [{
    //             imageUrl:"fgg",
    //             action: {
    //                 type: "message",
    //                 label: "ขวด",
    //                 text : "bottle"
    //             }
    //         }]

    //     }
    // }




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
    intentMap.set('Activating-confirm', activatingConfirm);
    intentMap.set('Set Age', setAge);
    intentMap.set('Set Career', setCareer);
    intentMap.set('Set Alcohol Time', setAlcoholTime);
    intentMap.set('Set Alcohol Type', setAlcoholType);
    intentMap.set('test', test);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
};


