import React from 'react';
import { Row, Col, Card, Typography, Form, Input, Button, Space, Divider } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ContactPage() {
  const onFinish = (values) => {
    console.log('Form values:', values);
    // Xử lý gửi form liên hệ
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Liên Hệ</Title>

      <Row gutter={[24, 24]}>
        {/* Thông tin liên hệ */}
        <Col xs={24} md={12}>
          <Card title="Thông Tin Liên Hệ">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <EnvironmentOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                <Text strong>Địa chỉ:</Text>
                <br />
                <Text>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</Text>
              </div>

              <div>
                <PhoneOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                <Text strong>Điện thoại:</Text>
                <br />
                <Text>0123 456 789</Text>
              </div>

              <div>
                <MailOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                <Text strong>Email:</Text>
                <br />
                <Text>contact@shoestore.com</Text>
              </div>

              <div>
                <ClockCircleOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                <Text strong>Giờ làm việc:</Text>
                <br />
                <Text>Thứ 2 - Thứ 6: 8:00 - 21:00</Text>
                <br />
                <Text>Thứ 7 - Chủ nhật: 9:00 - 20:00</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Form liên hệ */}
        <Col xs={24} md={12}>
          <Card title="Gửi Tin Nhắn Cho Chúng Tôi">
            <Form
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input placeholder="Nhập họ và tên của bạn" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email của bạn" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input placeholder="Nhập số điện thoại của bạn" />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề tin nhắn" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
              >
                <TextArea rows={4} placeholder="Nhập nội dung tin nhắn của bạn" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Bản đồ */}
      <Divider />
      <Card title="Bản Đồ">
        <div style={{ height: '400px', background: '#f0f0f0' }}>
          {/* Thêm Google Maps hoặc bản đồ khác ở đây */}
          <Text>Bản đồ sẽ được hiển thị ở đây</Text>
        </div>
      </Card>
    </div>
  );
}

export default ContactPage; 