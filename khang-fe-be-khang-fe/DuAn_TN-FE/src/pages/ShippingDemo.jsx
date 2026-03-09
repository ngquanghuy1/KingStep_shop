import React, { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Space, 
  Card, 
  Row, 
  Col, 
  Divider,
  Alert,
  Tabs
} from 'antd';
import { TruckOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';
import ShippingCalculator from '../components/ShippingCalculator';
import CompactShippingCalculator from '../components/CompactShippingCalculator';
import GHNTestComponent from '../components/GHNTestComponent';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const ShippingDemo = () => {
  const [shippingFee, setShippingFee] = useState(null);
  const [compactShippingFee, setCompactShippingFee] = useState(null);

  const handleShippingFeeCalculated = (fee) => {
    setShippingFee(fee);
    console.log('📦 Shipping fee calculated:', fee);
  };

  const handleCompactShippingFeeCalculated = (fee) => {
    setCompactShippingFee(fee);
    console.log('📦 Compact shipping fee calculated:', fee);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={1}>
              <TruckOutlined style={{ color: '#1890ff', marginRight: 12 }} />
              Demo Tính Phí Vận Chuyển GHN
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#666' }}>
              Tích hợp API GHN để tính phí vận chuyển trong ứng dụng React
            </Paragraph>
          </div>

          <Alert
            message="Thông tin API"
            description={
              <div>
                <Text strong>Token:</Text> 41a0c402-799b-11f0-b998-12c8ef06fdc1<br />
                <Text strong>Shop ID:</Text> 5951434<br />
                <Text strong>Base URL:</Text> https://online-gateway.ghn.vn/shiip/public-api
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Tabs defaultActiveKey="1" size="large">
            <TabPane 
              tab={
                <span>
                  <TruckOutlined />
                  Component Đầy Đủ
                </span>
              } 
              key="1"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <ShippingCalculator 
                    onShippingFeeCalculated={handleShippingFeeCalculated}
                    defaultWeight={1000}
                    showDetails={true}
                  />
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="📊 Kết quả tính phí" size="small">
                    {shippingFee ? (
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3f8600' }}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(shippingFee.total_fee)}
                        </div>
                        <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
                          <div>Phí dịch vụ: {shippingFee.service_fee?.toLocaleString('vi-VN')} VNĐ</div>
                          <div>Phí bảo hiểm: {shippingFee.insurance_fee?.toLocaleString('vi-VN')} VNĐ</div>
                          <div>Thời gian: {shippingFee.expected_delivery_time}</div>
                        </div>
                      </div>
                    ) : (
                      <Text type="secondary">Chưa có kết quả tính phí</Text>
                    )}
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <ExperimentOutlined />
                  Component Compact
                </span>
              } 
              key="2"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="📦 Component Compact (Cơ bản)" size="small">
                    <CompactShippingCalculator 
                      onShippingFeeCalculated={handleCompactShippingFeeCalculated}
                      defaultWeight={500}
                      showAdvanced={false}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="⚙️ Component Compact (Nâng cao)" size="small">
                    <CompactShippingCalculator 
                      onShippingFeeCalculated={handleCompactShippingFeeCalculated}
                      defaultWeight={1000}
                      showAdvanced={true}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card title="📊 Kết quả Compact" size="small">
                    {compactShippingFee ? (
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3f8600' }}>
                          {compactShippingFee.total_fee?.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                          {compactShippingFee.expected_delivery_time}
                        </div>
                      </div>
                    ) : (
                      <Text type="secondary">Chưa có kết quả</Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={16}>
                  <Card title="💡 Hướng dẫn sử dụng" size="small">
                    <Paragraph style={{ fontSize: '14px' }}>
                      <strong>Component Compact</strong> được thiết kế để tích hợp dễ dàng vào:
                    </Paragraph>
                    <ul style={{ fontSize: '14px' }}>
                      <li>Trang checkout</li>
                      <li>Giỏ hàng</li>
                      <li>Modal popup</li>
                      <li>Sidebar</li>
                    </ul>
                    <Paragraph style={{ fontSize: '14px' }}>
                      <strong>Props:</strong>
                    </Paragraph>
                    <ul style={{ fontSize: '12px', color: '#666' }}>
                      <li><code>onShippingFeeCalculated</code>: Callback khi tính phí thành công</li>
                      <li><code>defaultWeight</code>: Cân nặng mặc định (gram)</li>
                      <li><code>showAdvanced</code>: Hiển thị tùy chọn nâng cao</li>
                      <li><code>style</code>: CSS styles tùy chỉnh</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  Test API
                </span>
              } 
              key="3"
            >
              <GHNTestComponent />
            </TabPane>
          </Tabs>

          <Divider />

          <Card title="📋 Hướng dẫn tích hợp" size="small">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Title level={5}>1. Import Component</Title>
                <pre style={{ 
                  background: '#f6f8fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`import ShippingCalculator from './components/ShippingCalculator';
import CompactShippingCalculator from './components/CompactShippingCalculator';`}
                </pre>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>2. Sử dụng trong Component</Title>
                <pre style={{ 
                  background: '#f6f8fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`const [shippingFee, setShippingFee] = useState(null);

const handleShippingFeeCalculated = (fee) => {
  setShippingFee(fee);
  // Xử lý logic khác
};

<ShippingCalculator 
  onShippingFeeCalculated={handleShippingFeeCalculated}
  defaultWeight={1000}
/>`}
                </pre>
              </Col>
            </Row>
            
            <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Title level={5}>3. Tích hợp vào Checkout</Title>
                <pre style={{ 
                  background: '#f6f8fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`// Trong trang checkout
<Row gutter={[24, 16]}>
  <Col xs={24} md={16}>
    <CompactShippingCalculator 
      onShippingFeeCalculated={setShippingFee}
      defaultWeight={cartWeight}
      showAdvanced={false}
    />
  </Col>
  <Col xs={24} md={8}>
    <OrderSummary shippingFee={shippingFee} />
  </Col>
</Row>`}
                </pre>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ShippingDemo; 