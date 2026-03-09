import React, { useState } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import config from '../config/config';

const { Title, Text } = Typography;

const GHNTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testAPI = async (endpoint, name) => {
    setLoading(true);
    try {
      console.log(`🧪 Testing ${name}:`, config.getApiUrl(endpoint));
      
      const response = await fetch(config.getApiUrl(endpoint));
      const data = await response.json();
      
      console.log(`✅ ${name} response:`, data);
      
      // Phân tích response format
      let actualData = data;
      let dataType = 'direct';
      
      if (!Array.isArray(data) && data && data.data) {
        actualData = data.data;
        dataType = 'wrapped';
      }
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          rawData: data,
          actualData: actualData,
          dataType: dataType,
          isArray: Array.isArray(actualData),
          length: Array.isArray(actualData) ? actualData.length : 'N/A',
          hasDataField: !Array.isArray(data) && data && data.data ? 'Yes' : 'No'
        }
      }));
      
      message.success(`${name} test thành công!`);
    } catch (error) {
      console.error(`❌ ${name} test failed:`, error);
      setResults(prev => ({
        ...prev,
        [name]: {
          error: error.message
        }
      }));
      message.error(`${name} test thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProvinces = () => testAPI('api/ghn/provinces', 'Provinces');
  const testDistricts = () => testAPI('api/ghn/districts/201', 'Districts (Hà Nội)');
  const testWards = () => testAPI('api/ghn/wards/1450', 'Wards (Ba Đình)');

  return (
    <Card title="🧪 GHN API Test" style={{ margin: 16 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Test GHN API Endpoints</Title>
          <Space>
            <Button 
              type="primary" 
              onClick={testProvinces} 
              loading={loading}
            >
              Test Provinces
            </Button>
            <Button 
              type="primary" 
              onClick={testDistricts} 
              loading={loading}
            >
              Test Districts
            </Button>
            <Button 
              type="primary" 
              onClick={testWards} 
              loading={loading}
            >
              Test Wards
            </Button>
          </Space>
        </div>

        <div>
          <Title level={4}>Test Results</Title>
          {Object.entries(results).map(([name, result]) => (
            <Card key={name} size="small" style={{ marginBottom: 8 }}>
              <Title level={5}>{name}</Title>
              {result.error ? (
                <Text type="danger">❌ Error: {result.error}</Text>
                             ) : (
                 <div>
                   <Text>Status: {result.status}</Text><br />
                   <Text>Data Type: {result.dataType}</Text><br />
                   <Text>Has Data Field: {result.hasDataField}</Text><br />
                   <Text>Is Array: {result.isArray ? '✅ Yes' : '❌ No'}</Text><br />
                   <Text>Length: {result.length}</Text><br />
                   <Text>Raw Data Preview: {JSON.stringify(result.rawData).substring(0, 150)}...</Text><br />
                   <Text>Actual Data Preview: {JSON.stringify(result.actualData).substring(0, 150)}...</Text>
                 </div>
               )}
            </Card>
          ))}
        </div>

        <div>
          <Title level={4}>Debug Info</Title>
          <Text>API Base URL: {config.API_BASE_URL}</Text><br />
          <Text>Is Development: {process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}</Text><br />
          <Text>Current URL: {window.location.href}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default GHNTestComponent; 