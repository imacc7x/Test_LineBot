'use-strict';

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
        agent.add(
            createQuickReply(
                'ข้อมูลเบื้องต้นที่ดิฉันจำเป็นต้องทราบ โปรดเลือกเพศของคุณ',
                [{ label: "ชาย", text: "ชาย" }, { label: "หญิง", text: "หญิง" }]
            )
        );
    }

    function setGender(agent) {
        const gender = agent.parameters.gender;
        documentUser.update({
            gender: gender
        });
        agent.add("คุณอายุเท่าไรคะ")
    }

    function setAge(agent) {
        const age = agent.parameters.age;
        documentUser.update({
            age: age
        });
        agent.add(
            createQuickReply(
                "คุณทำงานอะไรเป็นอาชีพหลักคะ",
                [{ label: "ข้าราชการ", text: "ข้าราชการ" }, { label: "ค้าขาย", text: "ค้าขาย" }, { label: "เกษตรกร", text: "เกษตรกร" }
                    , { label: "แพทย์", text: "แพทย์" }, { label: "นิสิต/นักศึกษา", text: "นิสิต/นักศึกษา" }, { label: "อื่นๆ", text: "อื่นๆ" }]
            )
        );
    }

    function setCareer(agent) {
        const career = agent.parameters.career;
        documentUser.update({
            career: career
        });
        // agent.add(
        //     createQuickReply(
        //         "คุณดื่มเครื่องดื่มแอลกอฮอล์บ่อยไหมคะ",
        //         [
        //             { label: "ไม่เคย", text: "Never" },
        //             { label: "ไม่เกินเดือนละครั้ง", text: "Not more than once a month" },
        //             { label: "เดือนละ 2 - 4 ครั้ง", text: "2-4 times a month" },
        //             { label: "สัปดาห์ละ 2 - 3 ครั้ง", text: "2-3 times a week" },
        //             { label: "มากกว่า 3 ครั้งต่อสัปดาห์", text: "More than 3 times a week" }
        //         ]

        //     )
        // );
        agent.add(
            createQuickReply(
                "โดยส่วนใหญ่ ถ้าคุณดื่ม คุณดื่มอะไรคะ",
                [
                    { label: "เบียร์", text: "เบียร์" },
                    { label: "สุราสี", text: "สุราสี" },
                    { label: "สุราขาว", text: "สุราขาว" },
                    { label: "ไวน์", text: "ไวน์" },
                    { label: "น้ำขาว", text: "น้ำขาว" },
                    { label: "อุ", text: "อุ" },
                    { label: "กระแช่", text: "กระแช่" },
                    { label: "สาโท", text: "สาโท" },
                    { label: "สุราแช่", text: "สุราแช่" },
                    { label: "เหล้าปั่น", text: "เหล้าปั่น" },
                    { label: "เหล้าถัง", text: "เหล้าถัง" },
                ]
            )
        );
    }

    function setAlcohol(agent) {
        const alcohol = agent.parameters.alcohol;
        documentUser.update({
            alcohol: alcohol
        });
        if (alcohol === "เบียร์") {
            agent.add(
                createQuickReply(
                    "ฉันอยากรู้ประเภทหรือยี่ห้อของ" + alcohol + "ที่คุณดื่มคะ",
                    [
                        { label: "สิงห์ไลท์", text: "0.035" },
                        { label: "สิงห์/ไฮเนเกน/ลีโอ", text: "0.05" },
                        { label: "ช้าง", text: "0.064" },
                        { label: "อื่นๆ", text: "0.05" }
                    ]
                )
            );
        }
    }

    function setConcentrated(agent) {
        const percent = agent.parameters.percent;
        return alcohol = documentUser.get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    const alcohol = doc.data().alcohol;
                    documentUser.update({
                        alcohol_concentrated: percent
                    });
                    if (alcohol === "เบียร์") {
                        agent.add(
                            createQuickReply(
                                "โดยปกติคุณดื่ม" + alcohol + "ด้วยภาชนะประเภทใด",
                                [
                                    { label: "แก้ว", text: "แก้ว" },
                                    { label: "กระป๋อง", text: "กระป๋อง" },
                                    { label: "ขวด", text: "ขวด" }
                                ]
                            )
                        );
                    }
                }
            });
    }

    function setContainer(agent) {
        const container = agent.parameters.container;
        documentUser.update({
            container: container
        });
        if(container === "กระป๋อง"){
                agent.add("ฉันอยากรู้ขนาดของ" + container + "ที่คุณดื่ม");
            agent.add(new Payload('LINE', can, { sendAsMessage: true }));
        }
    }

    function setSize(agent){
        const capacity = agent.parameters.capacity;
        documentUser.update({
            capacity: capacity
        });
        agent.add("ขอบคุณสำหรับข้อมูลนะคะ");
        agent.add(
            createQuickReply(
                "ตอนนี้คุณอยากให้ช่วยอะไรคะ",
                [
                    { label: "ประเมินความเสี่ยง", text: "ประเมินความเสี่ยง" },
                    { label: "รับคำแนะนำในการลดการดื่ม", text: "รับคำแนะนำในการลดการดื่ม" },
                    { label: "อัพเดตข้อมูลส่วนตัว", text: "อัพเดตข้อมูลส่วนตัว" }
                ]
            )
        );
      
    }

    function allOptins(agent){
        agent.add(
            createQuickReply(
                "ตอนนี้คุณอยากให้ช่วยอะไรคะ",
                [
                    { label: "ประเมินความเสี่ยง", text: "ประเมินความเสี่ยง" },
                    { label: "รับคำแนะนำในการลดการดื่ม", text: "รับคำแนะนำในการลดการดื่ม" },
                    { label: "อัพเดตข้อมูลส่วนตัว", text: "อัพเดตข้อมูลส่วนตัว" }
                ]
            )
        );
    }

    function activatingNotConfirm(agent) {
        agent.add('ขอบคุณมากค่ะ แม้ว่าคุณจะไม่อนุญาตในตอนนี้ ดิฉันก็จะตั้งใจให้คำปรึกษาคุณอย่างเต็มที่ค่ะ และจะขอโอกาสขออนุญาตอีกครั้งหน้านะคะ ^^');
        agent.add('คุณยังสามารถเลือกขอคำปรึกษาผ่านบริการอื่นๆได้ดังนี้');
        agent.add(new Payload('LINE', connection, { sendAsMessage: true }));
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

    // function setAlcoholType(agent) {
    //     console.log("This is setAlcoholTime function");
    //     const type = agent.parameters.alcohol_type;
    //     agent.add("Type: " + type);
    //     documentUser.update({
    //         alcohol_type: type
    //     });

    //     agent.add("ดิฉันอยากรู้ปริมาณการดื่มที่คุณดื่มบ่อยๆค่ะ ช่วยเลือกรูปที่อธิบายปริมาณการดื่มของคุณได้ดีที่สุดนะคะ");
    //     agent.add(new Payload('LINE', alocoholPackaging, { sendAsMessage: true }));
    // }

    function setDrinkAmount(agent) {
        const drinkAmount = agent.parameters.drink_amount;
        agent.add("Amount: " + drinkAmount);
        documentUser.update({
            drink_amount: drinkAmount
        })



        return documentUser.get()
            // eslint-disable-next-line promise/always-return
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                agent.add(createQuickReply(
                    "คุณดื่ม" + doc.data().alcohol_type +
                    "ในครั้งเดียวมากกว่าปริมาณของ" + doc.data().alcohol_type + "จำนวน 6 ดื่มมาตรฐานบ่อยแค่ไหนคะ",
                    [
                        { label: "ไม่เคยเลย", text: "never" },
                        { label: "ไม่เกินเดือนละครั้ง", text: "Not more than once a month" },
                        { label: "ทุกเดือน", text: "Every month" },
                        { label: "ทุกสัปดาห์", text: "every week" },
                        { label: "ทุกวันหรือเกือบทุกวัน", text: "Every day or almost every day" }
                    ]
                )
                );
            });
    }

    function checkStandardDrink(agent) {
        const check = agent.parameters.alcohol_time;
        agent.add("check: " + check);
        documentUser.update({
            drink_more_than_standard: check
        })

        agent.add(
            createQuickReply("โดยส่วนใหญ่แล้วคุณมักดื่มมากเป็นพิเศษวันไหนคะ",
                [
                    { label: "วันอาทิตย์", text: "วันอาทิตย์" },
                    { label: "วันจันทร์", text: "วันจันทร์" },
                    { label: "วันอังคาร", text: "วันอังคาร" },
                    { label: "วันพุธ", text: "วันพุธ" },
                    { label: "วันพฤหัสบดี", text: "วันพฤหัสบดี" },
                    { label: "วันศุกร์", text: "วันศุกร์" },
                    { label: "วันเสาร์", text: "วันเสาร์" },
                    { label: "วันอาทิตย์", text: "วันอาทิตย์" }
                ]
            )
        );
    }

    function setDayDrink(agent) {
        const day = agent.parameters.days;
        documentUser.update({
            day_drink: day
        })
        agent.add(createQuickReply(
            "แล้วช่วงเวลาที่คุณมักจะดื่ม เป็นเวลาช่วงไหนคะ",
            [
                { label: "เช้า-สาย", text: "เช้า-สาย" },
                { label: "เที่ยง-บ่าย", text: "เที่ยง-บ่าย" },
                { label: "เย็น-ค่ำ", text: "เย็น-ค่ำ" },
                { label: "ก่อนนอน", text: "ก่อนนอน" }
            ]
        ));
    }

    function setDrinkingTime(agent) {
        const time = agent.parameters.time_period;
        documentUser.update({
            time_period: time
        })
        agent.add("โดยส่วนใหญ่แล้วคุณมักจะดื่มกับใครคะ หรือดื่มคนเดียว ");
    }

    function setDrinkWith(agent) {
        const person = agent.parameters.person;
        documentUser.update({
            person: person
        })

        // eslint-disable-next-line promise/always-return
        return documentUser.get().then(doc => {
            agent.add("เท่าที่ดิฉันรู้จากข้อมูลที่คุณให้ ฉันอยากให้คุณดื่ม " + doc.data().alcohol_type + "วันละไม่เกิน...ค่ะ");
            agent.add("นั่นเป็นปริมาณที่จะไม่ส่งผลเสียต่อสุขภาพมากนะคะ");
            agent.add(createQuickReply("คุณเคยพยายามจะหยุดหรือลดมันบ้างไหมคะ",
                [
                    { label: "เคย", text: "เคย" },
                    { label: "ไม่เคย", text: "ไม่เคย" }
                ]));
        });
    }

    function askStopDrinkingYes(agent) {
        agent.add("ดีใจจังค่ะ ที่คุณเคยพยายามหยุดมัน");
        agent.add(createQuickReply("ตอนนั้นคุณมีอาการผิดปรกติอะไรบ้างไหมคะ",
            [
                { label: "มี", text: "ไม่มี" },
                { label: "ไม่มี", text: "ไม่มี" }
            ]));
        test(agent);
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
                    agent.add("This is type: " + doc.data().alcohol_type);
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

    const connection = {
        "type": "imagemap",
        "baseUrl": "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/Dark%20Blue%20and%20Orange%20Moustache%20Father's%20Day%20Card.jpg?alt=media&token=97044696-72e5-4c7a-a6b7-6f7eba3943c0",
        "altText": "This is an imagemap",
        "baseSize": {
            "width": 1040,
            "height": 738
        },
        "actions": [
            {
                "type": "uri",
                "area": {
                    "x": 15,
                    "y": 244,
                    "width": 451,
                    "height": 251
                },
                "linkUri": "https://www.thaihealth.or.th/"
            },
            {
                "type": "uri",
                "area": {
                    "x": 534,
                    "y": 243,
                    "width": 449,
                    "height": 254
                },
                "linkUri": "http://line.me/ti/p/@efr1869z?fbclid=IwAR36fJn196psyS8j-hK-TDa0QRkqVLQWazg9BNDLJBLNxeILkBtEeMKwZPM"
            }
        ]
    }

    const can = {
        type: "template",
        altText: "can",
        template: {
            type: "image_carousel",
            columns: [
            {
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fcan%2Fcan%20330ml.jpg?alt=media&token=cfcf2d02-eae0-4e7b-9bcc-04e6d62af8a4",
                action: {
                    type: "message",
                    label: "กระป๋อง 330ml",
                    text: "330"
                }
            }
                , {
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fcan%2Fcan%20500ml.jpg?alt=media&token=34a34a51-d110-4019-bd99-89d238089e65",
                action: {
                    type: "message",
                    label: "กระป๋อง 500ml",
                    text: "500"
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
    intentMap.set('Activating Confirm', activatingConfirm);
    intentMap.set('Set Gender', setGender);
    intentMap.set('Set Age', setAge);
    intentMap.set('Set Career', setCareer);
    intentMap.set('Set Alcohol', setAlcohol);
    intentMap.set('Set Concentrated', setConcentrated);
    intentMap.set('Set Container',setContainer);
    intentMap.set('Set Size', setSize);
    intentMap.set('Activating Not Confirm' , activatingNotConfirm);
    intentMap.set('test', test);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
};


