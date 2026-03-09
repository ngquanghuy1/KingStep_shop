import React from 'react';
import { Avatar, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getCurrentAdminUser } from '../utils/adminUtils';

const { Text } = Typography;

const UserInfo = () => {
  // Lấy thông tin user từ utility function
  const adminUser = getCurrentAdminUser();

  // Debug: Log thông tin user để kiểm tra
  console.log('Admin User Info:', adminUser);

  return (
    <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', transition: 'background-color 0.3s' }} className="user-dropdown">
      <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
      <div className="user-info-text">
        <Text className="user-info-name">
          {adminUser ? adminUser.name : 'Admin'}
        </Text>
        <Text className="user-info-role">
          {adminUser && adminUser.role === 'NHANVIEN' ? 'Nhân viên' : (adminUser ? adminUser.role : 'Admin')}
        </Text>
      </div>
    </Space>
  );
};

export default UserInfo;
