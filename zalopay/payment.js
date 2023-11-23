const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const config = require("../config/zalopay");
const qs = require('qs');

function createZaloPayOrder(describe, amount) {
    const embed_data = {
        redirectUrl: "http://localhost:3000/payment_completed"
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const endpoint = "https://sb-openapi.zalopay.vn/v2/create";
    const order = {
        app_id: config.appid,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: "0935653650",
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: describe,
        bank_code: "zalopayapp",
        callback_url: "https://e959-2402-800-629c-ea57-9d73-509a-d6b9-b76b.ngrok-free.app/api/order/callback",
    };

    const data = config.appid + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log(data);
    console.log(order.mac);
    return axios.post(endpoint, null, { params: order })
}

function callBack(dataStr, reqMac) {
    let result = {};
    try {
        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        if (reqMac !== mac) {
            // callback không hợp lệ
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            let dataJson = JSON.parse(dataStr, config.key2);
            console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

            result.return_code = 1;
            result.return_message = "success";
            result.dataJson = dataJson;
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }
    return result;
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
    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`;
    const params = {
        app_id: config.appid,
        zp_trans_id: zp_trans_id,
        m_refund_id: `${moment().format('YYMMDD')}_${config.appid}_${uid}`,
        amount: amount,
        timestamp: timestamp,
        description: description,
    };
    let data = params.app_id + "|" + params.zp_trans_id + "|" + params.amount + "|" + params.description + "|" + params.timestamp;
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log(params);
    let configs = {
        method: 'post',
        maxBodyLength: Infinity,
        url: "https://sb-openapi.zalopay.vn/v2/refund",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(params)
    };

    return axios(configs)
}

function checkZaloReturn(m_refund_id) {
    //const endpoint = "https://sb-openapi.zalopay.vn/v2/query_refund";
    const params = {
        app_id: config.appid,
        timestamp: Date.now(), // miliseconds
        m_refund_id: m_refund_id,
    };
    let data = config.appid + "|" + params.m_refund_id + "|" + params.timestamp; 
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString()
    //return axios.post(endpoint, null, { params })
    let postConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://sb-openapi.zalopay.vn/v2/query_refund',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': 'application/json'
        },
        data: qs.stringify(params)
    };
    console.log(params);
    return axios(postConfig);
}


module.exports = {
    createZaloPayOrder,
    callBack,
    checkZaloPayment,
    returnZaloMoney,
    checkZaloReturn
};