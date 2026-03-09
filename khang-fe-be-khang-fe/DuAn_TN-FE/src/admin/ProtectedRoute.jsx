import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return token && user;
  };

  if (!isAuthenticated()) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    return <Navigate to="/admin-login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị component con
  return children;
};

export default ProtectedRoute; 