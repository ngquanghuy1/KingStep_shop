import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Divider, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Lấy dữ liệu giỏ hàng từ API khi vào trang
  useEffect(() => {
    axios.get('/api/cart')
      .then(res => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const onFinish = async (values) => {
    try {
      if (paymentMethod === 'vnpay') {
        // Tính tổng tiền
        const total = cart.reduce(
          (sum, item) => sum + (item.sanPhamChiTiet?.giaBan || item.price) * (item.soLuong || item.quantity),
          0
        );
        // Gọi API backend tạo payment VNPAY
        const res = await axios.get(`/api/payment/create?amount=${total}`);
        // Nếu backend trả về URL dạng text
        if (typeof res.data === 'string') {
          window.location.href = res.data;
        } else if (res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        }
        return;
      }
      // Các phương thức khác giữ nguyên
      await axios.post('/api/orders', {
        ...values,
        items: cart,
        trangThai: 0
      });
      message.success('Đặt hàng thành công!');
    } catch (err) {
      message.error('Có lỗi xảy ra!');
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <Title level={2}>Thanh toán</Title>
      <Divider />
      <div>
        <b>Giỏ hàng của bạn:</b>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cart.map(item => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <img
                src={
                  item.sanPhamChiTiet?.sanPham?.imanges?.split(',')[0]
                    ? `/${item.sanPhamChiTiet.sanPham.imanges.split(',')[0]}`
                    : 'https://via.placeholder.com/80x80?text=No+Image'
                }
                alt={item.sanPhamChiTiet?.sanPham?.tenSanPham || item.name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  marginRight: 16,
                  borderRadius: 8,
                  background: '#f5f5f5'
                }}
              />
              <div>
                <div><b>{item.sanPhamChiTiet?.sanPham?.tenSanPham || item.name}</b></div>
                <div>Số lượng: {item.soLuong || item.quantity}</div>
                <div>Giá: {(item.sanPhamChiTiet?.giaBan || item.price)?.toLocaleString()}₫</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Form layout="vertical" onFinish={onFinish} initialValues={{
        name: (JSON.parse(localStorage.getItem('user') || '{}')?.ten) || (JSON.parse(localStorage.getItem('user') || '{}')?.name) || '',
        phone: (JSON.parse(localStorage.getItem('user') || '{}')?.soDienThoai) || (JSON.parse(localStorage.getItem('user') || '{}')?.phone) || '',
        address: (JSON.parse(localStorage.getItem('user') || '{}')?.diaChi) || (JSON.parse(localStorage.getItem('user') || '{}')?.address) || ''
      }}>
        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Địa chỉ nhận hàng" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Phương thức thanh toán" name="payment" rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}>
          <Select
            placeholder="Chọn phương thức"
            onChange={value => setPaymentMethod(value)}
          >
            <Option value="cod">Thanh toán khi nhận hàng</Option>
            <Option value="bank">Chuyển khoản ngân hàng</Option>
            <Option value="vnpay">VNPAY</Option>
          </Select>
        </Form.Item>
        {/* Hiển thị phần test VNPAY nếu chọn VNPAY */}
        {paymentMethod === 'vnpay' && (
          <div style={{ margin: '16px 0', padding: 12, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
            <b>Phương thức thanh toán VNPAY test</b>
            <div>Đây là phần test cho VNPAY. Bạn có thể nhập thông tin test hoặc xem hướng dẫn test tại đây.</div>
          </div>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
            Xác nhận đặt hàng
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Checkout;