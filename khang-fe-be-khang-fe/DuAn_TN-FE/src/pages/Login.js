import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveLoginInfo, isLoggedIn, getUserRole, logout } from '../utils/authUtils';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError('');

      console.log('Đang gửi request đăng nhập...', values);

      const response = await axios.post('/api/auth/dang-nhap', {
        email: values.email,
        matKhau: values.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });


      console.log('Response từ server:', response.data);

      // ✅ DEBUG CHI TIẾT: Kiểm tra từng field trong response.data
      console.log('🔄 Login: response.data keys:', Object.keys(response.data));
      console.log('🔄 Login: response.data values:', Object.values(response.data));
      console.log('🔄 Login: response.data.hoTen:', response.data.hoTen);
      console.log('🔄 Login: response.data.loai:', response.data.loai);
      console.log('🔄 Login: response.data.dieuHuong:', response.data.dieuHuong);

      // ✅ SỬA LẠI: Map đúng tên field từ server response (loai -> lowercase 'l')
      const { id, hoTen, loai, dieuHuong } = response.data;

      // Map sang tên biến mà code sử dụng
      const ten = hoTen;
      const vaiTro = loai;
      const redirectUrl = dieuHuong;

      // ✅ DEBUG: Kiểm tra dữ liệu từ server
      console.log('🔄 Login: Dữ liệu từ server:', { id, ten, vaiTro });
      console.log('🔄 Login: id type:', typeof id, 'value:', id);
      console.log('🔄 Login: ten type:', typeof ten, 'value:', ten);
      console.log('🔄 Login: vaiTro type:', typeof vaiTro, 'value:', vaiTro);

      // ✅ SỬ DỤNG UTILITY FUNCTION ĐỂ LƯU THÔNG TIN ĐĂNG NHẬP
      saveLoginInfo({ id, ten, vaiTro });

      // ✅ DEBUG: Kiểm tra localStorage sau khi lưu
      console.log('🔄 Login: localStorage sau khi lưu:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        userRole: localStorage.getItem('userRole'),
        customerName: localStorage.getItem('customerName'),
        customerId: localStorage.getItem('customerId')
      });

      Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!',
        text: `Chào mừng ${ten}!`,
        showConfirmButton: false,
        timer: 2000
      });

      // Chuyển hướng dựa trên vai trò
      if (vaiTro === 'KHACH') {
        navigate('/home');
      } else if (vaiTro === 'NHANVIEN') {
        navigate('/admin-panel');
      } else {
        navigate('/home');
      }

    } catch (error) {
      console.error('Chi tiết lỗi đăng nhập:', error);

      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);

        if (error.response.data?.message) {
          setError(error.response.data.message);
        } else {
          setError(`Lỗi server: ${error.response.status}`);
        }
      } else if (error.request) {
        console.log('Request data:', error.request);
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
      } else {
        setError('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra nếu user đã đăng nhập thì chuyển hướng
  React.useEffect(() => {
    if (isLoggedIn()) {
      const userRole = getUserRole();

      if (userRole === 'KHACH') {
        navigate('/home');
      } else if (userRole === 'NHANVIEN') {
        navigate('/admin-panel');
      }
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#2c3e50', margin: 0 }}>
            Đăng nhập
          </Title>
          <Text style={{ color: '#7f8c8d' }}>
            Vui lòng đăng nhập để tiếp tục
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            description="Vui lòng kiểm tra thông tin đăng nhập hoặc liên hệ admin"
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email hoặc số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập email hoặc số điện thoại!' },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[0-9]{10,11}$/,
                message: 'Vui lòng nhập email hợp lệ hoặc số điện thoại 10-11 số!'
              }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email hoặc số điện thoại"
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#7f8c8d' }}>
              Chưa có tài khoản?{' '}
              <a href="/register" style={{ color: '#667eea', fontWeight: 600 }}>
                Đăng ký ngay
              </a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;