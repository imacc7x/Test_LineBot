'use-strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, Payload } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.handler = (request, response, firebaseAdmin) => {
    const agent = new WebhookClient({ request, response });

    //TODO: Set default of RichMenu

    //TODO: Delete 2 line below.
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    const userId = request.body.originalDetectIntentRequest.payload.data.source.userId;
    const documentUser = firebaseAdmin.firestore().collection('Users').doc(userId);

    //TODO: I guess function below not use.
    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function askingGender(agent) {
        agent.add(
            createQuickReply(
                'ข้อมูลเบื้องต้นที่ดิฉันจำเป็นต้องทราบ โปรดเลือกเพศของคุณ',
                [{ label: "ชาย", text: "ชาย" }, { label: "หญิง", text: "หญิง" }]
            )
        );
    }
    function askingAge(agent) {
        agent.add("คุณอายุเท่าไรคะ")
    }
    function askingCareer(agent) {
        agent.add(
            createQuickReply(
                "คุณทำงานอะไรเป็นอาชีพหลักคะ",
                [{ label: "ข้าราชการ", text: "ข้าราชการ" }, { label: "ค้าขาย", text: "ค้าขาย" }, { label: "เกษตรกร", text: "เกษตรกร" }
                    , { label: "แพทย์", text: "แพทย์" }, { label: "นิสิต/นักศึกษา", text: "นิสิต/นักศึกษา" }, { label: "อื่นๆ", text: "อื่นๆ" }]
            )
        );
    }
    function askingAlcoholType(agent) {
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
    function askingIntensity(agent, alcoholType) {
        let messageList = [];
        switch (alcoholType) {
            case "เบียร์":
                messageList.push({ label: "สิงห์ไลท์", text: "0.035" });
                messageList.push({ label: "สิงห์/ไฮเนเกน/ลีโอ", text: "0.05" });
                messageList.push({ label: "ช้าง", text: "0.064" });
                messageList.push({ label: "อื่นๆ", text: "0.05" });
                break;

            case "สุราสี":
                messageList.push({ label: "หงส์ทอง", text: "0.35" });
                messageList.push({ label: "เบลนด์ 285", text: "0.35" });
                messageList.push({ label: "แม่โขง", text: "0.35" });
                messageList.push({ label: "35 ดีกรี", text: "0.35" });
                messageList.push({ label: "40 ดีกรี", text: "0.4" });
                messageList.push({ label: "อื่นๆ", text: "0.4" });
                break;

            case "สุราขาว":
                messageList.push({ label: "35 ดีกรี", text: "0.35" });
                messageList.push({ label: "40 ดีกรี", text: "0.4" });
                messageList.push({ label: "อื่นๆ", text: "0.35" });
                break;

            case "ไวน์":
                messageList.push({ label: "ไวน์แดง", text: "0.10" });
                messageList.push({ label: "ไวน์ขาว", text: "0.10" });
                messageList.push({ label: "ไวน์คูลเลอร์", text: "0.06" });
                messageList.push({ label: "อื่นๆ", text: "0.11" });
                break;

            case "น้ำขาว":
            case "อุ":
            case "กระแช่":
                messageList.push({ label: "อื่นๆ", text: "0.10" });
                break;

            case "สาโท":
            case "สุราแช่":
                messageList.push({ label: "อื่นๆ", text: "0.06" });
                break;

            case "เหล้าปั่น":
            case "เหล้าถัง":
                messageList.push({ label: "สุรา 35 ดีกรี", text: "0.35" });
                messageList.push({ label: "สุรา 40 ดีกรี", text: "0.4" });
                messageList.push({ label: "อื่นๆ", text: "0.35" });
                break;

            default:
                break;
        }
        agent.add(
            createQuickReply(
                "ฉันอยากรู้ประเภทหรือยี่ห้อของ" + alcoholType + "ที่คุณดื่มคะ",
                messageList
            )
        );
    }
    async function askingContainer(agent) {
        const doc = (await documentUser.get());
        const alcoholType = doc.data().alcohol;
        const messageList = [];
        if (doc.exists) {
            agent.add("this is " + alcohol);
                                    
            switch (alcoholType) {
                case "เบียร์":
                    messageList.push({ label: "แก้ว", text: "แก้ว" });
                    messageList.push({ label: "กระป๋อง", text: "กระป๋อง" });
                    messageList.push({ label: "ขวด", text: "ขวด" });
                    break;
    
                case "สุราสี":
                case "สุราขาว":
                    messageList.push({ label: "เป๊ก", text: "เป๊ก" });
                    messageList.push({ label: "ขวด", text: "ขวด" });
                    break;
                    
                case "ไวน์":
                    messageList.push({ label: "แก้ว", text: "แก้ว" });
                    messageList.push({ label: "ขวด", text: "ขวด" });
                    break;
    
                case "น้ำขาว":
                case "อุ":
                case "กระแช่":
                case "สาโท":
                case "สุราแช่":
                case "เหล้าปั่น":
                case "เหล้าถัง":
                    messageList.push({ label: "เป๊ก", text: "เป๊ก" });
                    messageList.push({ label: "ตอง", text: "ตอง" });
                    break;
    
                default:
                    break;
            }
            agent.add(
                createQuickReply(
                    "โดยปกติคุณดื่ม" + alcoholType + "ด้วยภาชนะประเภทใด",
                    messageList
                )
            );
        }
    }
    function askingSizeOfContainer(agent, container) {
        switch (container) {
            case "กระป๋อง":
                agent.add("ฉันอยากรู้ขนาดของ" + container + "ที่คุณดื่ม");
                agent.add(new Payload('LINE', can, { sendAsMessage: true }));
                break;
        
            case "ขวด":
                agent.add("ฉันอยากรู้ขนาดของ" + container + "ที่คุณดื่ม");
                agent.add(new Payload('LINE', bottle, { sendAsMessage: true }));
                break;

            case "แก้ว":
            case "เป๊ก":
                agent.add("ฉันอยากรู้ขนาดของ" + container + "ที่คุณดื่ม");
                agent.add(new Payload('LINE', glass, { sendAsMessage: true }));
                break;

            default:
                break;
        }
    }
    function askingOperations(agent) {
        agent.add(
            createQuickReply(
                "ตอนนี้คุณอยากให้ช่วยอะไรคะ",
                [
                    { label: "ประเมินความเสี่ยง", text: "ประเมินความเสี่ยง" },
                    { label: "รับคำแนะนำการลดการดื่ม", text: "รับคำแนะนำการลดการดื่ม" },
                    { label: "อัพเดตข้อมูลส่วนตัว", text: "อัพเดตข้อมูลส่วนตัว" },
                    { label: "จบการทำงาน", text: "จบการทำงาน" }
                ]
            )
        );
    }
    function AuditC_Q1(agent) {
        agent.add(
            createQuickReply(
                "ข้อแรก คุณดื่มเครื่องดื่มแอลกอฮอล์บ่อยไหมคะ",
                [
                    { label: "ไม่เคย", text: "ไม่เคย" },
                    { label: "ไม่เกินเดือนละครั้ง", text: "ไม่เกินเดือนละครั้ง" },
                    { label: "เดือนละ 2 - 4 ครั้ง", text: "เดือนละ 2 - 4 ครั้ง" },
                    { label: "สัปดาห์ละ 2 - 3 ครั้ง", text: "สัปดาห์ละ 2 - 3 ครั้ง" },
                    { label: "มากกว่า 3 ครั้งต่อสัปดาห์", text: "มากกว่า 3 ครั้งต่อสัปดาห์" }
                ]
            )
        );
    }

    //QUESTION: ทำไมไม่มีอัพเดทว่าอนุญาต
    function receiveConfirmActivation(agent) {
        agent.add('ขอบคุณมากค่ะ ดิฉันมั่นใจว่าข้อมูลที่คุณให้จะเป็นประโยชน์แก่ทีมผู้สรัางดิฉัน ในการพัฒนาการดูแลผู้ดื่มเหล้าต่อไปแน่นอนค่ะ');
        askingGender(agent);
    }
    async function receiveGender(agent) {
        const gender = agent.parameters.gender;
        await documentUser.update({
            gender: gender,
            advice: 0
        });
        askingAge(agent);
    }
    async function receiveAge(agent) {
        const age = agent.parameters.age;
        await documentUser.update({
            age: age
        });
        askingCareer(agent)
    }
    async function receiveCareer(agent) {
        const career = agent.parameters.career;
        await documentUser.update({
            career: career
        });
        askingAlcoholType(agent)
    }
    async function receiveAlcoholType(agent) {
        const alcohol = agent.parameters.alcohol;
        agent.add(alcohol);
        await documentUser.update({
            alcohol: alcohol
        });
        askingIntensity(agent, alcoholType);
    }
    async function receiveIntensity(agent) {
        const percent = agent.parameters.percent;
        await documentUser.update({
            alcohol_concentrated: percent
        });
        await askingContainer(agent)
    }
    async function receiveContainer(agent) {
        const container = agent.parameters.container;
        await documentUser.update({
            container: container
        });
        askingSizeOfContainer(agent, container);
    }
    async function receiveSizeOfContainer(agent) {
        const capacity = agent.parameters.capacity;
        await documentUser.update({
            capacity: capacity
        });
        agent.add("ขอบคุณสำหรับข้อมูลนะคะ");
        askingOperations(agent);
        
    }
    //QUESTION: WTF of update advice
    async function receiveGetAdviceOperation(agent) {
        text = agent.parameters.options;
        if (text === "รับคำแนะนำการลดการดื่ม") {
            await documentUser.update({
                advice: 1
            });
        } else {
            await documentUser.update({
                advice: 0
            });
        }
        AuditC_Q1(agent);
    }

    //TODO: Change function name to "receiveAnswerOfAuditC_Q1"
    //TODO: Create function "AuditC_Q2"
    function receiveAnswerOfAuditC_Q1(agent) {
        const frequency = agent.parameters.frequency;
        return documentUser.get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    const alcohol = doc.data().alcohol;
                    const container = doc.data().container;
                    documentUser.update({
                        frequency: frequency
                    });

                    agent.add(
                        createQuickReply(
                            "โดยทั่วไปแล้ว ถ้าคุณดื่มคุณจะดื่ม" + alcohol + "ปริมาณเท่าไร",
                            [
                                { label: "1 " + container, text: "1" },
                                { label: "2 " + container, text: "2" },
                                { label: "3 " + container, text: "3" },
                                { label: "4 " + container, text: "4" },
                                { label: "5 " + container, text: "5" }
                            ]

                        )
                    );
                }
            });
    }

    //TODO: Change function name to "receiveFromQ2_GetAdviceOperation"
    //TODO: Create function "Q3_Audit_C"
    function audit_C3(agent) {
        const amount = parseFloat(agent.parameters.amount);
        return documentUser.get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    const alcohol = doc.data().alcohol;
                    const container = doc.data().container;
                    const percent = parseFloat(doc.data().alcohol_concentrated);
                    const capacity = parseFloat(doc.data().capacity);
                    const gender = doc.data().gender;
                    let drinkingPoint = 6;
                    documentUser.update({
                        amount: amount
                    });

                    if (gender === "ชาย") {
                        drinkingPoint = 8;
                    }

                    const result = ((drinkingPoint * 10) / (0.79 * percent * capacity)).toFixed(0);
                    // agent.add("result: " + result);

                    agent.add(
                        createQuickReply(
                            "ในช่วงปีที่แล้ว บ่อยแค่ไหนที่คุณดื่ม" + alcohol + "มากกว่า " + result + " " + container,
                            [
                                { label: "ไม่เคย", text: "ไม่เคย" },
                                { label: "ไม่เกินเดือนละครั้ง", text: "ไม่เกินเดือนละครั้ง" },
                                { label: "เดือนละ 2 - 4 ครั้ง", text: "เดือนละ 2 - 4 ครั้ง" },
                                { label: "สัปดาห์ละ 2 - 3 ครั้ง", text: "สัปดาห์ละ 2 - 3 ครั้ง" },
                                { label: "มากกว่า 3 ครั้งต่อสัปดาห์", text: "มากกว่า 3 ครั้งต่อสัปดาห์" }
                            ]
                        )
                    );
                }
            });
    }

    //TODO: Change function name to "receiveFromQ3_GetAdviceOperation"
    //TODO: Create function "calculateRecommentedDrinking"
    //TODO: Use function "askingOperations"
    function audit_C3End(agent) {
        frequency = agent.parameters.frequency;
        return documentUser.get()
            .then(doc => {
                // eslint-disable-next-line promise/always-return
                if (!doc.exists) {
                    agent.add("Not Found");
                } else {
                    //TODO: Destructuring below
                    const amount = doc.data().amount;
                    const alcohol = doc.data().alcohol;
                    const container = doc.data().container;
                    const percent = parseFloat(doc.data().alcohol_concentrated);
                    const capacity = parseFloat(doc.data().capacity);
                    const gender = doc.data().gender;
                    const advice = doc.data().advice;
                    let drinkingPoint = 6;
                    documentUser.update({
                        excess_drinking_frequency: container
                    });

                    if (gender === "ชาย") {
                        drinkingPoint = 8;
                    }

                    const result = ((drinkingPoint * 10) / (0.79 * percent * capacity)).toFixed(0);
                    agent.add("ระดับที่คุณดื่ม" + alcohol + "ได้นั้นไม่เกิน" + " " + result + " " + container + "นะ");
                    // eslint-disable-next-line eqeqeq
                    if (advice == 1) {
                        let a = amount * percent * capacity * 0.79;
                        let b = amount * percent * capacity * 0.79 * 0.1;
                        let c = percent * capacity * 0.79;
                        let result = b / c;
                        // agent.add("1 unit: " + a);
                        // agent.add("reduce: " + b);
                        agent.add('ถ้าคุณอยากลดการดื่ม คุณควรลดการดื่มลง' + result + " " + container + "ต่อการดื่มทุกๆ 3-4 ครั้งคะ");
                    }
                    agent.add(
                        createQuickReply(
                            "ตอนนี้คุณอยากให้ช่วยอะไรคะ",
                            [
                                { label: "ประเมินความเสี่ยง", text: "ประเมินความเสี่ยง" },
                                { label: "รับคำแนะนำการลดการดื่ม", text: "รับคำแนะนำการลดการดื่ม" },
                                { label: "อัพเดตข้อมูลส่วนตัว", text: "อัพเดตข้อมูลส่วนตัว" },
                                { label: "จบการทำงาน", text: "จบการทำงาน" }
                            ]
                        )
                    );
                }
            });

    }

    //TODO: Change function name to "receiveExitOperation"
    function end(agent) {
        agent.add("ขอบคุณที่ใช้งาน สามารถทักมาได้ตลอดทุกเมื่อเลยนะ");
    }

    //TODO: Change function name to "askingOperation"
    function allOptions(agent) {
        agent.add(
            createQuickReply(
                "ตอนนี้คุณอยากให้ช่วยอะไรคะ",
                [
                    { label: "ประเมินความเสี่ยง", text: "ประเมินความเสี่ยง" },
                    { label: "รับคำแนะนำการลดการดื่ม", text: "รับคำแนะนำการลดการดื่ม" },
                    { label: "อัพเดตข้อมูลส่วนตัว", text: "อัพเดตข้อมูลส่วนตัว" },
                    { label: "จบการทำงาน", text: "จบการทำงาน" }
                ]
            )
        );
    }

    function activatingNotConfirm(agent) {
        agent.add('ขอบคุณมากค่ะ แม้ว่าคุณจะไม่อนุญาตในตอนนี้ ดิฉันก็จะตั้งใจให้คำปรึกษาคุณอย่างเต็มที่ค่ะ และจะขอโอกาสขออนุญาตอีกครั้งหน้านะคะ ^^');
        agent.add('คุณยังสามารถเลือกขอคำปรึกษาผ่านบริการอื่นๆได้ดังนี้');
        agent.add(new Payload('LINE', connection, { sendAsMessage: true }));
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
        "baseUrl": "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/Dark%20Blue%20and%20Orange%20Moustache%20Father's%20Day%20Card%20(1)%20(1).png?alt=media&token=ed6948ca-faf1-4b70-8e1d-ecb36f38158b",
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

    const glass = {
        type: "template",
        altText: "glass",
        template: {
            type: "image_carousel",
            columns: [
                {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fglass%2Fshot%20glass%2050ml.jpg?alt=media&token=8de6c555-aacc-4407-99a6-8a5d764ec581",
                    action: {
                        type: "message",
                        label: "แก้ว 50ml",
                        text: "330"
                    }
                }
                , {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fglass%2Fglass%20100ml.jpg?alt=media&token=8985bffe-a6c2-42c7-8b3a-851e649ff824",
                    action: {
                        type: "message",
                        label: "แก้ว 100ml",
                        text: "100"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fglass%2Fglass%20165ml.jpg?alt=media&token=89bffe5d-3cf2-44a3-9ebe-ed179536b32c",
                    action: {
                        type: "message",
                        label: "แก้ว 165ml",
                        text: "165"
                    }
                }
            ]
        }
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

    const bottle = {
        type: "template",
        altText: "bottle",
        template: {
            type: "image_carousel",
            columns: [
                {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20275ml.jpg?alt=media&token=c292c23f-98f0-439d-a2fc-38951943a7a1",
                    action: {
                        type: "message",
                        label: "ขวด 275ml",
                        text: "275"
                    }
                }
                , {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20330ml.jpg?alt=media&token=9fbd4c74-83b8-442e-8aa3-ec7de5b2d170",
                    action: {
                        type: "message",
                        label: "ขวด 330ml",
                        text: "330"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20350%20ml.jpg?alt=media&token=a8a9606f-4112-4a92-a708-67664b5fa270",
                    action: {
                        type: "message",
                        label: "ขวด 350ml",
                        text: "350"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20500%20ml.jpg?alt=media&token=0a6ed76b-62ef-4141-aa6c-b56c2f5e75eb",
                    action: {
                        type: "message",
                        label: "ขวด 500ml",
                        text: "500"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20640ml.jpg?alt=media&token=7f643c9e-2534-46e1-9bcf-4a0143e27053",
                    action: {
                        type: "message",
                        label: "ขวด 640ml",
                        text: "640"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20700ml.jpg?alt=media&token=be7a2074-b0b4-4281-9c79-efd5a6ff988d",
                    action: {
                        type: "message",
                        label: "ขวด 700ml",
                        text: "700"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%20750ml.jpg?alt=media&token=6ebd5ac4-b580-4a85-8b3f-05f13b5212cf",
                    action: {
                        type: "message",
                        label: "ขวด 750ml",
                        text: "750"
                    }
                }, {
                    imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-chatbot-uyotlh.appspot.com/o/container%2Fbottle%2Fbottle%201000ml.jpg?alt=media&token=3b170158-6771-4966-a3c7-3cd7be94af99",
                    action: {
                        type: "message",
                        label: "ขวด 1000ml",
                        text: "1000"
                    }
                }
            ]
        }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Activating Confirm', receiveConfirmActivation);
    intentMap.set('Set Gender', receiveGender);
    intentMap.set('Set Age', receiveAge);
    intentMap.set('Set Career', receiveCareer);
    intentMap.set('Set Alcohol', receiveAlcoholType);
    intentMap.set('Set Concentrated', receiveIntensity);
    intentMap.set('Set Container', receiveContainer);
    intentMap.set('Set Size', receiveSizeOfContainer);
    intentMap.set('Audit_C1', receiveGetAdviceOperation);
    intentMap.set('Audit_C2', audit_C2);
    intentMap.set('Audit_C3', audit_C3);
    intentMap.set('Audit_C3 End', audit_C3End);
    intentMap.set('End', end);
    intentMap.set('All Options', allOptions);
    intentMap.set('Activating Not Confirm', activatingNotConfirm);
    intentMap.set('test', test);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
};


