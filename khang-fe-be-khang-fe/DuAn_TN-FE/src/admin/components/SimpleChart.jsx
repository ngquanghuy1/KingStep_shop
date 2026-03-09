import React from 'react';
import { Card, Typography, Row, Col, Progress } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Text, Title } = Typography;

const SimpleChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">Chưa có dữ liệu để hiển thị</Text>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || 0));

  if (type === 'bar') {
    return (
      <div style={{ position: 'relative', padding: '20px' }}>
        <Title level={5} style={{ marginBottom: '16px', textAlign: 'center' }}>{title}</Title>
        
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                angle={-90}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, maxValue]}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Số Đơn Hàng']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="#1890ff" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Fallback cho type khác (giữ nguyên logic cũ)
  return (
    <div>
      <Title level={5} style={{ marginBottom: '16px' }}>{title}</Title>
      <div style={{ height: '200px', overflowY: 'auto' }}>
        {data.map((item, index) => (
          <div key={index} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text style={{ fontSize: '12px' }}>{item.label}</Text>
              <Text strong style={{ fontSize: '12px' }}>
                {type === 'currency' ? `${(item.value || 0).toLocaleString('vi-VN')}₫` : (item.value || 0)}
              </Text>
            </div>
            <Progress
              percent={Math.round(((item.value || 0) / maxValue) * 100)}
              size="small"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              showInfo={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart; 