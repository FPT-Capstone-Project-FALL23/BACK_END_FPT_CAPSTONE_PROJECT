const { createZaloPayOrder, callBack, checkZaloPayment, returnZaloMoney } = require('../zalopay/payment');

async function createQRcode(req, res) {
    try {
        //console.log("updatePlanPackage")
        const { describe, amount } = req.body;
        const response = await createZaloPayOrder(describe, amount)
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
async function callBackZalo(req, res) {
    try {
        const dataStr = req.body.data;
        const reqMac = req.body.mac;
        const response = await callBack(dataStr, reqMac);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
async function createCheck(req, res) {
    try {
        const { app_trans_id } = req.body;
        const response = await checkZaloPayment(app_trans_id)
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function returnMoney(req, res) {
    try {
        const { amount, description, zp_trans_id } = req.body;
        const response = await returnZaloMoney(amount, description, zp_trans_id)
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
module.exports = {
    createQRcode,
    callBackZalo,
    createCheck,
    returnMoney
}