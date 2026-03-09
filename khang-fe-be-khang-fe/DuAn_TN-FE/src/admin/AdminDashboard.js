import React from 'react';
import { Typography, Row, Col, Card, Button } from 'antd';

const { Title } = Typography;

function AdminDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Trang quản trị</Title>
      <Row gutter={24}>
        <Col span={6}>
          <Card title="Quản lý sản phẩm" bordered={false}>
            <Button type="primary" block>Đi tới</Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Quản lý đơn hàng" bordered={false}>
            <Button type="primary" block>Đi tới</Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Quản lý khách hàng" bordered={false}>
            <Button type="primary" block>Đi tới</Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Quản lý khuyến mãi" bordered={false}>
            <Button type="primary" block>Đi tới</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard; 