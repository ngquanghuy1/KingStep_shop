import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Select, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AddressSelector from '../components/AddressSelector';
import config from '../config/config';

const { Title } = Typography;
const { Option } = Select;

function Register() {
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const navigate = useNavigate();

  // Functions xử lý thay đổi địa chỉ
  const handleProvinceChange = (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
  };

  const handleDistrictChange = (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
  };

  const handleWardChange = (wardId) => {
    setSelectedWard(wardId);
  };

  // Function để tạo địa chỉ ngắn gọn
  const createShortAddress = (addressDetail, selectedWard, selectedDistrict, selectedProvince) => {
    const parts = [];

    if (addressDetail && addressDetail.trim()) {
      parts.push(addressDetail.trim());
    }

    if (selectedWard) {
      parts.push(selectedWard);
    }

    if (selectedDistrict) {
      parts.push(selectedDistrict);
    }

    if (selectedProvince) {
      parts.push(selectedProvince);
    }

    const fullAddress = parts.join(', ');

    // Giới hạn độ dài tối đa 200 ký tự để an toàn
    return fullAddress.substring(0, 200);
  };

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const requestData = {
        tenKhachHang: values.name,
        email: values.email,
        soDienThoai: values.phone || '',
        matKhau: values.password,
        confirmPassword: values.confirm,
        gioiTinh: true, // Giá trị mặc định: true = Nam
        ngaySinh: null, // Giá trị mặc định: null
        diaChi: createShortAddress(values.addressDetail, selectedWard, selectedDistrict, selectedProvince)
      };

      console.log('Dữ liệu gửi lên:', requestData);

      const response = await fetch(config.getApiUrl('api/auth/dang-ky'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        console.log('=== DEBUG ERROR RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          console.log('Error data type:', typeof errorData);
          console.log('Error data keys:', Object.keys(errorData));
          console.log('Error data.success:', errorData.success);
          console.log('Error data.message:', errorData.message);

          if (errorData.success === false) {
            console.log('Showing error message:', errorData.message);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: errorData.message,
            });
          } else if (errorData.message) {
            console.log('Showing error message (fallback):', errorData.message);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: errorData.message,
            });
          } else {
            const errorMessages = Object.values(errorData).join(', ');
            console.log('Showing validation error:', errorMessages);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi Validation',
              text: `Lỗi validation: ${errorMessages}`,
            });
          }
        } catch (parseError) {
          console.log('Parse JSON error:', parseError);

          // Thử đọc text nếu không parse được JSON
          try {
            const errorText = await response.text();
            console.log('Error text:', errorText);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: errorText || `Lỗi ${response.status}: ${response.statusText}`,
            });
          } catch (textError) {
            console.log('Parse text error:', textError);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: `Lỗi ${response.status}: ${response.statusText}`,
            });
          }
        }
        return;
      }

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: result.message,
        });

        // Chuyển hướng về trang đăng nhập sau 1 giây
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: result.message || 'Đăng ký thất bại!',
        });
      }

    } catch (error) {
      console.error('Lỗi đăng ký:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi kết nối',
          text: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: 'Đăng ký thất bại! Vui lòng thử lại.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Đăng Ký Tài Khoản
      </Title>
      <Divider />

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
        </Form.Item>



        {/* ✅ Select địa chỉ chi tiết */}
        <Form.Item
          label="Địa chỉ"
        >
          <AddressSelector
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            selectedWard={selectedWard}
            onProvinceChange={handleProvinceChange}
            onDistrictChange={handleDistrictChange}
            onWardChange={handleWardChange}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="addressDetail"
          rules={[
            { max: 100, message: 'Địa chỉ chi tiết không được quá 100 ký tự!' }
          ]}
        >
          <Input prefix={<HomeOutlined />} placeholder="Số nhà, tên đường, tòa nhà..." maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm"
          dependencies={["password"]}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: '100%' }}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span>Đã có tài khoản? </span>
          <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
            Đăng nhập ngay
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Register; 