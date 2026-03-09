import React from 'react';
import { Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';

const UserDropdown = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hiển thị confirm dialog
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Xóa tất cả thông tin admin khỏi localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Hiển thị thông báo
      console.log('Đã đăng xuất thành công');
      
      // Chuyển hướng về trang đăng nhập
      navigate('/admin-login');
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => {
        console.log('Thông tin cá nhân clicked');
        // Có thể mở modal hoặc chuyển hướng đến trang profile
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      arrow
      trigger={['click']} // Chỉ mở khi click, không phải hover
    >
      <UserInfo />
    </Dropdown>
  );
};

export default UserDropdown;
