import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  InputNumber, 
  Typography, 
  Space, 
  Alert, 
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  Collapse,
  message
} from 'antd';
import { 
  TruckOutlined, 
  CalculatorOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import AddressSelector from './AddressSelector';
import config from '../config/config';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CompactShippingCalculator = ({ 
  onShippingFeeCalculated,
  defaultWeight = 500,
  showAdvanced = false,
  style = {}
}) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [weight, setWeight] = useState(defaultWeight);
  const [shippingFee, setShippingFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

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

      if (!useShop) {
        params.append('fromDistrict', '1454');
      }

      const response = await fetch(`${config.getApiUrl(endpoint)}?${params}`, {
        method: 'POST'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const textBody = await response.text();
        const data = textBody && contentType.includes('application/json') ? JSON.parse(textBody) : (textBody ? { raw: textBody } : {});
        setShippingFee(data);
        
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
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return timeString;
    }
  };

  const renderShippingFeeResult = () => {
    if (!shippingFee) return null;

    return (
      <Card 
        size="small"
        style={{ marginTop: 8, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
      >
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Statistic
              title="Phí vận chuyển"
              value={shippingFee.total_fee}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '18px' }}
              suffix="VNĐ"
            />
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'right' }}>
              <Tag color="green" icon={<ClockCircleOutlined />}>
                {formatDeliveryTime(shippingFee.expected_delivery_time)}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Alert
        message={error}
        type="error"
        showIcon
        size="small"
        style={{ marginTop: 8 }}
        closable
        onClose={() => setError(null)}
      />
    );
  };

  const renderBasicForm = () => (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div>
        <Text strong>Địa chỉ giao hàng:</Text>
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
      
      <div>
        <Text strong>Cân nặng:</Text>
        <Space style={{ marginLeft: 8 }}>
          <InputNumber
            value={weight}
            onChange={setWeight}
            min={1}
            max={30000}
            addonAfter="g"
            style={{ width: 120 }}
            size="small"
          />
          <Button
            type="primary"
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => calculateShippingFee(true)}
            loading={loading}
            disabled={!selectedDistrict || !selectedWard || !weight}
          >
            Tính phí
          </Button>
        </Space>
      </div>
    </Space>
  );

  const renderAdvancedForm = () => (
    <Collapse 
      ghost 
      size="small"
      activeKey={expanded ? ['1'] : []}
      onChange={(keys) => setExpanded(keys.length > 0)}
    >
      <Panel 
        header={
          <Space>
            <TruckOutlined />
            <span>Tùy chọn nâng cao</span>
          </Space>
        } 
        key="1"
        extra={<DownOutlined />}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Text strong>Loại tính phí:</Text>
            <Space style={{ marginLeft: 8 }}>
              <Button
                size="small"
                onClick={() => calculateShippingFee(true)}
                loading={loading}
                disabled={!selectedDistrict || !selectedWard || !weight}
              >
                Từ Shop
              </Button>
              <Button
                size="small"
                onClick={() => calculateShippingFee(false)}
                loading={loading}
                disabled={!selectedDistrict || !selectedWard || !weight}
              >
                Tùy chỉnh
              </Button>
            </Space>
          </div>
          
          {shippingFee && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>Phí dịch vụ: {formatCurrency(shippingFee.service_fee)}</div>
              <div>Phí bảo hiểm: {formatCurrency(shippingFee.insurance_fee)}</div>
            </div>
          )}
        </Space>
      </Panel>
    </Collapse>
  );

  return (
    <Card
      title={
        <Space>
          <TruckOutlined style={{ color: '#1890ff' }} />
          <span>Phí vận chuyển</span>
        </Space>
      }
      size="small"
      style={{ ...style }}
    >
      {renderBasicForm()}
      
      {showAdvanced && renderAdvancedForm()}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Spin size="small" />
          <div style={{ fontSize: '12px', marginTop: 4 }}>Đang tính...</div>
        </div>
      )}
      
      {renderShippingFeeResult()}
      {renderError()}
    </Card>
  );
};

export default CompactShippingCalculator; 