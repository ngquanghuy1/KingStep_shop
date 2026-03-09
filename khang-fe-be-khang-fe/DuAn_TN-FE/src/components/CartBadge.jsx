import React, { useState, useEffect } from 'react';
import { Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getCustomerId, isLoggedIn } from '../utils/authUtils';

/**
 * Component hiển thị badge số lượng sản phẩm trong giỏ hàng
 */
const CartBadge = () => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isLoggedIn()) {
        setCartCount(0);
        return;
      }

      const customerId = getCustomerId();
      if (!customerId) {
        setCartCount(0);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/gio-hang-chi-tiet/${customerId}`);
        
        if (response.data && Array.isArray(response.data)) {
          // Tính tổng số lượng sản phẩm trong giỏ hàng
          const totalCount = response.data.reduce((sum, item) => sum + (item.soLuong || 0), 0);
          setCartCount(totalCount);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error('Lỗi khi lấy số lượng giỏ hàng:', error);
        setCartCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCartCount();

    // Cập nhật mỗi 30 giây
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Badge
      count={cartCount}
      size="small"
      offset={[0, 4]}
      style={{
        backgroundColor: '#ff6600',
        fontWeight: 600,
        fontSize: 11,
        boxShadow: '0 0 0 1px #fff',
      }}
    >
      <div className="icon-cart-wrapper">
        <ShoppingCartOutlined style={{ fontSize: 18, color: '#333' }} />
      </div>
    </Badge>
  );
};

export default CartBadge;
