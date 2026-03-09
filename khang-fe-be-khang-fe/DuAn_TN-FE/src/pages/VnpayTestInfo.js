import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;

function VnpayTestInfo() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2}>Thông tin kết nối VNPAY Sandbox</Title>
      <Divider />
      <Paragraph>
        <Text strong>Lưu ý:</Text> Đây là môi trường test (sandbox) của VNPAY, chỉ dùng để kiểm thử, không dùng cho thanh toán thật.
      </Paragraph>
      <Title level={4}>Thông tin cấu hình</Title>
      <Paragraph>
        <Text>Mã Website (vnp_TmnCode): </Text>
        <Text code>XU0AKRAR</Text>
        <br />
        <Text>Secret Key (vnp_HashSecret): </Text>
        <Text code>3A6US3283ROT6KIPS48GJIIMUKVP5RZ5</Text>
        <br />
        <Text>URL thanh toán test (vnp_Url): </Text>
        <Link href="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" target="_blank">
          https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
        </Link>
      </Paragraph>
      <Title level={4}>Thông tin Merchant Admin</Title>
      <Paragraph>
        <Text>Địa chỉ: </Text>
        <Link href="https://sandbox.vnpayment.vn/merchantv2/" target="_blank">
          https://sandbox.vnpayment.vn/merchantv2/
        </Link>
        <br />
        <Text>Tên đăng nhập: </Text>
        <Text code>ductai13131010@gmail.com</Text>
        <br />
        <Text>Mật khẩu: (Là mật khẩu nhập khi đăng ký Merchant TEST)</Text>
      </Paragraph>
      <Title level={4}>Test IPN URL</Title>
      <Paragraph>
        <Text>Kịch bản test (SIT): </Text>
        <Link href="https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login" target="_blank">
          https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login
        </Link>
        <br />
        <Text>Tên đăng nhập: </Text>
        <Text code>ductai13131010@gmail.com</Text>
        <br />
        <Text>Mật khẩu: (Là mật khẩu nhập khi đăng ký Merchant TEST)</Text>
      </Paragraph>
      <Title level={4}>Tài liệu & Demo</Title>
      <Paragraph>
        <Link href="https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html" target="_blank">
          Tài liệu hướng dẫn tích hợp
        </Link>
        <br />
        <Link href="https://sandbox.vnpayment.vn/apis/vnpay-demo/code-demo-tích-hợp" target="_blank">
          Code demo tích hợp
        </Link>
        <br />
        <Link href="https://sandbox.vnpayment.vn/apis/vnpay-demo/" target="_blank">
          Demo Cổng thanh toán VNPAY
        </Link>
      </Paragraph>
      <Title level={4}>Thẻ test</Title>
      <Paragraph>
        <Text>Ngân hàng: </Text>NCB<br />
        <Text>Số thẻ: </Text>
        <Text code>9704198526191432198</Text><br />
        <Text>Tên chủ thẻ: </Text>NGUYEN VAN A<br />
        <Text>Ngày phát hành: </Text>07/15<br />
        <Text>Mật khẩu OTP: </Text>
        <Text code>123456</Text>
      </Paragraph>
      <Divider />
      <Paragraph>
        <Text strong>Hỗ trợ:</Text><br />
        Email: <Link href="mailto:support.vnpayment@vnpay.vn">support.vnpayment@vnpay.vn</Link><br />
        Hotline: 1900 55 55 77
      </Paragraph>
    </div>
  );
}

export default VnpayTestInfo;