import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Divider,
  Button,
  Alert,
  Statistic,
  Tag
} from 'antd';
import { 
  TruckOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import CompactShippingCalculator from './CompactShippingCalculator';
import useShippingFee from '../hooks/useShippingFee';

const { Title, Text } = Typography;

const CheckoutShippingSection = ({ 
  cartItems = [],
  onShippingSelected,
  onNextStep 
}) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const {
    shippingFee,
    loading,
    error,
    calculateShippingFee,
    formatCurrency,
    formatDeliveryTime,
    getShippingFeeBreakdown
  } = useShippingFee();

  // Calculate total weight from cart items
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total with shipping
  const total = subtotal + (shippingFee?.total_fee || 0);

  const handleShippingFeeCalculated = (fee) => {
    if (onShippingSelected) {
      onShippingSelected({
        fee,
        address: selectedAddress,
        weight: totalWeight
      });
    }
  };

  const handleAddressChange = (province, district, ward) => {
    setSelectedAddress({ province, district, ward });
  };

  const handleNextStep = () => {
    if (!shippingFee) {
      alert('Vui lòng tính phí vận chuyển trước khi tiếp tục');
      return;
    }
    
    if (onNextStep) {
      onNextStep({
        shippingFee,
        address: selectedAddress,
        total
      });
    }
  };

  const breakdown = getShippingFeeBreakdown();

  return (
    <div>
      <Title level={3}>
        <TruckOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        Thông tin vận chuyển
      </Title>

      <Row gutter={[24, 24]}>
        {/* Shipping Calculator */}
        <Col xs={24} lg={16}>
          <Card title="📍 Địa chỉ giao hàng" size="small">
            <CompactShippingCalculator
              onShippingFeeCalculated={handleShippingFeeCalculated}
              defaultWeight={totalWeight || 500}
              showAdvanced={false}
              style={{ border: 'none', boxShadow: 'none' }}
            />
          </Card>
        </Col>

        {/* Order Summary */}
        <Col xs={24} lg={8}>
          <Card title="📋 Tóm tắt đơn hàng" size="small">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Cart Items */}
              <div>
                <Text strong>Sản phẩm ({cartItems.length}):</Text>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    marginTop: 4
                  }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Divider style={{ margin: '8px 0' }} />

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Tạm tính:</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </div>

              {/* Shipping Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Phí vận chuyển:</Text>
                <Text>
                  {shippingFee ? formatCurrency(shippingFee.total_fee) : 'Chưa tính'}
                </Text>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                <Text strong style={{ fontSize: '16px', color: '#3f8600' }}>
                  {formatCurrency(total)}
                </Text>
              </div>

              {/* Shipping Info */}
              {shippingFee && (
                <Alert
                  message="Thông tin vận chuyển"
                  description={
                    <div>
                      <div>
                        <ClockCircleOutlined /> {formatDeliveryTime(shippingFee.expected_delivery_time)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        Phí dịch vụ: {formatCurrency(shippingFee.service_fee)}<br />
                        Phí bảo hiểm: {formatCurrency(shippingFee.insurance_fee)}
                      </div>
                    </div>
                  }
                  type="success"
                  showIcon
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}

              {/* Error */}
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}

              {/* Next Step Button */}
              <Button
                type="primary"
                size="large"
                block
                onClick={handleNextStep}
                disabled={!shippingFee || loading}
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
              >
                Tiếp tục thanh toán
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Shipping Details */}
      {shippingFee && (
        <Card 
          title="📊 Chi tiết phí vận chuyển" 
          size="small" 
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Tổng phí vận chuyển"
                value={breakdown.total}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                suffix="VNĐ"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Phí dịch vụ"
                value={breakdown.service}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                suffix="VNĐ"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Phí bảo hiểm"
                value={breakdown.insurance}
                precision={0}
                valueStyle={{ color: '#722ed1' }}
                suffix="VNĐ"
              />
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>
                  Thời gian giao hàng
                </div>
                <Tag color="green" icon={<ClockCircleOutlined />}>
                  {breakdown.formattedDeliveryTime}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default CheckoutShippingSection; 