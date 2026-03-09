import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, isCustomer } from '../utils/authUtils';

/**
 * Component bảo vệ route - chỉ cho phép khách hàng đã đăng nhập truy cập
 * @param {React.ReactNode} children - Component con cần render
 * @param {boolean} requireCustomer - Có yêu cầu phải là khách hàng không (mặc định: true)
 * @returns {React.ReactNode} Component con hoặc redirect
 */
const ProtectedRoute = ({ children, requireCustomer = true }) => {
  // Kiểm tra đăng nhập
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu phải là khách hàng
  if (requireCustomer && !isCustomer()) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
