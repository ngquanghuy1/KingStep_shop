import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, Input, Button, Dropdown, message } from 'antd';
import './Header.css';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { getCustomerId, getCustomerName, isLoggedIn, getUserRole, logout } from '../utils/authUtils';
import CartBadge from './CartBadge';

const { Header: AntHeader } = Layout;

const menuItems = [
  { key: 'home', label: <Link to="/home">Trang chủ</Link> },
  { key: 'products', label: <Link to="/products">Sản phẩm</Link> },
  { key: 'blog', label: <Link to="/blog">Tin tức</Link> },
  { key: 'contact', label: <Link to="/contact">Liên hệ</Link> },
];

// Menu user sẽ được cập nhật động dựa trên trạng thái đăng nhập

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = menuItems.find(item => location.pathname.startsWith('/' + item.key))?.key || 'home';

  const [showSearch, setShowSearch] = useState(false);
  const [userMenuItems, setUserMenuItems] = useState([
    // Menu mặc định
    {
      key: 'default',
      label: 'Đang tải...',
      disabled: true
    }
  ]);
  const inputRef = useRef(null);

  // ✅ CẬP NHẬT MENU USER DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP
  useEffect(() => {
    console.log('🔄 Header: Cập nhật menu user...');
    console.log('🔄 Header: isLoggedIn =', isLoggedIn());
    console.log('🔄 Header: localStorage trực tiếp:', {
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      userRole: localStorage.getItem('userRole'),
      customerName: localStorage.getItem('customerName'),
      customerId: localStorage.getItem('customerId')
    });
    
    if (isLoggedIn()) {
      const customerName = getCustomerName();
      const userRole = getUserRole();
      
      console.log('🔄 Header: customerName =', customerName);
      console.log('🔄 Header: userRole =', userRole);
      
      if (userRole === 'KHACH') {
        // Menu cho khách hàng đã đăng nhập
        const menuItems = [
          { 
            key: 'welcome', 
            label: `Xin chào, ${customerName || 'Khách hàng'}!`,
            disabled: true,
            style: { color: '#1890ff', fontWeight: 'bold' }
          },
          { key: 'divider1', type: 'divider' },
          {
            key: 'profile',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          },
          {
            key: 'orders',
            label: 'Đơn hàng của tôi',
            icon: <HeartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          },
          // {
          //   key: 'wishlist',
          //   label: 'Sản phẩm yêu thích',
          //   icon: <HeartOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          // },
          { key: 'divider2', type: 'divider' },
          { 
            key: 'logout', 
            label: 'Đăng xuất',
            icon: <LogoutOutlined />
          },
        ];
        
        console.log('🔄 Header: Menu khách hàng =', menuItems);
        setUserMenuItems(menuItems);
        
      } else if (userRole === 'NHANVIEN') {
        // Menu cho nhân viên
        const menuItems = [
          { 
            key: 'welcome', 
            label: `Nhân viên: ${customerName || 'Admin'}`,
            disabled: true,
            style: { color: '#52c41a', fontWeight: 'bold' }
          },
          { key: 'divider1', type: 'divider' },
          {
            key: 'admin',
            label: 'Quản lý hệ thống',
            icon: <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          },
          { key: 'divider2', type: 'divider' },
          { 
            key: 'logout', 
            label: 'Đăng xuất',
            icon: <LogoutOutlined />
          },
        ];
        
        console.log('🔄 Header: Menu nhân viên =', menuItems);
        setUserMenuItems(menuItems);
      }
    } else {
      // Menu cho khách chưa đăng nhập
      const menuItems = [
        {
          key: 'login',
          label: 'Đăng nhập',
          icon: <LoginOutlined style={{ marginRight: 8 }} />
        },
        {
          key: 'register',
          label: 'Đăng ký',
          icon: <UserOutlined style={{ marginRight: 8 }} />
        },
        { key: 'divider1', type: 'divider' },
        {
          key: 'cart',
          label: 'Giỏ hàng',
          icon: <CartBadge />
        },
      ];
      
      console.log('🔄 Header: Menu chưa đăng nhập =', menuItems);
      setUserMenuItems(menuItems);
    }
  }, [location.pathname]); // ✅ CẬP NHẬT KHI LOCATION THAY ĐỔI HOẶC KHI COMPONENT MOUNT

  // ✅ THÊM: Lắng nghe thay đổi localStorage để force re-render
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Header: localStorage changed, forcing menu update...');
      // Force re-render bằng cách cập nhật state
      setUserMenuItems(prev => [...prev]);
    };

    // Lắng nghe sự kiện storage change
    window.addEventListener('storage', handleStorageChange);
    
    // Cũng kiểm tra localStorage mỗi 500ms để đảm bảo
    const interval = setInterval(() => {
      if (isLoggedIn() && userMenuItems[0]?.key === 'default') {
        console.log('🔄 Header: Detected login but menu still loading, forcing update...');
        handleStorageChange();
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userMenuItems]);

  // ✅ XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!');
    navigate('/home');
  };

  // Auto focus khi hiện input
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  console.log('🔄 Header: userMenuItems hiện tại =', userMenuItems);
  console.log('🔄 Header: userMenuItems length =', userMenuItems.length);
  console.log('🔄 Header: userMenuItems[0] =', userMenuItems[0]);

  return (
    <AntHeader className="custom-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/home" className="logo-link">
          <img src="/logo.png" alt="Logo" className="header-logo" />
        </Link>

        {/* Menu chính */}
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="main-menu"
        />

        {/* Hành động bên phải */}
        <div className="header-actions">
          {/* Toggle Search */}
          <div className="search-toggle">
            {showSearch ? (
              <Input
                ref={inputRef}
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                className="header-search-input"
                size="large"
                onBlur={() => setShowSearch(false)}
              />
            ) : (
              <Button
                type="text"
                icon={<SearchOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setShowSearch(true)}
                size="large"
                className="search-toggle-btn"
              />
            )}
          </div>

          {/* ✅ GIỎ HÀNG - Đặt cạnh icon tìm kiếm */}
          {isLoggedIn() && getUserRole() === 'KHACH' && (
            <Link to="/cart" className="cart-link">
              <CartBadge />
            </Link>
          )}

          {/* Dropdown menu chính cho user */}
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: ({ key }) => {
                console.log('🔄 Menu item clicked:', key);
                // Xử lý click menu item
                if (key === 'login') navigate('/login');
                if (key === 'register') navigate('/register');
                if (key === 'profile') navigate('/profile');
                if (key === 'orders') navigate('/orders');
                if (key === 'wishlist') navigate('/wishlist');
                if (key === 'admin') navigate('/admin-panel');
                if (key === 'logout') handleLogout();
              }
            }} 
            placement="bottomRight" 
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              size="large"
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
}

export default Header;
