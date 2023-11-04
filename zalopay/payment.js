const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const config = require("../config/zalopay");
const qs = require('qs');

function createZaloPayOrder(describe, amount) {
    const embed_data = {
        redirectUrl: "http://localhost:3000/"
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const endpoint = "https://sb-openapi.zalopay.vn/v2/create";
    const order = {
        app_id: config.appid,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: "ZaloPayDemo",
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: describe,
        bank_code: "zalopayapp",
        callback_url: "http://localhost:8080/api/order/callback",
    };

    const data = config.appid + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log(data);
    console.log(order.mac);
    return axios.post(endpoint, null, { params: order })
}

function callBack(dataStr, reqMac) {
    try {
        const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        if (reqMac !== mac) {
            return { return_code: -1, return_message: "mac not equal" };
        } else {
            return { return_code: 1, return_message: "success" };
        }
    } catch (error) {
        return { return_code: 0, return_message: error.message };
    }
}

function checkZaloPayment(app_trans_id) {
    let postData = {
        app_id: config.appid,
        app_trans_id: app_trans_id,
    }
    let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    let postConfig = {
        method: 'post',
        url: "https://sb-openapi.zalopay.vn/v2/query",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(postData)
    };
    return axios(postConfig);
}

function returnZaloMoney(amount, description, zp_trans_id) {
    const refund_url = "https://sb-openapi.zalopay.vn/v2/refund";
    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`;
    let params = {
        app_id: config.appid,
        m_refund_id: `${moment().format('YYMMDD')}_${config.appid}_${uid}`,
        timestamp,
        zp_trans_id: zp_trans_id,
        amount: amount,
        description: description,
    };

    let data = params.app_id + "|" + params.zp_trans_id + "|" + params.amount + "|" + params.description + "|" + params.timestamp;
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log(params.m_refund_id);
    return axios.post(refund_url, null, { params: params });
}

function checkZaloReturn(m_refund_id) {
    const endpoint = "https://sb-openapi.zalopay.vn/v2/query_refund";
    const params = {
        app_id: config.appid,
        timestamp: Date.now(), // miliseconds
        m_refund_id: m_refund_id,
    };
    const data = config.appid + "|" + params.m_refund_id + "|" + params.timestamp; // app_id|m_refund_id|timestamp
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString()
    return axios.post(endpoint, null, { params })
}


module.exports = {
    createZaloPayOrder,
    callBack,
    checkZaloPayment,
    returnZaloMoney,
    checkZaloReturn
};