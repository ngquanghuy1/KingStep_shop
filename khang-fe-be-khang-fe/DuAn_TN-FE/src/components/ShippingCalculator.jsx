import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  InputNumber, 
  Typography, 
  Space, 
  Divider, 
  Alert, 
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  message
} from 'antd';
import { 
  TruckOutlined, 
  CalculatorOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import AddressSelector from './AddressSelector';
import config from '../config/config';

const { Title, Text, Paragraph } = Typography;

const ShippingCalculator = ({ 
  onShippingFeeCalculated,
  defaultWeight = 500,
  showDetails = true,
  compact = false 
}) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [weight, setWeight] = useState(defaultWeight);
  const [shippingFee, setShippingFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCalculation, setLastCalculation] = useState(null);

  // Reset shipping fee when address changes
  useEffect(() => {
    setShippingFee(null);
    setError(null);
  }, [selectedProvince, selectedDistrict, selectedWard, weight]);

  const calculateShippingFee = async (useShop = true) => {
    if (!selectedDistrict || !selectedWard || !weight) {
      message.error('Vui lòng chọn đầy đủ địa chỉ giao hàng và cân nặng!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = useShop ? 'api/ghn/calculate-fee-shop' : 'api/ghn/calculate-fee';
      const params = new URLSearchParams({
        toDistrict: selectedDistrict,
        toWardCode: selectedWard,
        weight: weight
      });

      // Add fromDistrict for custom calculation
      if (!useShop) {
        params.append('fromDistrict', '1454'); // Default from Hà Nội
      }

      const response = await fetch(`${config.getApiUrl(endpoint)}?${params}`, {
        method: 'POST'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const textBody = await response.text();
        const data = textBody && contentType.includes('application/json') ? JSON.parse(textBody) : (textBody ? { raw: textBody } : {});
        setShippingFee(data);
        setLastCalculation({
          timestamp: new Date(),
          address: `${selectedProvince}, ${selectedDistrict}, ${selectedWard}`,
          weight: weight,
          useShop: useShop
        });

        // Callback to parent component
        if (onShippingFeeCalculated) {
          onShippingFeeCalculated(data);
        }

        message.success('Tính phí vận chuyển thành công!');
      } else {
        const contentType = response.headers.get('content-type') || '';
        const errorText = await response.text();
        let errorMessage = 'Không thể tính phí vận chuyển';
        if (errorText) {
          if (contentType.includes('application/json')) {
            try {
              const errJson = JSON.parse(errorText);
              errorMessage = errJson.message || errorMessage;
            } catch {
              errorMessage = errorText;
            }
          } else {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Lỗi tính phí vận chuyển:', error);
      setError(error.message);
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDeliveryTime = (timeString) => {
    if (!timeString) return 'Chưa xác định';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return timeString;
    }
  };

  const getAddressDisplay = () => {
    if (!selectedProvince && !selectedDistrict && !selectedWard) {
      return 'Chưa chọn địa chỉ';
    }
    
    const parts = [];
    if (selectedProvince) parts.push(selectedProvince);
    if (selectedDistrict) parts.push(selectedDistrict);
    if (selectedWard) parts.push(selectedWard);
    
    return parts.join(', ');
  };

  const renderShippingFeeDetails = () => {
    if (!shippingFee) return null;

    return (
      <Card 
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span>Kết quả tính phí vận chuyển</span>
          </Space>
        }
        style={{ marginTop: 16 }}
        extra={
          <Tag color="green">
            <ClockCircleOutlined /> {formatDeliveryTime(shippingFee.expected_delivery_time)}
          </Tag>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Tổng phí vận chuyển"
              value={shippingFee.total_fee}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              suffix="VNĐ"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Phí dịch vụ"
              value={shippingFee.service_fee}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              suffix="VNĐ"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Phí bảo hiểm"
              value={shippingFee.insurance_fee}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              suffix="VNĐ"
            />
          </Col>
        </Row>

        {showDetails && (
          <>
            <Divider />
            <div style={{ fontSize: '14px', color: '#666' }}>
              <Text strong>Thông tin chi tiết:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Địa chỉ giao hàng: {getAddressDisplay()}</li>
                <li>Cân nặng: {weight}g</li>
                <li>Thời gian giao hàng dự kiến: {formatDeliveryTime(shippingFee.expected_delivery_time)}</li>
                {shippingFee.service_type && (
                  <li>Loại dịch vụ: {shippingFee.service_type}</li>
                )}
              </ul>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Alert
        message="Lỗi tính phí vận chuyển"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: 16 }}
        action={
          <Button 
            size="small" 
            danger 
            onClick={() => setError(null)}
          >
            Đóng
          </Button>
        }
      />
    );
  };

  const renderLastCalculation = () => {
    if (!lastCalculation) return null;

    return (
      <Alert
        message="Lần tính cuối"
        description={
          <div>
            <div>Địa chỉ: {lastCalculation.address}</div>
            <div>Cân nặng: {lastCalculation.weight}g</div>
            <div>Thời gian: {lastCalculation.timestamp.toLocaleString('vi-VN')}</div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    );
  };

  return (
    <Card
      title={
        <Space>
          <TruckOutlined style={{ color: '#1890ff' }} />
          <span>Tính phí vận chuyển GHN</span>
        </Space>
      }
      extra={
        <Tooltip title="Thông tin API">
          <InfoCircleOutlined style={{ color: '#666' }} />
        </Tooltip>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Address Selection */}
        <div>
          <Title level={5}>📍 Địa chỉ giao hàng</Title>
          <AddressSelector
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            selectedWard={selectedWard}
            onProvinceChange={setSelectedProvince}
            onDistrictChange={setSelectedDistrict}
            onWardChange={setSelectedWard}
            showWard={true}
          />
        </div>

        {/* Weight Input */}
        <div>
          <Title level={5}>📦 Thông tin hàng hóa</Title>
          <Space>
            <Text>Cân nặng:</Text>
            <InputNumber
              value={weight}
              onChange={setWeight}
              min={1}
              max={30000}
              addonAfter="gram"
              style={{ width: 150 }}
              placeholder="Nhập cân nặng"
            />
            <Text type="secondary">(1-30,000g)</Text>
          </Space>
        </div>

        {/* Action Buttons */}
        <div>
          <Title level={5}>💰 Tính phí vận chuyển</Title>
          <Space>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={() => calculateShippingFee(true)}
              loading={loading}
              disabled={!selectedDistrict || !selectedWard || !weight}
            >
              Tính phí từ Shop
            </Button>
            <Button
              icon={<CalculatorOutlined />}
              onClick={() => calculateShippingFee(false)}
              loading={loading}
              disabled={!selectedDistrict || !selectedWard || !weight}
            >
              Tính phí tùy chỉnh
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setShippingFee(null);
                setError(null);
              }}
              disabled={!shippingFee && !error}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>Đang tính phí vận chuyển...</div>
          </div>
        )}

        {/* Results */}
        {renderShippingFeeDetails()}
        {renderError()}
        {renderLastCalculation()}

        {/* Info */}
        <Alert
          message="Thông tin"
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                • <strong>Tính phí từ Shop:</strong> Sử dụng shop ID 5951434 làm điểm gửi hàng
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                • <strong>Tính phí tùy chỉnh:</strong> Cho phép chọn điểm gửi hàng bất kỳ
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                • <strong>Phí bảo hiểm:</strong> Tự động tính dựa trên giá trị hàng hóa
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default ShippingCalculator; 