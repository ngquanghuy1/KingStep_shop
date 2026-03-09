const crypto = require('crypto');
const secretKey = '17NNGXL3FCWJ06G5XFAVNE27J8PYF2KR';
const hashData = 'vnp_Amount=95190000&vnp_Command=pay&vnp_CreateDate=20260304100644&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=ThanhToan&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fcheck-payment&vnp_TmnCode=1YQ80PHL&vnp_TxnRef=1772593604484&vnp_Version=2.1.0';

const hmac = crypto.createHmac('sha512', secretKey);
const signed = hmac.update(new Buffer(hashData, 'utf-8')).digest('hex');
console.log('NodeJS HMAC:', signed);
