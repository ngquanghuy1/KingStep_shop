import React from 'react';
import { Typography, Divider } from 'antd';
import UserProfileCard from '../components/UserProfileCard';

const { Title, Text } = Typography;

function Profile() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <Title level={2} style={{ marginBottom: 8 }}>Thông tin tài khoản</Title>
      <Text style={{ display: 'block', marginBottom: 16 }}>Quản lý và cập nhật thông tin cá nhân của bạn.</Text>
      <Divider style={{ margin: '12px 0' }} />
      <UserProfileCard />
    </div>
  );
}

export default Profile; 