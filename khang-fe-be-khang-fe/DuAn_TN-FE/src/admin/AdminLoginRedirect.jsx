import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động chuyển hướng sau 3 giây
    const timer = setTimeout(() => {
      navigate('/admin-login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/admin-login')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px',
              fontWeight: '600'
            }}
          >
            Đăng nhập ngay
          </Button>
        }
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      />
    </div>
  );
};

export default AdminLoginRedirect; 