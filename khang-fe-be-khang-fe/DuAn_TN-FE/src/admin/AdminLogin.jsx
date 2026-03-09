import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import './AdminLogin.css';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
          try {
        // Gọi API đăng nhập sử dụng endpoint có sẵn
        const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.ADMIN.LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.username,
            matKhau: values.password
          })
        });

        // Debug: Log response để kiểm tra
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Kiểm tra response có content-type JSON không
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
            console.log('Response data:', data);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            setErrorMessage('Lỗi xử lý dữ liệu từ server');
            return;
          }
        } else {
          // Nếu không phải JSON, đọc text
          const textData = await response.text();
          console.log('Response text:', textData);
          setErrorMessage('Server trả về dữ liệu không đúng định dạng');
          return;
        }

               if (response.ok) {
          // Kiểm tra loại để đảm bảo chỉ nhân viên mới được đăng nhập admin
          if (data.loai === 'NHANVIEN') {
            setErrorMessage(''); // Clear error
            
            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem('adminToken', 'admin_token_' + Date.now());
            localStorage.setItem('adminUser', JSON.stringify({
              id: data.id,
              name: data.hoTen,
              role: data.loai
            }));
            
            // Hiển thị thông báo thành công với SweetAlert
            Swal.fire({
              title: 'Đăng nhập thành công!',
              text: `Chào mừng ${data.hoTen}!`,
              icon: 'success',
              confirmButtonText: 'Tiếp tục',
              confirmButtonColor: '#667eea',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            }).then(() => {
              // Chuyển hướng đến trang admin panel sau khi đóng thông báo
              navigate('/admin-panel');
            });
            
          } else if (data.loai === 'KHACH') {
            setErrorMessage('Tài khoản khách hàng không có quyền truy cập admin!');
          } else {
            setErrorMessage('Tài khoản này không có quyền truy cập admin!');
          }
        } else {
          // Xử lý lỗi từ backend (HTTP error status)
          console.log('Error handling - data.message:', data.message);
          console.log('Error handling - data.error:', data.error);
          
          if (data && data.message) {
            console.log('Showing error message:', data.message);
            setErrorMessage(data.message);
          } else if (data && data.error) {
            console.log('Showing error:', data.error);
            setErrorMessage(data.error);
          } else {
            console.log('Showing default error');
            setErrorMessage(`Đăng nhập thất bại! (HTTP ${response.status})`);
          }
        }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="admin-login-overlay"></div>
      </div>
      
      <div className="admin-login-content">
        <Card className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <UserOutlined style={{ fontSize: '40px', color: '#667eea' }} />
            </div>
            <Title level={2} className="admin-login-title">
              Đăng Nhập Admin
            </Title>
            <Text type="secondary" className="admin-login-subtitle">
              Vui lòng đăng nhập để truy cập hệ thống quản lý
            </Text>
          </div>

          <Divider />

          {/* Hiển thị lỗi */}
          {errorMessage && (
            <Alert
              message="Lỗi đăng nhập"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            name="admin-login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="admin-login-form"
          >
                         <Form.Item
               name="username"
               label="Email hoặc số điện thoại"
               rules={[
                 { required: true, message: 'Vui lòng nhập email hoặc số điện thoại!' },
                 {
                   validator: (_, value) => {
                     if (!value) return Promise.resolve();
                     
                     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                     const isPhone = /^[0-9]{10,11}$/.test(value);
                     
                     if (!isEmail && !isPhone) {
                       return Promise.reject(new Error('Vui lòng nhập email hoặc số điện thoại hợp lệ!'));
                     }
                     return Promise.resolve();
                   }
                 }
               ]}
             >
               <Input
                 prefix={<UserOutlined className="site-form-item-icon" />}
                 placeholder="Nhập email hoặc số điện thoại"
                 className="admin-login-input"
               />
             </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Nhập mật khẩu"
                className="admin-login-input"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item className="admin-login-button-container">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="admin-login-button"
                block
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </Form.Item>
          </Form>

                     <div className="admin-login-footer">
             <Text type="secondary" className="admin-login-demo-info">
               <strong>Hướng dẫn:</strong> Sử dụng email hoặc số điện thoại đã đăng ký
             </Text>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin; 