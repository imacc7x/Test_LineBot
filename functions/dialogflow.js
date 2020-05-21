'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, Payload } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.handler = (request, response, firebaseAdmin) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;
    const documentUser = firebaseAdmin.firestore().collection('Users').doc(userId);

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
        documentUser.update({
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
        documentUser.update({
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
        documentUser.update({
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
        agent.add("Type: " + type);
        documentUser.update({
            alcohol_type: type
        });

        agent.add("ดิฉันอยากรู้ปริมาณการดื่มที่คุณดื่มบ่อยๆค่ะ ช่วยเลือกรูปที่อธิบายปริมาณการดื่มของคุณได้ดีที่สุดนะคะ");
        agent.add(new Payload('LINE', alocoholPackaging, { sendAsMessage: true }));
    }

    function setDrinkAmount(agent){
        const drinkAmount = agent.parameters.drink_amount;
        agent.add("Amount: " + drinkAmount);
        documentUser.update({
            drink_amount: drinkAmount
        })

        return documentUser.get()
            .then(doc => {
                agent.add("คุณดื่ม" + doc.data().type);
            })
            .catch((err)=>{console.log(err)})
    }


    function test(agent) {
        agent.add('success');
        //agent.add(JSON.stringify(request.body.originalDetectIntentRequest.payload.data.source.userId));
        agent.add('userId ' + userId);
        console.log("console log ", userId);

        return documentUser.get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    agent.add("This is User ID: " + doc.data());
                }
            });
    }

    // eslint-disable-next-line consistent-return
    function createQuickReply(text, options) {
        if (options.length) {
            let items = options.map((option) => ({ type: "action", action: { type: "message", ...option } }))
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



    const alocoholPackaging = {
        type: "template",
        altText: "Test image carousel",
        template: {
            type: "image_carousel",
            columns: [{
                imageUrl: "https://media.istockphoto.com/photos/empty-beer-mug-isolated-on-reflective-white-backdrop-picture-id466250650",
                action: {
                    type: "message",
                    label: "1 แก้ว",
                    text: "a glass"
                }
            },
            {
                imageUrl: "https://previews.123rf.com/images/inginsh/inginsh1101/inginsh110100001/8684636-blank-soda-can-with-white-background.jpg",
                action: {
                    type: "message",
                    label: "1 กระป๋อง",
                    text: "a can"
                }
            }
                , {
                imageUrl: "https://www.thecarycompany.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/3/0/30wlac_1.1551298042.jpg",
                action: {
                    type: "message",
                    label: "1 ขวด",
                    text: "a bottle"
                }
            }
                , {
                imageUrl: "https://cmkt-image-prd.freetls.fastly.net/0.1.0/ps/7348804/910/1164/m2/fpnw/wm1/vuf1opjg2xw9ilcutvopjcevlj6vu271lq0blhucjilbjcvk5cmr2tkcn9s4frum-.jpg?1574435212&s=d63dd26ee28560bb5c3a91fc55214ab9",
                action: {
                    type: "message",
                    label: "3 ขวด",
                    text: "3 bottles"
                }
            }
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
    intentMap.set('Activating-confirm', activatingConfirm);
    intentMap.set('Set Age', setAge);
    intentMap.set('Set Career', setCareer);
    intentMap.set('Set Alcohol Time', setAlcoholTime);
    intentMap.set('Set Alcohol Type', setAlcoholType);
    intentMap.set('Set Drink Amount',setDrinkAmount);
    intentMap.set('test', test);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
};


