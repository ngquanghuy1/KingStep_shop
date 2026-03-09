import React, { useState, useEffect } from 'react';
import { Button, InputNumber, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomerId, isLoggedIn } from '../utils/authUtils';
import config from '../config/config';
import './Cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  // ✅ SỬ DỤNG UTILITY FUNCTION ĐỂ LẤY ID KHÁCH HÀNG
  const customerId = getCustomerId();
  // Bỏ phí vận chuyển cố định
// const SHIPPING_FEE = 30000;
  const navigate = useNavigate();

  // ✅ KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI FETCH GIỎ HÀNG
  useEffect(() => {
    if (!isLoggedIn() || !customerId) {
      message.warning('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login');
      return;
    }
  }, [customerId, navigate]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        console.log('🔄 Đang fetch giỏ hàng cho user:', customerId);
        console.log('📍 API:', config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`));
        
        const response = await axios.get(config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`));
        
        console.log('✅ Response fetch giỏ hàng:', response);
        console.log('📊 Status:', response.status);
        console.log('📦 Cart data:', response.data);
        console.log('📊 Số lượng sản phẩm:', response.data?.length || 0);
        
        // ✅ THÊM: Debug chi tiết từng item trong giỏ hàng
        if (response.data && response.data.length > 0) {
          console.log('🔍 === DEBUG CHI TIẾT TỪNG ITEM TRONG GIỎ HÀNG ===');
          response.data.forEach((item, index) => {
            console.log(`📦 Item ${index + 1}:`, item);
            console.log(`🔑 Item ${index + 1} keys:`, Object.keys(item));
            
            // Debug cấu trúc dữ liệu
            if (item.sanPhamChiTiet) {
              console.log(`📦 Item ${index + 1} có sanPhamChiTiet:`, item.sanPhamChiTiet);
              if (item.sanPhamChiTiet.giaBan) {
                console.log(`💰 Item ${index + 1} sanPhamChiTiet.giaBan:`, item.sanPhamChiTiet.giaBan);
              }
              if (item.sanPhamChiTiet.giaBanGiamGia) {
                console.log(`🎯 Item ${index + 1} sanPhamChiTiet.giaBanGiamGia:`, item.sanPhamChiTiet.giaBanGiamGia);
              }
            }
            
            if (item.giaBan !== undefined) {
              console.log(`💰 Item ${index + 1} có giaBan:`, item.giaBan);
            }
            
            if (item.giaBanGiamGia !== undefined) {
              console.log(`🎯 Item ${index + 1} có giaBanGiamGia:`, item.giaBanGiamGia);
            }
            
            if (item.gia !== undefined) {
              console.log(`💰 Item ${index + 1} có gia:`, item.gia);
            }
            
            if (item.price !== undefined) {
              console.log(`💰 Item ${index + 1} có price:`, item.price);
            }
            
            // Debug số lượng
            console.log(`📊 Item ${index + 1} soLuong:`, item.soLuong);
            
            // Debug tên sản phẩm
            const tenSanPham = item.tenSanPham || (item.sanPhamChiTiet?.sanPham?.tenSanPham);
            console.log(`🏷️ Item ${index + 1} tên sản phẩm:`, tenSanPham);
          });
          console.log('🔍 === KẾT THÚC DEBUG CHI TIẾT ===');
        }
        
        setCart(response.data);
        
      } catch (error) {
        console.error('❌ Lỗi khi fetch giỏ hàng:', error);
        console.error('❌ Response:', error.response);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Data:', error.response?.data);
        
        message.error(`Không lấy được giỏ hàng: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [customerId]);

  const handleQuantityChange = async (id, newQuantity) => {
    try {
      console.log('🔄 Đang cập nhật số lượng sản phẩm...');
      console.log('📦 Item ID:', id);
      console.log('📊 Số lượng mới:', newQuantity);
      console.log('📍 API:', config.getApiUrl(`api/gio-hang-chi-tiet/cap-nhat`));
      console.log('📋 Params:', { id, soLuongMoi: newQuantity });
      
      const response = await axios.put(config.getApiUrl(`api/gio-hang-chi-tiet/cap-nhat`), null, {
        params: { id, soLuongMoi: newQuantity }
      });
      
      console.log('✅ Response cập nhật số lượng:', response);
      console.log('📊 Status:', response.status);
      
      setCart(cart => cart.map(item => item.id === id ? { ...item, soLuong: newQuantity } : item));
      message.success('Đã cập nhật số lượng!');
      
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số lượng:', error);
      console.error('❌ Response:', error.response);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      
      message.error(`Cập nhật thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  // Function xóa toàn bộ giỏ hàng
  const handleDeleteAll = async () => {
    try {
      console.log('🗑️ Đang xóa toàn bộ giỏ hàng...');
      
      const response = await axios.delete(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`));
      
      // ✅ SỬA: HTTP 204 (No Content) cũng là thành công
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Đã xóa toàn bộ giỏ hàng thành công (Status:', response.status, ')');
        message.success('Đã xóa toàn bộ giỏ hàng!');
        
        // ✅ SỬA: Cập nhật state local trước
        setCart([]);
        
        // ✅ SỬA: Reload trang ngay lập tức
        window.location.reload();
        
      } else {
        console.warn('⚠️ Response không thành công:', response.status);
        message.warning('Không thể xóa toàn bộ giỏ hàng!');
      }
      
    } catch (error) {
      console.error('❌ Lỗi khi xóa toàn bộ giỏ hàng:', error);
      message.error(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  // Function xóa sản phẩm khỏi giỏ hàng
  const handleDeleteItem = async (idGioHangChiTiet) => {
    // ✅ KIỂM TRA: ID phải hợp lệ
    if (!idGioHangChiTiet) {
      console.error('❌ ID giỏ hàng chi tiết không hợp lệ:', idGioHangChiTiet);
      message.error('Không thể xác định sản phẩm cần xóa!');
      return;
    }

    try {
      console.log('🗑️ Đang xóa sản phẩm với ID giỏ hàng chi tiết:', idGioHangChiTiet);
      
      // ✅ SỬA: Sử dụng API mới xóa theo ID
      const response = await axios.delete(config.getApiUrl(`api/gio-hang-chi-tiet/xoa/${idGioHangChiTiet}`));
      
      // ✅ SỬA: Xử lý cả 200 và 204
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Xóa sản phẩm thành công (Status:', response.status, '), đang refresh giỏ hàng...');
        message.success('Đã xóa sản phẩm khỏi giỏ hàng!');
        
        // ✅ SỬA: Fetch lại giỏ hàng từ backend ngay lập tức
        try {
          const refreshResponse = await axios.get(config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`));
          if (refreshResponse.status === 200) {
            setCart(refreshResponse.data);
            console.log('✅ Đã refresh giỏ hàng từ backend, số lượng:', refreshResponse.data.length);
          }
        } catch (refreshError) {
          console.error('❌ Lỗi khi refresh giỏ hàng:', refreshError);
          // Nếu refresh thất bại, reload trang
          window.location.reload();
        }
      }
      
    } catch (error) {
      console.error('❌ Lỗi khi xóa sản phẩm:', error);
      
      // ✅ SỬA: Xử lý lỗi 400 (Bad Request) cụ thể
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data || 'Sản phẩm không tồn tại trong giỏ hàng';
        console.error('❌ Lỗi 400 - Bad Request:', errorMessage);
        message.error(`Không thể xóa sản phẩm: ${errorMessage}`);
      } else {
        message.error(`Xóa sản phẩm thất bại: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // ✅ SỬA LẠI: Tính total với logic mới
  console.log('🔍 === DEBUG TOTAL Ở DÒNG 350-370 ===');
  console.log('📦 Cart items cho total:', cart);
  
  const total = cart.reduce((sum, item) => {
    console.log('🔄 Tính total cho item:', item);
    console.log('🔑 Item keys:', Object.keys(item));
    
    let giaBan;
    let source = 'unknown';
    
          // Kiểm tra cấu trúc dữ liệu mới từ backend trước
      if (item.giaBan !== undefined && item.giaBanGiamGia !== undefined) {
        // Cấu trúc mới: item.giaBan, item.giaBanGiamGia
        console.log(`🆕 Cấu trúc mới - giaBan: ${item.giaBan}, giaBanGiamGia: ${item.giaBanGiamGia}`);
        
        // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
        const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
        console.log(`🔍 Kiểm tra: giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBan = ${item.giaBanGiamGia} && ${item.giaBanGiamGia} > 0 && ${item.giaBanGiamGia} < ${item.giaBan} = ${hasDiscount}`);
        
        giaBan = hasDiscount ? item.giaBanGiamGia : item.giaBan;
        source = 'giaBan_giaBanGiamGia';
        console.log(`💰 Kết quả: giaBan = ${giaBan} (${hasDiscount ? 'khuyến mãi' : 'giá gốc'})`);
        
      } else if (item.sanPhamChiTiet && item.sanPhamChiTiet.giaBan) {
        // Cấu trúc cũ: item.sanPhamChiTiet.giaBan
        console.log(`📦 Cấu trúc cũ - sanPhamChiTiet.giaBan: ${item.sanPhamChiTiet.giaBan}, giaBanGiamGia: ${item.sanPhamChiTiet.giaBanGiamGia}`);
        
        // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
        const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia && 
                           item.sanPhamChiTiet.giaBanGiamGia > 0 && 
                           item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
        console.log(`🎯 hasDiscount = ${hasDiscount}`);
        
        giaBan = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;
        source = 'sanPhamChiTiet.giaBan';
        console.log(`💰 Kết quả: giaBan = ${giaBan} (${hasDiscount ? 'khuyến mãi' : 'giá gốc'})`);
        
      } else {
        // Cấu trúc không xác định
        console.warn('⚠️ Cấu trúc dữ liệu không xác định cho total:', item);
        giaBan = 0;
        source = 'fallback_0';
      }
    
    const itemTotal = giaBan * (item.soLuong || 1);
    console.log(`💰 Item ${item.id}: giá=${giaBan}, số lượng=${item.soLuong || 1}, thành tiền=${itemTotal}, nguồn=${source}`);
    
    return sum + itemTotal;
  }, 0);
  
  console.log('💰 === KẾT QUẢ TÍNH TỔNG Ở DÒNG 350-370 ===');
  console.log('💰 Total cuối cùng:', total);
  console.log('📊 Số lượng items:', cart.length);
  console.log('🔍 Chi tiết từng item:');
  cart.forEach((item, index) => {
    console.log(`   Item ${index + 1}:`, {
      id: item.id,
      tenSanPham: item.tenSanPham || (item.sanPhamChiTiet?.sanPham?.tenSanPham),
      giaBan: item.giaBan,
      giaBanGiamGia: item.giaBanGiamGia,
      soLuong: item.soLuong
    });
  });
  console.log('🔍 === KẾT THÚC DEBUG TOTAL Ở DÒNG 350-370 ===');
  
  // ✅ CHỈ HIỂN THỊ TỔNG TIỀN SẢN PHẨM
  // const finalTotalWithShipping = (total || 0) + (SHIPPING_FEE || 0);
  
  return (
    <div className="gx-cart-root gx-cart-full-bg">
      <div className="gx-cart-title-row">
        <ShoppingCartOutlined style={{ fontSize: 32, color: '#ff6600', marginRight: 12 }} />
        <span className="gx-cart-title">Giỏ hàng của bạn</span>
      </div>

      

      <div className="gx-cart-table-wrap">
        <table className="gx-cart-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Thuộc tính</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  Không có sản phẩm trong giỏ hàng
                </td>
              </tr>
            ) : cart.map(item => (
              <tr key={item.id} className="gx-cart-row">
                <td className="gx-cart-product">
                  <img
                    src={
                      // ✅ SỬA LẠI: Xử lý ảnh cho cả cấu trúc cũ và mới, sử dụng API endpoint
                      (() => {
                        let imagePath;
                        
                        if (item.sanPhamChiTiet && item.sanPhamChiTiet.sanPham && item.sanPhamChiTiet.sanPham.imanges) {
                          // Cấu trúc cũ: item.sanPhamChiTiet.sanPham.imanges
                          imagePath = item.sanPhamChiTiet.sanPham.imanges.split(',')[0];
                        } else if (item.imanges) {
                          // Cấu trúc mới: item.imanges
                          imagePath = item.imanges.split(',')[0];
                        } else {
                          imagePath = null;
                        }
                        
                        // ✅ SỬA: Sử dụng API endpoint thay vì static path
                        if (imagePath) {
                          // Xử lý đường dẫn ảnh
                          if (imagePath.startsWith('http')) {
                            return imagePath; // URL tuyệt đối
                                                      } else if (imagePath.startsWith('/')) {
                              // Đường dẫn tương đối, chuyển thành API endpoint
                              return config.getApiUrl(`api/images/${encodeURIComponent(imagePath.substring(1))}`);
                            } else {
                              // Đường dẫn tương đối, sử dụng API endpoint
                              return config.getApiUrl(`api/images/${encodeURIComponent(imagePath)}`);
                            }
                        } else {
                          return 'https://via.placeholder.com/80x80?text=No+Image';
                        }
                      })()
                    }
                    alt={
                      // ✅ SỬA LẠI: Xử lý tên sản phẩm cho cả cấu trúc cũ và mới
                      (() => {
                        if (item.sanPhamChiTiet && item.sanPhamChiTiet.sanPham && item.sanPhamChiTiet.sanPham.tenSanPham) {
                          // Cấu trúc cũ: item.sanPhamChiTiet.sanPham.tenSanPham
                          return item.sanPhamChiTiet.sanPham.tenSanPham;
                        } else if (item.tenSanPham) {
                          // Cấu trúc mới: item.tenSanPham
                          return item.tenSanPham;
                        } else {
                          return 'Sản phẩm không xác định';
                        }
                      })()
                    }
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      marginRight: 12,
                      borderRadius: 8,
                      background: '#f5f5f5'
                    }}
                  />
                  <div className="gx-cart-info">
                    <Link 
                      to={`/products/${(() => {
                        // ✅ SỬA LẠI: Xử lý link cho cả cấu trúc cũ và mới
                        if (item.sanPhamChiTiet && item.sanPhamChiTiet.sanPham && item.sanPhamChiTiet.sanPham.id) {
                          // Cấu trúc cũ: item.sanPhamChiTiet.sanPham.id
                          return item.sanPhamChiTiet.sanPham.id;
                        } else if (item.idSanPham) {
                          // Cấu trúc mới: item.idSanPham
                          return item.idSanPham;
                        } else {
                          return '#';
                        }
                      })()}`} 
                      className="gx-cart-name"
                    >
                      <b>{
                        (() => {
                          if (item.sanPhamChiTiet && item.sanPhamChiTiet.sanPham && item.sanPhamChiTiet.sanPham.tenSanPham) {
                            // Cấu trúc cũ: item.sanPhamChiTiet.sanPham.tenSanPham
                            return item.sanPhamChiTiet.sanPham.tenSanPham;
                          } else if (item.tenSanPham) {
                            // Cấu trúc mới: item.tenSanPham
                            return item.tenSanPham;
                          } else {
                            return 'Sản phẩm không xác định';
                          }
                        })()
                      }</b>
                    </Link>
                  </div>
                </td>
                <td className="gx-cart-variant">
                  {/* ✅ SỬA LẠI: Xử lý thuộc tính cho cả cấu trúc cũ và mới */}
                  {(() => {
                    let mauSac, kichThuoc;
                    
                    if (item.sanPhamChiTiet && item.sanPhamChiTiet.mauSac) {
                      // Cấu trúc cũ: item.sanPhamChiTiet.mauSac.tenMauSac
                      mauSac = item.sanPhamChiTiet.mauSac.tenMauSac;
                    } else if (item.tenMauSac) {
                      // Cấu trúc mới: item.tenMauSac
                      mauSac = item.tenMauSac;
                    } else {
                      mauSac = '--';
                    }
                    
                    if (item.sanPhamChiTiet && item.sanPhamChiTiet.kichThuoc) {
                      // Cấu trúc cũ: item.sanPhamChiTiet.kichThuoc.tenKichThuoc
                      kichThuoc = item.sanPhamChiTiet.kichThuoc.tenKichThuoc;
                    } else if (item.tenKichThuoc) {
                      // Cấu trúc mới: item.tenKichThuoc
                      kichThuoc = item.tenKichThuoc;
                    } else {
                      kichThuoc = '--';
                    }
                    
                    return (
                      <>
                        <span>Màu: {mauSac}</span><br />
                        <span>Size: {kichThuoc}</span>
                      </>
                    );
                  })()}
                </td>
                <td className="gx-cart-price">
                  {/* ✅ SỬA LẠI: Hiển thị giá khuyến mãi và giá gốc */}
                  {(() => {
                    let giaBan, giaBanGiamGia, hasDiscount;
                    
                    // ✅ SỬA: Xử lý tất cả các trường hợp một cách an toàn
                    if (item.giaBan !== undefined && item.giaBanGiamGia !== undefined) {
                      // Cấu trúc mới: item.giaBan, item.giaBanGiamGia
                      giaBan = item.giaBan || 0;
                      giaBanGiamGia = item.giaBanGiamGia; // Giữ nguyên null nếu không có khuyến mãi
                      
                      // ✅ LOGIC ĐÚNG: Nếu giaBanGiamGia = null → lấy giaBan, nếu có khuyến mãi → lấy giaBanGiamGia
                      hasDiscount = giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBan;
                      console.log(`🆕 Cấu trúc mới: giaBan=${giaBan}, giaBanGiamGia=${giaBanGiamGia}, hasDiscount=${hasDiscount}`);
                    } else if (item.sanPhamChiTiet && item.sanPhamChiTiet.giaBan) {
                      // Cấu trúc cũ: item.sanPhamChiTiet.giaBan
                      giaBan = item.sanPhamChiTiet.giaBan || 0;
                      giaBanGiamGia = item.sanPhamChiTiet.giaBanGiamGia; // Giữ nguyên null nếu không có khuyến mãi
                      
                      // ✅ LOGIC ĐÚNG: Nếu giaBanGiamGia = null → lấy giaBan, nếu có khuyến mãi → lấy giaBanGiamGia
                      hasDiscount = giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBan;
                      console.log(`📦 Cấu trúc cũ: giaBan=${giaBan}, giaBanGiamGia=${giaBanGiamGia}, hasDiscount=${hasDiscount}`);
                    } else {
                      // ✅ SỬA: Không set giá = 0, mà tìm giá từ nơi khác
                      console.warn('⚠️ Cấu trúc dữ liệu không xác định, tìm giá từ nơi khác:', item);
                      
                      // Thử tìm giá từ các trường khác
                      if (item.gia) {
                        giaBan = item.gia;
                        giaBanGiamGia = 0;
                        hasDiscount = false;
                        console.log(`🔍 Tìm thấy giá từ trường gia: ${giaBan}`);
                      } else if (item.price) {
                        giaBan = item.price;
                        giaBanGiamGia = item.discountPrice || 0;
                        hasDiscount = giaBanGiamGia > 0 && giaBanGiamGia < giaBan;
                        console.log(`🔍 Tìm thấy giá từ trường price: ${giaBan}, discountPrice: ${giaBanGiamGia}`);
                      } else {
                        // Cuối cùng mới set = 0
                        giaBan = 0;
                        giaBanGiamGia = 0;
                        hasDiscount = false;
                        console.error('❌ Không tìm thấy giá từ bất kỳ trường nào!');
                      }
                    }
                    
                    // ✅ DEBUG: In ra để kiểm tra logic
                    console.log(`🔍 DEBUG hiển thị giá - Item ${item.id}:`, {
                      giaBan,
                      giaBanGiamGia,
                      hasDiscount,
                      giaBanGiamGiaType: typeof giaBanGiamGia,
                      giaBanGiamGiaValue: giaBanGiamGia
                    });
                    
                    if (hasDiscount && giaBanGiamGia > 0) {
                      console.log(`🎯 Hiển thị giá khuyến mãi: gốc=${giaBan}, khuyến mãi=${giaBanGiamGia}`);
                      return (
                        <div>
                          <div style={{ textDecoration: 'line-through', color: '#666', fontSize: '12px' }}>
                            {giaBan.toLocaleString()}đ
                          </div>
                          <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                            {giaBanGiamGia.toLocaleString()}đ
                          </div>
                        </div>
                      );
                    } else {
                      console.log(`💰 Hiển thị giá gốc: ${giaBan}`);
                      return <span>{giaBan.toLocaleString()}đ</span>;
                    }
                  })()}
                </td>
                <td className="gx-cart-quantity">
                  <Button size="small" onClick={() => handleQuantityChange(item.id, Math.max(1, item.soLuong - 1))} disabled={item.soLuong <= 1}>-</Button>
                  <InputNumber
                    min={1}
                    value={item.soLuong}
                    onChange={val => handleQuantityChange(item.id, val)}
                    style={{ width: 50, margin: '0 8px' }}
                  />
                  <Button size="small" onClick={() => handleQuantityChange(item.id, item.soLuong + 1)}>+</Button>
                </td>
                <td className="gx-cart-total">
                  {/* ✅ SỬA LẠI: Tính thành tiền với giá khuyến mãi */}
                  {(() => {
                    let giaBan;
                    
                    // ✅ SỬA: Xử lý tất cả các trường hợp một cách an toàn
                    if (item.giaBan !== undefined && item.giaBanGiamGia !== undefined) {
                      // Cấu trúc mới: item.giaBan, item.giaBanGiamGia
                      // ✅ LOGIC ĐÚNG: Nếu giaBanGiamGia = null → lấy giaBan, nếu có khuyến mãi → lấy giaBanGiamGia
                      const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
                      giaBan = hasDiscount ? item.giaBanGiamGia : item.giaBan;
                      console.log(`🆕 Tính thành tiền - Cấu trúc mới: giaBan=${item.giaBan}, giaBanGiamGia=${item.giaBanGiamGia}, hasDiscount=${hasDiscount}, sử dụng=${giaBan}`);
                    } else if (item.sanPhamChiTiet && item.sanPhamChiTiet.giaBan) {
                      // Cấu trúc cũ: item.sanPhamChiTiet.giaBan
                      // ✅ LOGIC ĐÚNG: Nếu giaBanGiamGia = null → lấy giaBan, nếu có khuyến mãi → lấy giaBanGiamGia
                      const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia && 
                                         item.sanPhamChiTiet.giaBanGiamGia > 0 && 
                                         item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
                      giaBan = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;
                      console.log(`📦 Tính thành tiền - Cấu trúc cũ: giaBan=${item.sanPhamChiTiet.giaBan}, giaBanGiamGia=${item.sanPhamChiTiet.giaBanGiamGia}, hasDiscount=${hasDiscount}, sử dụng=${giaBan}`);
                    } else {
                      // ✅ SỬA: Không set giá = 0, mà tìm giá từ nơi khác
                      console.warn('⚠️ Tính thành tiền - Cấu trúc dữ liệu không xác định, tìm giá từ nơi khác:', item);
                      
                      // Thử tìm giá từ các trường khác
                      if (item.gia) {
                        giaBan = item.gia;
                        console.log(`🔍 Tính thành tiền - Tìm thấy giá từ trường gia: ${giaBan}`);
                      } else if (item.price) {
                        giaBan = item.price;
                        console.log(`🔍 Tính thành tiền - Tìm thấy giá từ trường price: ${giaBan}`);
                      } else {
                        // Cuối cùng mới set = 0
                        giaBan = 0;
                        console.error('❌ Tính thành tiền - Không tìm thấy giá từ bất kỳ trường nào!');
                      }
                    }
                    
                    return (giaBan * (item.soLuong || 1)).toLocaleString() + 'đ';
                  })()}
                </td>
                                 <td className="gx-cart-action">
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                      // ✅ SỬA: Sử dụng ID của giỏ hàng chi tiết
                      let itemId;
                      
                      if (item.id) {
                        // ✅ SỬA: Sử dụng item.id (ID của giỏ hàng chi tiết)
                        itemId = item.id;
                        console.log('🔍 Sử dụng ID giỏ hàng chi tiết:', itemId);
                      } else {
                        console.error('❌ Không tìm thấy ID giỏ hàng chi tiết:', item);
                        message.error('Không thể xác định sản phẩm cần xóa!');
                        return;
                      }
                      
                      console.log('🚀 Gọi handleDeleteItem với ID giỏ hàng chi tiết:', itemId);
                      // ✅ Gọi handleDeleteItem với ID hợp lệ
                      handleDeleteItem(itemId);
                    }} 
                    shape="circle" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gx-cart-bottom-row">
                 <Button danger onClick={handleDeleteAll} style={{ borderRadius: 8 }} disabled={cart.length === 0}>
           Xóa toàn bộ
         </Button>
        

        {cart.length > 0 && (
          <div className="gx-cart-summary-box">
            <div className="summary-row">
              
            </div>
            <div className="summary-total">
              <span>Tổng tiền sản phẩm:</span>
              <span>{(total || 0).toLocaleString()} ₫</span>
            </div>

            <button
              className="checkout-btn"
              onClick={() =>
                navigate('/payment', {
                  state: { 
                    cart, 
                    total: total || 0
                  },
                })
              }
              disabled={cart.length === 0}
            >
              <i className="bi bi-credit-card" style={{ marginRight: 8 }}></i>Thanh toán
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
