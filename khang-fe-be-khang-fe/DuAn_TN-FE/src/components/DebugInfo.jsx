import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import config from '../config/config';

const { Title, Text } = Typography;

const DebugInfo = () => {
  const testEndpoints = [
    'api/san-pham-chi-tiet/1',
    'api/mau-sac/getAll',
    'api/kich-thuoc/getAll',
    'api/gio-hang-chi-tiet/them'
  ];

  const testApiCall = async (endpoint) => {
    try {
      const url = config.getApiUrl(endpoint);
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      console.log(`OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
        alert(`✅ Success: ${endpoint}\nStatus: ${response.status}`);
      } else {
        const text = await response.text();
        console.log('Error response:', text);
        alert(`❌ Error: ${endpoint}\nStatus: ${response.status}\nResponse: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert(`❌ Fetch Error: ${endpoint}\nError: ${error.message}`);
    }
  };

  return (
    <Card title="Debug Information" style={{ margin: 16 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Config Information</Title>
          <Text>NODE_ENV: {process.env.NODE_ENV}</Text><br />
          <Text>API_BASE_URL: {config.API_BASE_URL}</Text><br />
          <Text>IS_DEV: {config.IS_DEV.toString()}</Text>
        </div>

        <div>
          <Title level={4}>Test API Endpoints</Title>
          <Space direction="vertical">
            {testEndpoints.map(endpoint => (
              <div key={endpoint}>
                <Text>{endpoint} → {config.getApiUrl(endpoint)}</Text>
                <Button 
                  size="small" 
                  onClick={() => testApiCall(endpoint)}
                  style={{ marginLeft: 8 }}
                >
                  Test
                </Button>
              </div>
            ))}
          </Space>
        </div>

        <div>
          <Title level={4}>Instructions</Title>
          <Text>
            1. Click "Test" buttons to test API endpoints<br />
            2. Check browser console for detailed logs<br />
            3. If you see 403 errors, backend might not be running<br />
            4. If you see CORS errors, proxy might not be working
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default DebugInfo; 