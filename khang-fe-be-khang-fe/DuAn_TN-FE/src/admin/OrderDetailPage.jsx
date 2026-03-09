import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, TextField, MenuItem } from '@mui/material';

// Thêm mảng trạng thái giống DonHangPage
const TRANG_THAI = [
  { value: 0, label: 'Chờ xác nhận', color: '#ff9800' },
  { value: 1, label: 'Đã xác nhận', color: '#43b244' },
  { value: 2, label: 'Đang chuẩn bị', color: '#1976d2' },
  { value: 3, label: 'Đang giao', color: '#1976d2' },
  { value: 4, label: 'Hoàn thành', color: '#009688' },
  { value: 5, label: 'Đã hủy', color: '#e53935' },
  { value: 7, label: 'Giao hàng không thành công', color: '#9c27b0' }
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderProducts, setOrderProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Thêm state lưu thông tin đơn hàng (bao gồm trạng thái)
  const [orderInfo, setOrderInfo] = useState(null);
  
  // State cho chức năng thêm, sửa, xóa sản phẩm
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addProductQty, setAddProductQty] = useState(1);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [updateQtyLoading, setUpdateQtyLoading] = useState({});
  const [deleteProductLoading, setDeleteProductLoading] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);
  
  // State cho tìm kiếm và lọc sản phẩm
  const [search, setSearch] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterSize, setFilterSize] = useState('');
  
  // State cho modal chọn số lượng
  const [showQtyModal, setShowQtyModal] = useState(false);
  
  // State cho thông tin voucher
  const [voucherInfo, setVoucherInfo] = useState(null);
  
  // 📦 Lấy danh sách sản phẩm có thể thêm
  const fetchAvailableProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll');
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách sản phẩm');
      const data = await res.json();
      const productsWithPromo = data.map((product) => ({
        ...product,
        giaBanGiamGia: product.giaBanSauGiam
      }));
      setAvailableProducts(Array.isArray(productsWithPromo) ? productsWithPromo : []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể lấy danh sách sản phẩm: ' + err.message,
        confirmButtonText: 'OK'
      });
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Lấy giá trị duy nhất cho màu sắc và size
  const colorOptions = [...new Set(availableProducts.map(p => p.mauSac).filter(Boolean))];
  const sizeOptions = [...new Set(availableProducts.map(p => p.kichThuoc).filter(Boolean))];

  // Lọc sản phẩm theo filter
  const filteredProducts = availableProducts.filter(p =>
    (!filterColor || p.mauSac === filterColor) &&
    (!filterSize || p.kichThuoc === filterSize) &&
    p.tenSanPham.toLowerCase().includes(search.toLowerCase())
  );

  // Memoize các giá trị tính toán để tránh re-render
  const isOrderEditable = useMemo(() => orderInfo && orderInfo.trangThai === 0, [orderInfo]);
  const totalAmount = useMemo(() => {
    if (!selectedProduct) return 0;
    return ((selectedProduct.giaBanGiamGia || selectedProduct.giaBan) * addProductQty);
  }, [selectedProduct, addProductQty]);
  
  // Memoize bảng sản phẩm để tránh re-render không cần thiết
  const productsTable = useMemo(() => {
    if (productsLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#1976d2',
          fontSize: 16
        }}>
          Đang tải danh sách sản phẩm...
        </div>
      );
    }
    
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#1976d2', borderBottom: '2px solid #1565c0' }}>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#ffffff', width: '80px', whiteSpace: 'nowrap', fontSize: '13px' }}>Ảnh</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#ffffff', width: '200px', whiteSpace: 'nowrap', fontSize: '13px' }}>Tên sản phẩm</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#ffffff', width: '80px', whiteSpace: 'nowrap', fontSize: '13px' }}>Màu</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#ffffff', width: '60px', whiteSpace: 'nowrap', fontSize: '13px' }}>Size</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#ffffff', width: '80px', whiteSpace: 'nowrap', fontSize: '13px' }}>Tồn kho</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#ffffff', width: '120px', whiteSpace: 'nowrap', fontSize: '13px' }}>Giá</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#ffffff', width: '100px', whiteSpace: 'nowrap', fontSize: '13px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id} style={{ borderBottom: '1px solid #e3e8ee' }}>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', width: '80px' }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 6,
                  border: '1px solid #e3e8ee',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={product.images && product.images.includes(',')
                      ? `http://localhost:8080/api/images/${encodeURIComponent(product.images.split(',')[0].trim())}`
                      : product.images
                        ? `http://localhost:8080/api/images/${encodeURIComponent(product.images.trim())}`
                        : '/placeholder-image.jpg'}
                    alt={product.tenSanPham}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ 
                    display: 'none',
                    width: '100%', 
                    height: '100%', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 10,
                    color: '#999',
                    background: '#f5f5f5'
                  }}>
                    No img
                  </div>
                </div>
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', fontWeight: 500, width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.tenSanPham}
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.mauSac}
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', width: '60px', textAlign: 'center' }}>
                {product.kichThuoc}
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', textAlign: 'center', width: '80px' }}>
                <span style={{ 
                  color: product.soLuong > 0 ? '#43b244' : '#e53935',
                  fontWeight: 600
                }}>
                  {product.soLuong}
                </span>
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', width: '120px' }}>
                {product.giaBanGiamGia && product.giaBanGiamGia < product.giaBan ? (
                  <div>
                    <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                      {product.giaBan?.toLocaleString()} đ
                    </div>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      {product.giaBanGiamGia?.toLocaleString()} đ
                    </div>
                  </div>
                ) : (
                  <div style={{ fontWeight: 600, color: '#1976d2' }}>
                    {product.giaBan?.toLocaleString()} đ
                  </div>
                )}
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle', textAlign: 'center', width: '100px' }}>
                <button
                  onClick={() => handleShowQtyModal(product)}
                  disabled={product.soLuong <= 0}
                  style={{
                    padding: '6px 12px',
                    background: product.soLuong > 0 ? '#1976d2' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: product.soLuong > 0 ? 'pointer' : 'not-allowed',
                    fontSize: 12
                  }}
                >
                  {product.soLuong > 0 ? 'Thêm' : 'Hết hàng'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [filteredProducts, productsLoading]);
  
  // Tối ưu hóa: luôn fetch lại sản phẩm khi mở modal để cập nhật tồn kho
  const handleOpenAddProductModal = useCallback(() => {
    if (orderInfo && orderInfo.trangThai !== 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể thêm sản phẩm!',
        text: 'Chỉ có thể thêm sản phẩm khi đơn hàng ở trạng thái "Chờ xác nhận"!',
        confirmButtonText: 'OK'
      });
      return;
    }
    setShowAddProductModal(true);
    // Luôn fetch lại để cập nhật tồn kho chính xác
    fetchAvailableProducts();
  }, [orderInfo, fetchAvailableProducts]);
  
  // Tối ưu hóa: đóng modal và reset state
  const handleCloseAddProductModal = useCallback(() => {
    setShowAddProductModal(false);
    setSelectedProduct(null);
    setAddProductQty(1);
  }, []);

  // Hàm mở modal chọn số lượng khi bấm Thêm vào hóa đơn
  const handleShowQtyModal = (product) => {
    console.log('Chọn sản phẩm:', product);
    setSelectedProduct(product);
    setAddProductQty(1);
    setShowQtyModal(true);
  };

  // Fetch thông tin đơn hàng (lấy trạng thái)
  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/donhang/chi-tiet/${orderId}`);
        if (!res.ok) {
          throw new Error(`Lỗi khi tải thông tin đơn hàng: ${res.status}`);
        }
        const info = await res.json();
        
        // ✅ DEBUG: Log thông tin đơn hàng nhận được
        console.log('🔍 === DEBUG THÔNG TIN ĐƠN HÀNG ===');
        console.log('📊 orderInfo nhận được:', info);
        console.log('📊 orderInfo.phiVanChuyen:', info?.phiVanChuyen);
        console.log('📊 orderInfo.tongTien:', info?.tongTien);
        console.log('📊 orderInfo.tongTienGiamGia:', info?.tongTienGiamGia);
        console.log('🔍 === END DEBUG ===');
        
        setOrderInfo(info);
        
        // ✅ THÊM: Fetch thông tin voucher nếu có
        if (info.idgiamGia) {
          try {
            const voucherRes = await fetch(`http://localhost:8080/api/voucher/${info.idgiamGia}`);
            if (voucherRes.ok) {
              const voucher = await voucherRes.json();
              setVoucherInfo(voucher);
            } else {
              setVoucherInfo(null);
            }
          } catch (voucherErr) {
            console.warn('Không thể fetch thông tin voucher:', voucherErr);
            setVoucherInfo(null);
          }
        } else {
          setVoucherInfo(null);
        }
      } catch (err) {
        console.error('Lỗi fetch thông tin đơn hàng:', err);
        setError('Không thể tải thông tin đơn hàng: ' + err.message);
      }
    };
    fetchOrderInfo();
  }, [orderId]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Lấy danh sách sản phẩm trong đơn hàng
        const orderDetails = await fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`).then(res => res.json());
        // Lấy chi tiết từng sản phẩm theo idSanPhamChiTiet
        const productDetailPromises = orderDetails.map(item =>
          fetch(`http://localhost:8080/api/san-pham-chi-tiet/spct/${item.idSanPhamChiTiet}`).then(res => res.json())
        );
        const productDetails = await Promise.all(productDetailPromises);
        // Join dữ liệu
        const joined = orderDetails.map((item, idx) => {
          const prod = productDetails[idx];
          return {
            ...item,
            tenSanPham: prod?.tenSanPham || '---',
            anh: prod?.images || '',
            mauSac: prod?.mauSac || '---',
            kichThuoc: prod?.kichThuoc || '---',
            // ✅ SỬA: Sử dụng giá từ DonHangChiTiet thay vì từ sản phẩm
            giaBan: prod?.giaBan,  // Giá gốc từ sản phẩm (để so sánh)
            giaBanGiamGia: item.giaBanGiamGia || item.gia,  // Giá khuyến mãi từ DonHangChiTiet
            gia: item.gia  // Giá thực tế đã lưu trong đơn hàng
          };
        });
        setOrderProducts(joined);
      } catch (err) {
        setError('Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [orderId]);

  // ✅ Các hàm xử lý đơn hàng online
  const handleXacNhan = async () => {
    // ✅ THÊM: Confirm trước khi xác nhận đơn hàng
    const result = await Swal.fire({
      title: 'Xác nhận đơn hàng',
      text: `Bạn có chắc chắn muốn xác nhận đơn hàng #${orderId} không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#43b244',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xác nhận!',
      cancelButtonText: 'Hủy bỏ'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // ✅ THÊM: Hiển thị loading khi đang xác nhận
      Swal.fire({
        title: 'Đang xác nhận đơn hàng...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch(`http://localhost:8080/api/donhang/xac-nhan/${orderId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // ✅ DEBUG: Log response status và headers
      console.log('🔍 Response status:', res.status);
      console.log('🔍 Response statusText:', res.statusText);
      console.log('🔍 Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        // ✅ SỬA: Xử lý lỗi từ backend giống KichThuocPage.jsx
        let errorMessage = 'Lỗi khi xác nhận đơn hàng';
        
        try {
          // ✅ SỬA: Sử dụng response.text() trước như KichThuocPage.jsx
          const errorText = await res.text();
          console.log('🔍 Backend error response (text):', errorText);
          
          if (errorText) {
            errorMessage = errorText;
            
            // ✅ THÊM: Thử parse JSON nếu response là JSON
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (jsonParseError) {
              // Nếu không parse được JSON, sử dụng text gốc
              console.log('🔍 Response không phải JSON, sử dụng text gốc');
            }
          }
          
          // ✅ DEBUG: Log để kiểm tra
          console.log('🔍 Final error message:', errorMessage);
          
        } catch (textError) {
          console.warn('Không thể lấy error text:', textError);
          errorMessage = 'Lỗi khi xác nhận đơn hàng';
        }
        
        // ✅ SỬA: Kiểm tra nếu là lỗi tồn kho không đủ (kiểm tra nhiều từ khóa)
        const isInventoryError = errorMessage.toLowerCase().includes('tồn kho') || 
                                errorMessage.toLowerCase().includes('không đủ') ||
                                errorMessage.toLowerCase().includes('số lượng') ||
                                errorMessage.toLowerCase().includes('inventory') ||
                                errorMessage.toLowerCase().includes('stock') ||
                                errorMessage.toLowerCase().includes('sản phẩm') ||
                                errorMessage.toLowerCase().includes('nike air max') ||
                                errorMessage.toLowerCase().includes('39') ||
                                errorMessage.toLowerCase().includes('đen');
        
        if (isInventoryError) {
          Swal.fire({
            icon: 'warning',
            title: '⚠️ Không thể xác nhận đơn hàng!',
            html: `
              <div style="text-align: left;">
                <div style="background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #0c5460;">🔍 Thông tin lỗi từ hệ thống:</h4>
                  <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 12px; color: #495057; overflow-x: auto; white-space: pre-wrap;">${errorMessage}</pre>
                </div>
              </div>
            `,
            confirmButtonText: 'Tôi hiểu rồi',
            confirmButtonColor: '#f39c12',
            width: '500px'
          });
        } else {
          // ✅ SỬA: Hiển thị các lỗi khác với thông tin chi tiết
          Swal.fire({
            icon: 'error',
            title: '❌ Lỗi khi xác nhận đơn hàng!',
            html: `
              <div style="text-align: left;">
                <p style="color: #e74c3c; font-weight: 600; margin-bottom: 16px;">
                  ${errorMessage}
                </p>
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #721c24;">🔍 Chi tiết lỗi:</h4>
                  <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 12px; color: #495057; overflow-x: auto; white-space: pre-wrap;">${errorMessage}</pre>
                </div>
                <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #c53030;">🔧 Khắc phục:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #c53030;">
                    <li>Kiểm tra log backend để xem chi tiết lỗi</li>
                    <li>Thử lại sau vài giây</li>
                    <li>Liên hệ quản trị viên nếu vấn đề vẫn tiếp tục</li>
                  </ul>
                </div>
              </div>
            `,
            confirmButtonText: 'OK',
            width: '600px'
          });
        }
        return;
      }

      const updatedOrder = await res.json();
      setOrderInfo(updatedOrder);
      
      // ✅ THÊM: Hiển thị thông báo thành công với thông tin chi tiết
      Swal.fire({
        icon: 'success',
        title: '✅ Xác nhận đơn hàng thành công!',
        html: `
          <div style="text-align: left;">
            <p style="color: #27ae60; font-weight: 600; margin-bottom: 16px;">
              Đơn hàng #${orderId} đã được xác nhận thành công!
            </p>
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin-top: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #155724;">📋 Thông tin cập nhật:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>Trạng thái: <strong>Đã xác nhận</strong></li>
                <li>Ngày xác nhận: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></li>
                <li>Tồn kho đã được trừ tự động</li>
                <li>Đơn hàng đã chuyển sang trạng thái chuẩn bị</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: 'Tuyệt vời!',
        confirmButtonColor: '#27ae60'
      });
      
      // ✅ THÊM: Refresh lại dữ liệu để cập nhật UI
      await refreshOrderData();
      
            } catch (err) {
          console.error('Lỗi khi xác nhận đơn hàng:', err);
          
          // ✅ THÊM: Xử lý lỗi network hoặc lỗi khác
          Swal.fire({
            icon: 'error',
            title: '❌ Lỗi hệ thống!',
            html: `
              <div style="text-align: left;">
                <p style="color: #e74c3c; font-weight: 600; margin-bottom: 16px;">
                  Không thể kết nối với hệ thống để xác nhận đơn hàng!
                </p>
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #721c24;">🔧 Khắc phục:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #721c24;">
                    <li>Kiểm tra kết nối mạng</li>
                    <li>Thử lại sau vài giây</li>
                    <li>Liên hệ quản trị viên nếu vấn đề vẫn tiếp tục</li>
                  </ul>
                </div>
                <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #c53030;">🔍 Thông tin lỗi:</h4>
                  <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 12px; color: #495057; overflow-x: auto; white-space: pre-wrap;">${err.message || 'Không có thông tin lỗi chi tiết'}</pre>
                </div>
              </div>
            `,
            confirmButtonText: 'Thử lại',
            confirmButtonColor: '#dc3545',
            width: '600px'
          });
        }
  };

  const handleHuy = async () => {
    const { value: formValues } = await Swal.fire({
      title: '🚫 Hủy đơn hàng',
      text: 'Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng chọn lý do hủy đơn:',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason1" name="reason" value="Khách hàng yêu cầu hủy" style="margin-right: 8px;">
            <label for="reason1">Khách hàng yêu cầu hủy</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason2" name="reason" value="Hết hàng" style="margin-right: 8px;">
            <label for="reason2">Hết hàng</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason3" name="reason" value="Tìm thấy sản phẩm tương tự với giá rẻ hơn ở nơi khác" style="margin-right: 8px;">
            <label for="reason3">Tìm thấy sản phẩm tương tự với giá rẻ hơn ở nơi khác</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason4" name="reason" value="Không còn nhu cầu sử dụng sản phẩm" style="margin-right: 8px;">
            <label for="reason4">Không còn nhu cầu sử dụng sản phẩm</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason5" name="reason" value="Chọn nhầm sản phẩm (màu sắc, kích thước, mẫu mã...)" style="margin-right: 8px;">
            <label for="reason5">Chọn nhầm sản phẩm (màu sắc, kích thước, mẫu mã...)</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason6" name="reason" value="Muốn đổi phương thức thanh toán" style="margin-right: 8px;">
            <label for="reason6">Muốn đổi phương thức thanh toán</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason7" name="reason" value="Lý do khác" style="margin-right: 8px;">
            <label for="reason7">Lý do khác</label>
          </div>
          <div id="customReasonDiv" style="display: none; margin-top: 10px;">
            <textarea id="customReason" placeholder="Nhập lý do khác..." style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#e53935',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận hủy',
      cancelButtonText: 'Hủy bỏ',
      focusConfirm: false,
      preConfirm: () => {
        const selectedReason = document.querySelector('input[name="reason"]:checked');
        if (!selectedReason) {
          Swal.showValidationMessage('Vui lòng chọn lý do hủy đơn hàng!');
          return false;
        }
        
        let finalReason = selectedReason.value;
        if (finalReason === 'Lý do khác') {
          const customReason = document.getElementById('customReason').value.trim();
          if (!customReason) {
            Swal.showValidationMessage('Vui lòng nhập lý do khác!');
            return false;
          }
          finalReason = customReason;
        }
        
        return finalReason;
      },
      didOpen: () => {
        // Xử lý hiện/ẩn ô nhập lý do khác
        const reasonInputs = document.querySelectorAll('input[name="reason"]');
        const customReasonDiv = document.getElementById('customReasonDiv');
        
        reasonInputs.forEach(input => {
          input.addEventListener('change', () => {
            if (input.value === 'Lý do khác') {
              customReasonDiv.style.display = 'block';
            } else {
              customReasonDiv.style.display = 'none';
            }
          });
        });
      }
    });

    if (formValues) {
      try {
        const res = await fetch(`http://localhost:8080/api/donhang/huy/${orderId}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ghiChu: formValues })
        });
        
        if (!res.ok) throw new Error('Lỗi khi hủy đơn hàng');
        
        const updatedOrder = await res.json();
        setOrderInfo(updatedOrder);
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã hủy đơn hàng thành công!',
          confirmButtonText: 'OK'
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Lỗi khi hủy đơn hàng: ' + err.message,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // ✏️ Cập nhật địa chỉ giao hàng và tính lại phí ship
  const handleCapNhatDiaChi = async (diaChiMoi, soDienThoaiMoi, tenNguoiNhanMoi, emailMoi, districtId, wardCode, phiVanChuyenMoi) => {
    try {
      // Hiển thị loading
      Swal.fire({
        title: 'Đang cập nhật...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const params = new URLSearchParams({
        id: orderId,
        diaChiMoi,
        soDienThoaiMoi,
        tenNguoiNhanMoi,
        emailMoi,
        districtId: districtId || 2025, // ✅ SỬA: Sử dụng districtId từ form
        wardCode: wardCode || '90737', // ✅ SỬA: Sử dụng wardCode từ form
        phiVanChuyenMoi: phiVanChuyenMoi || 0 // ✅ SỬA: Sử dụng tham số được truyền vào
      });
      
      console.log('Gửi request cập nhật địa chỉ với params:', params.toString());
      
      // Gọi API cập nhật địa chỉ và tính lại phí ship
      const res = await fetch(`http://localhost:8080/api/donhang/sua-dia-chi?${params}`, { 
          method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi khi cập nhật địa chỉ: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      console.log('Kết quả cập nhật địa chỉ:', result);
      
      // ✅ Cập nhật state với thông tin mới
      setOrderInfo(prev => ({
        ...prev,
        diaChiGiaoHang: result.diaChiGiaoHang,
        tenNguoiNhan: result.tenNguoiNhan,
        soDienThoaiGiaoHang: result.soDienThoaiGiaoHang,
        emailGiaoHang: result.emailGiaoHang,
        phiVanChuyen: result.phiVanChuyen,
        tongTien: result.tongTienMoi
      }));
      
      // Hiển thị thông báo thành công với thông tin mới
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        html: `
          <div style="text-align: left;">
            <p>Đã cập nhật địa chỉ giao hàng thành công!</p>
            <div style="margin-top: 16px; padding: 12px; background: #f0f8ff; border-radius: 8px;">
              <p><strong>Phí ship mới:</strong> ${result.phiVanChuyen?.toLocaleString()}đ</p>
              <p><strong>Tổng tiền mới:</strong> ${result.tongTienMoi?.toLocaleString()}đ</p>
            </div>
          </div>
        `,
        confirmButtonText: 'OK'
      });
      
      // Refresh lại dữ liệu để cập nhật UI
      await refreshOrderData();
      
    } catch (err) {
      console.error('Lỗi cập nhật địa chỉ:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Lỗi khi cập nhật địa chỉ: ' + err.message,
        confirmButtonText: 'OK'
      });
    }
  };

  // ✅ THÊM: State cho form địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // ✅ THÊM: Fetch danh sách tỉnh/thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/ghn/provinces');
        if (res.ok) {
          const data = await res.json();
          setProvinces(data.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách tỉnh:', err);
      }
    };
    fetchProvinces();
  }, []);

  // ✅ THÊM: Fetch quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const res = await fetch(`http://localhost:8080/api/ghn/districts/${selectedProvince}`);
          if (res.ok) {
            const data = await res.json();
            setDistricts(data.data || []);
            setSelectedDistrict(''); // Reset quận/huyện khi đổi tỉnh
            setSelectedWard(''); // Reset phường/xã khi đổi tỉnh
          }
        } catch (err) {
          console.error('Lỗi khi lấy danh sách quận:', err);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // ✅ THÊM: Fetch phường/xã khi chọn quận
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const res = await fetch(`http://localhost:8080/api/ghn/wards/${selectedDistrict}`);
          if (res.ok) {
            const data = await res.json();
            setWards(data.data || []);
            setSelectedWard(''); // Reset phường/xã khi đổi quận
          }
    } catch (err) {
          console.error('Lỗi khi lấy danh sách phường:', err);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict]);

  // ✅ SỬA: Hàm parse địa chỉ để lấy districtId và wardCode từ format hiện tại
  const parseDiaChiGiaoHang = (diaChiGiaoHang) => {
    if (!diaChiGiaoHang) return { diaChiChiTiet: '', wardCode: '', districtId: '', provinceName: '' };
    
    // ✅ THÊM: Log để xem format thực tế
    console.log('🔍 Địa chỉ gốc:', diaChiGiaoHang);
    
    // ✅ SỬA: Parse format hiện tại: "101 Đường K, Xã Vũ Chính, Thành phố Thái Bình, Thái Bình"
    const parts = diaChiGiaoHang.split(', ');
    
    if (parts.length >= 4) {
      const diaChiChiTiet = parts[0]; // "101 Đường K"
      const wardName = parts[1];      // "Xã Vũ Chính" 
      const districtName = parts[2];  // "Thành phố Thái Bình"
      const provinceName = parts[3];  // "Thái Bình"
      
      return { 
        diaChiChiTiet, 
        wardCode: wardName,        // Tạm thời lưu tên ward
        districtId: districtName,  // Tạm thời lưu tên district
        provinceName 
      };
    }
    
    // Fallback: Parse theo format cũ
    return { diaChiChiTiet: diaChiGiaoHang, wardCode: '', districtId: '', provinceName: '' };
  };

  // ✅ THÊM: Hàm mở form sửa địa chỉ với select options
  const handleOpenEditAddressForm = async () => {
    // Kiểm tra trạng thái đơn hàng
    if (orderInfo && orderInfo.trangThai !== 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể sửa địa chỉ!',
        text: 'Chỉ có thể sửa địa chỉ khi đơn hàng ở trạng thái "Chờ xác nhận"!',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // ✅ SỬA: Parse địa chỉ hiện tại để tìm tỉnh/quận/phường
    let currentProvinceId = '';
    let currentDistrictId = '';
    let currentWardCode = '';
    let currentDiaChiChiTiet = '';
    let tempDistricts = [];
    let tempWards = [];
    // ✅ SỬA: Khởi tạo phí ship mới bằng phí ship hiện tại để tránh tăng giá
    let phiShipMoiTinhDuoc = orderInfo?.phiVanChuyen || 0;
    
    if (orderInfo?.diaChiGiaoHang) {
      // ✅ SỬA: Sử dụng hàm parse mới
      const parsedDiaChi = parseDiaChiGiaoHang(orderInfo.diaChiGiaoHang);
      currentDiaChiChiTiet = parsedDiaChi.diaChiChiTiet;
      
      // ✅ THÊM: Log để debug
      console.log('📍 Parse địa chỉ hiện tại:', parsedDiaChi);
      
      // ✅ SỬA: Sử dụng wardCode và districtId trực tiếp từ parse
      if (parsedDiaChi.wardCode && parsedDiaChi.districtId) {
        currentWardCode = parsedDiaChi.wardCode;
        currentDistrictId = parsedDiaChi.districtId;
        
        console.log('📍 Tìm thấy wardCode và districtId:', { currentWardCode, currentDistrictId });
        
        // Tìm tỉnh theo tên
        const province = provinces.find(p => p.ProvinceName === parsedDiaChi.provinceName);
        if (province) {
          currentProvinceId = province.ProvinceID;
          console.log('📍 Tìm thấy tỉnh:', province);
          
          // Fetch quận/huyện và phường/xã để hiển thị tên
          try {
            const districtRes = await fetch(`http://localhost:8080/api/ghn/districts/${currentProvinceId}`);
            if (districtRes.ok) {
              const districtData = await districtRes.json();
              tempDistricts = districtData.data || [];
              console.log('📍 Load được districts:', tempDistricts.length);
              
              // ✅ SỬA: Tìm quận/huyện theo tên thay vì theo ID
              const district = tempDistricts.find(d => d.DistrictName === currentDistrictId);
              if (district) {
                console.log('📍 Tìm thấy district:', district);
                
                // ✅ SỬA: Cập nhật currentDistrictId thành ID thực
                currentDistrictId = district.DistrictID;
                
                // Fetch phường/xã của quận này
                try {
                  const wardRes = await fetch(`http://localhost:8080/api/ghn/wards/${currentDistrictId}`);
                  if (wardRes.ok) {
                    const wardData = await wardRes.json();
                    tempWards = wardData.data || [];
                    console.log('📍 Load được wards:', tempWards.length);
                    
                    // ✅ SỬA: Tìm phường/xã theo tên và cập nhật currentWardCode
                    const ward = tempWards.find(w => w.WardName === currentWardCode);
                    if (ward) {
                      currentWardCode = ward.WardCode;
                      console.log('📍 Tìm thấy ward và cập nhật wardCode:', ward);
                    } else {
                      console.log('❌ Không tìm thấy ward với tên:', currentWardCode);
                    }
                  }
                } catch (err) {
                  console.error('Lỗi khi lấy danh sách phường:', err);
                }
              } else {
                console.log('❌ Không tìm thấy district với tên:', currentDistrictId);
              }
            }
          } catch (err) {
            console.error('Lỗi khi lấy danh sách quận:', err);
          }
        } else {
          console.log('❌ Không tìm thấy tỉnh với tên:', parsedDiaChi.provinceName);
        }
      } else {
        console.log('❌ Không parse được wardCode hoặc districtId từ địa chỉ:', orderInfo.diaChiGiaoHang);
      }
    }

    // ✅ THÊM: Log để debug form HTML
    console.log('📍 Tạo form với dữ liệu:', {
      currentProvinceId,
      currentDistrictId, 
      currentWardCode,
      tempDistricts: tempDistricts.length,
      tempWards: tempWards.length,
      provinces: provinces.length
    });
    
    const { value: formValues } = await Swal.fire({
      title: 'Cập nhật thông tin giao hàng',
      html: `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <!-- Hàng 1: Tên, SĐT, Email -->
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Tên người nhận:</label>
            <input id="swal-input1" class="swal2-input" placeholder="Tên người nhận" value="${orderInfo?.tenNguoiNhan || ''}" style="width: 100%; margin-bottom: 0; padding: 8px; font-size: 13px;">
          </div>
          
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Số điện thoại:</label>
            <input id="swal-input2" class="swal2-input" placeholder="Số điện thoại" value="${orderInfo?.soDienThoaiGiaoHang || ''}" style="width: 100%; margin-bottom: 0; padding: 8px; font-size: 13px;">
          </div>
          
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Email:</label>
            <input id="swal-input3" class="swal2-input" placeholder="Email" value="${orderInfo?.emailGiaoHang || ''}" style="width: 100%; margin-bottom: 0; padding: 8px; font-size: 13px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <!-- Hàng 2: Tỉnh, Quận, Phường -->
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Tỉnh/Thành phố:</label>
            <select id="swal-province" class="swal2-select" style="width: 100%; margin-bottom: 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
              <option value="">Chọn tỉnh/thành phố</option>
              ${provinces.map(province => `<option value="${province.ProvinceID}" ${province.ProvinceID == currentProvinceId ? 'selected' : ''}>${province.ProvinceName}</option>`).join('')}
            </select>
          </div>
          
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Quận/Huyện:</label>
            <select id="swal-district" class="swal2-select" style="width: 100%; margin-bottom: 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;" ${tempDistricts.length > 0 ? '' : 'disabled'}>
              <option value="">Chọn quận/huyện</option>
              ${tempDistricts.map(district => `<option value="${district.DistrictID}" ${district.DistrictID == currentDistrictId ? 'selected' : ''}>${district.DistrictName}</option>`).join('')}
            </select>
          </div>
          
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Phường/Xã:</label>
            <select id="swal-ward" class="swal2-select" style="width: 100%; margin-bottom: 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;" ${tempWards.length > 0 ? '' : 'disabled'}>
              <option value="">Chọn phường/xã</option>
              ${tempWards.map(ward => `<option value="${ward.WardCode}" ${ward.WardCode == currentWardCode ? 'selected' : ''}>${ward.WardName}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <!-- Hàng 3: Địa chỉ chi tiết (full width) -->
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1976d2; font-size: 13px;">Địa chỉ chi tiết:</label>
            <textarea id="swal-input4" class="swal2-textarea" placeholder="Số nhà, tên đường, tên khu vực..." style="width: 100%; height: 60px; resize: vertical; padding: 8px; font-size: 13px;">${currentDiaChiChiTiet || ''}</textarea>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <!-- Hàng 4: Phí ship hiện tại và phí ship mới -->
          <div style="text-align: left; background: #f5f5f5; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #666; font-size: 13px;">Phí ship hiện tại:</label>
            <div style="font-size: 18px; font-weight: 700; color: #1976d2;">${(orderInfo?.phiVanChuyen || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          
          <div style="text-align: left; background: #e8f5e8; padding: 16px; border-radius: 8px; border: 1px solid #4caf50;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">Phí ship mới (ước tính):</label>
            <div id="phi-ship-moi" style="font-size: 18px; font-weight: 700; color: #2e7d32;">-- ₫</div>
          </div>
        </div>
        
        <div style="background: #f0f8ff; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 13px; border-left: 4px solid #1976d2;">
          <strong>💡 Lưu ý:</strong> 
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Nếu chỉ thay đổi thông tin cá nhân (tên, email, số điện thoại), phí ship sẽ được giữ nguyên.</li>
            <li>Nếu thay đổi địa chỉ giao hàng, hệ thống sẽ tự động tính lại phí ship và tổng tiền đơn hàng.</li>
            <li>Phí ship mới sẽ được hiển thị ngay khi bạn chọn phường/xã.</li>
          </ul>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy bỏ',
      width: '600px',
      didOpen: () => {
        // ✅ SỬA: Cập nhật state từ temp để form hiển thị đúng khi mở
        console.log('📍 didOpen - tempDistricts:', tempDistricts.length, tempDistricts);
        console.log('📍 didOpen - tempWards:', tempWards.length, tempWards);
        
        setDistricts(tempDistricts);
        setWards(tempWards);
        
        // ✅ THÊM: Xử lý sự kiện thay đổi tỉnh/quận
        const provinceSelect = document.getElementById('swal-province');
        const districtSelect = document.getElementById('swal-district');
        const wardSelect = document.getElementById('swal-ward');
        
        provinceSelect.addEventListener('change', async (e) => {
          const provinceId = e.target.value;
          if (provinceId) {
            try {
              const res = await fetch(`http://localhost:8080/api/ghn/districts/${provinceId}`);
              if (res.ok) {
                const data = await res.json();
                const districtOptions = data.data || [];
                
                // ✅ SỬA: Cập nhật state districts
                setDistricts(districtOptions);
                
                districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>' + 
                  districtOptions.map(district => `<option value="${district.DistrictID}">${district.DistrictName}</option>`).join('');
                districtSelect.disabled = false;
                
                // ✅ SỬA: Giữ nguyên giá trị đã chọn nếu có
                if (currentDistrictId) {
                  const existingDistrict = districtOptions.find(d => d.DistrictID == currentDistrictId);
                  if (existingDistrict) {
                    districtSelect.value = currentDistrictId;
                  } else {
                    districtSelect.value = '';
                  }
                } else {
                  districtSelect.value = '';
                }
                
                wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                wardSelect.disabled = true;
                wardSelect.value = '';
                
                // ✅ SỬA: Reset state wards
                setWards([]);
              }
            } catch (err) {
              console.error('Lỗi khi lấy danh sách quận:', err);
            }
          } else {
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districtSelect.disabled = true;
            districtSelect.value = '';
            
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            wardSelect.disabled = true;
            wardSelect.value = '';
            
            // ✅ SỬA: Reset cả 2 state
            setDistricts([]);
            setWards([]);
          }
        });
        
        districtSelect.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          if (districtId) {
            try {
              const res = await fetch(`http://localhost:8080/api/ghn/wards/${districtId}`);
              if (res.ok) {
                const data = await res.json();
                const wardOptions = data.data || [];
                
                // ✅ SỬA: Cập nhật state wards
                setWards(wardOptions);
                
                wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>' + 
                  wardOptions.map(ward => `<option value="${ward.WardCode}">${ward.WardName}</option>`).join('');
                wardSelect.disabled = false;
                
                // ✅ SỬA: Giữ nguyên giá trị đã chọn nếu có
                if (currentWardCode) {
                  const existingWard = wardOptions.find(w => w.WardCode == currentWardCode);
                  if (existingWard) {
                    wardSelect.value = currentWardCode;
                  } else {
                    wardSelect.value = '';
                  }
                } else {
                  wardSelect.value = '';
                }
              }
            } catch (err) {
              console.error('Lỗi khi lấy danh sách phường:', err);
            }
          } else {
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            wardSelect.disabled = true;
            wardSelect.value = '';
            
            // ✅ SỬA: Reset state wards
            setWards([]);
          }
          
          // ✅ THÊM: Reset phí ship mới khi đổi quận
          document.getElementById('phi-ship-moi').textContent = '-- ₫';
          
          // ✅ THÊM: Reset phí ship mới về phí ship hiện tại khi đổi quận
          phiShipMoiTinhDuoc = orderInfo?.phiVanChuyen || 0;
        });
        
        // ✅ THÊM: Xử lý sự kiện thay đổi phường/xã để tính phí ship mới
        wardSelect.addEventListener('change', async (e) => {
          const wardCode = e.target.value;
          if (wardCode) {
            // ✅ THÊM: Kiểm tra xem có thực sự thay đổi địa chỉ không
            const currentWardCode = orderInfo?.diaChiGiaoHang ? 
              parseDiaChiGiaoHang(orderInfo.diaChiGiaoHang).wardCode : '';
            const currentDistrictId = orderInfo?.diaChiGiaoHang ? 
              parseDiaChiGiaoHang(orderInfo.diaChiGiaoHang).districtId : '';
            
            // ✅ THÊM: Nếu không thay đổi địa chỉ, giữ nguyên phí ship hiện tại
            if (wardCode === currentWardCode && districtSelect.value === currentDistrictId) {
              phiShipMoiTinhDuoc = orderInfo?.phiVanChuyen || 0;
              document.getElementById('phi-ship-moi').textContent = `${(orderInfo?.phiVanChuyen || 0).toLocaleString('vi-VN')} ₫`;
              return;
            }
            
            // ✅ THÊM: Hiển thị loading khi đang tính phí
            document.getElementById('phi-ship-moi').textContent = 'Đang tính...';
            
            try {
              // ✅ SỬA: Sử dụng format giống Payment.js
              const res = await fetch(`http://localhost:8080/api/ghn/calculate-fee`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  fromDistrict: 1484,                    // ← Ba Đình, Hà Nội (cố định như Payment.js)
                  toDistrict: parseInt(districtSelect.value), // ← Quận đích
                  toWardCode: wardCode,                   // ← Format cũ như Payment.js
                  weight: 500,
                  length: 20,
                  width: 20,
                  height: 10
                })
              });
              
              if (res.ok) {
                const data = await res.json();
                // ✅ SỬA: Parse response giống Payment.js
                let phiShipMoi = 0;
                
                if (data.data && data.data.total) {
                  phiShipMoi = data.data.total;
                } else if (data.data && data.data.total_fee) {
                  phiShipMoi = data.data.total_fee;
                } else if (data.total_fee) {
                  phiShipMoi = data.total_fee;
                } else if (data.total) {
                  phiShipMoi = data.total;
                }
                
                if (phiShipMoi > 0) {
                  phiShipMoiTinhDuoc = phiShipMoi; // ✅ Lưu lại phí ship đã tính
                  document.getElementById('phi-ship-moi').textContent = `${phiShipMoi.toLocaleString('vi-VN')} ₫`;
                } else {
                  document.getElementById('phi-ship-moi').textContent = 'Không xác định';
                }
              } else {
                const errorData = await res.json();
                console.error('Lỗi API:', errorData);
                document.getElementById('phi-ship-moi').textContent = 'Lỗi tính phí';
              }
            } catch (err) {
              console.error('Lỗi khi tính phí ship:', err);
              document.getElementById('phi-ship-moi').textContent = 'Lỗi tính phí';
            }
          } else {
            document.getElementById('phi-ship-moi').textContent = '-- ₫';
          }
        });
      },
      preConfirm: () => {
        const tenNguoiNhan = document.getElementById('swal-input1').value.trim();
        const soDienThoai = document.getElementById('swal-input2').value.trim();
        const email = document.getElementById('swal-input3').value.trim();
        const provinceId = document.getElementById('swal-province').value;
        const districtId = document.getElementById('swal-district').value;
        const wardCode = document.getElementById('swal-ward').value;
        const diaChiChiTiet = document.getElementById('swal-input4').value.trim();
        
        if (!tenNguoiNhan || !soDienThoai || !diaChiChiTiet || !provinceId || !districtId || !wardCode) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc!');
          return false;
        }
        
        // ✅ SỬA: Lấy tên trực tiếp từ DOM để tránh vấn đề state không đồng bộ
        const provinceSelect = document.getElementById('swal-province');
        const districtSelect = document.getElementById('swal-district');
        const wardSelect = document.getElementById('swal-ward');
        
        // ✅ SỬA: Kiểm tra và lấy tên từ selectedIndex, fallback về tìm theo value
        let provinceName = '';
        let districtName = '';
        let wardName = '';
        
        if (provinceSelect.selectedIndex > 0) {
          provinceName = provinceSelect.options[provinceSelect.selectedIndex].text;
        } else {
          const province = provinces.find(p => p.ProvinceID == provinceId);
          provinceName = province?.ProvinceName || '';
        }
        
        if (districtSelect.selectedIndex > 0) {
          districtName = districtSelect.options[districtSelect.selectedIndex].text;
        } else {
          const district = districts.find(d => d.DistrictID == districtId);
          districtName = district?.DistrictName || '';
        }
        
        if (wardSelect.selectedIndex > 0) {
          wardName = wardSelect.options[wardSelect.selectedIndex].text;
        } else {
          const ward = wards.find(w => w.WardCode == wardCode);
          wardName = ward?.WardName || '';
        }
        
        // ✅ SỬA: Tạo địa chỉ với format đẹp, sử dụng tên từ DOM hoặc state
        const diaChiDayDu = `${diaChiChiTiet}, ${wardName}, ${districtName}, ${provinceName}`;
        
        // ✅ THÊM: Log để debug
        console.log('📍 Tạo địa chỉ:', {
          diaChiChiTiet,
          wardName,
          districtName,
          provinceName,
          diaChiDayDu
        });
        
        // ✅ THÊM: Lưu districtId và wardCode vào state để sử dụng sau
        setSelectedDistrict(districtId);
        setSelectedWard(wardCode);
        
        return [tenNguoiNhan, soDienThoai, email, diaChiDayDu, districtId, wardCode];
      }
    });

    if (formValues && formValues[0] && formValues[1] && formValues[3] && formValues[4] && formValues[5]) {
      // ✅ SỬA: Sử dụng districtId và wardCode từ form thay vì từ state
      const districtId = formValues[4]; // districtId từ form
      const wardCode = formValues[5];   // wardCode từ form
      
      // ✅ THÊM: Kiểm tra xem có thực sự thay đổi địa chỉ không
      const currentDiaChi = orderInfo?.diaChiGiaoHang ? parseDiaChiGiaoHang(orderInfo.diaChiGiaoHang) : {};
      const hasAddressChanged = currentDiaChi.districtId !== districtId || currentDiaChi.wardCode !== wardCode;
      
      // ✅ THÊM: Nếu không thay đổi địa chỉ, sử dụng phí ship hiện tại
      if (!hasAddressChanged) {
        phiShipMoiTinhDuoc = orderInfo?.phiVanChuyen || 0;
        console.log('📍 Không thay đổi địa chỉ, giữ nguyên phí ship:', phiShipMoiTinhDuoc);
        
        // ✅ THÊM: Cập nhật UI hiển thị phí ship mới
        const phiShipMoiElement = document.getElementById('phi-ship-moi');
        if (phiShipMoiElement) {
          phiShipMoiElement.textContent = `${phiShipMoiTinhDuoc.toLocaleString('vi-VN')} ₫`;
        }
        
        // ✅ THÊM: Hiển thị thông báo cho người dùng
        Swal.fire({
          icon: 'info',
          title: 'Thông báo',
          text: 'Bạn chỉ thay đổi thông tin cá nhân (tên, email, số điện thoại) mà không thay đổi địa chỉ giao hàng. Phí ship sẽ được giữ nguyên.',
          confirmButtonText: 'OK'
        });
      }
      
      console.log('📍 Gửi lên backend:', { 
        districtId, 
        wardCode, 
        phiShipMoiTinhDuoc, 
        hasAddressChanged,
        currentDiaChi: { districtId: currentDiaChi.districtId, wardCode: currentDiaChi.wardCode }
      });
      
      // Gọi hàm cập nhật địa chỉ với districtId và wardCode thực tế
      await handleCapNhatDiaChi(formValues[3], formValues[1], formValues[0], formValues[2], districtId, wardCode, phiShipMoiTinhDuoc);
    }
  };

  // 🔄 Cập nhật trạng thái đơn hàng
  const handleCapNhatTrangThai = async (trangThaiMoi) => {
    try {
      const params = new URLSearchParams({ value: trangThaiMoi });
      const res = await fetch(`http://localhost:8080/api/don-hang/${orderId}/trang-thai?${params}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái');
      const message = await res.text();
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        confirmButtonText: 'OK'
      });
      // Refresh thông tin đơn hàng
      const orderRes = await fetch(`http://localhost:8080/api/donhang/chi-tiet/${orderId}`);
      if (orderRes.ok) {
        const updatedOrder = await orderRes.json();
        setOrderInfo(updatedOrder);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Lỗi khi cập nhật trạng thái: ' + err.message,
        confirmButtonText: 'OK'
      });
    }
  };

  // ✅ THÊM: Hàm confirm trước khi cập nhật trạng thái
  const handleConfirmCapNhatTrangThai = async (trangThaiMoi, actionName) => {
    const result = await Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      text: `Bạn có chắc chắn muốn ${actionName} đơn hàng #${orderId} không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xác nhận!',
      cancelButtonText: 'Hủy bỏ'
    });

    if (result.isConfirmed) {
      await handleCapNhatTrangThai(trangThaiMoi);
    }
  };

  // ❌ Đánh dấu giao hàng không thành công
  const handleGiaoKhongThanhCong = async () => {
    // ✅ THÊM: Confirm trước khi xử lý giao hàng không thành công
    const confirmResult = await Swal.fire({
      title: 'Xác nhận giao hàng không thành công',
      text: `Bạn có chắc chắn muốn đánh dấu đơn hàng #${orderId} là giao hàng không thành công không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9c27b0',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xác nhận!',
      cancelButtonText: 'Hủy bỏ'
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    // ✅ THÊM: Form nhập lý do giao hàng không thành công
    const { value: formValues } = await Swal.fire({
      title: '🚫 Giao hàng không thành công',
      text: 'Đơn hàng này đang ở trạng thái "Đang giao". Vui lòng chọn lý do giao hàng không thành công:',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason1" name="reason" value="Khách không có nhà" style="margin-right: 8px;">
            <label for="reason1">Khách không có nhà</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason2" name="reason" value="Khách từ chối nhận hàng" style="margin-right: 8px;">
            <label for="reason2">Khách từ chối nhận hàng</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason3" name="reason" value="Địa chỉ không chính xác" style="margin-right: 8px;">
            <label for="reason3">Địa chỉ không chính xác</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason4" name="reason" value="Lý do khác" style="margin-right: 8px;">
            <label for="reason4">Lý do khác</label>
          </div>
          <div id="customReasonDiv" style="display: none; margin-top: 10px;">
            <textarea id="customReason" placeholder="Nhập lý do khác..." style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#9c27b0',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
      focusConfirm: false,
      preConfirm: () => {
        const selectedReason = document.querySelector('input[name="reason"]:checked');
        if (!selectedReason) {
          Swal.showValidationMessage('Vui lòng chọn lý do giao hàng không thành công!');
          return false;
        }
        
        let finalReason = selectedReason.value;
        if (finalReason === 'Lý do khác') {
          const customReason = document.getElementById('customReason').value.trim();
          if (!customReason) {
            Swal.showValidationMessage('Vui lòng nhập lý do khác!');
            return false;
          }
          finalReason = customReason;
        }
        
        return finalReason;
      },
      didOpen: () => {
        // Xử lý hiện/ẩn ô nhập lý do khác
        const reasonInputs = document.querySelectorAll('input[name="reason"]');
        const customReasonDiv = document.getElementById('customReasonDiv');
        
        reasonInputs.forEach(input => {
          input.addEventListener('change', () => {
            if (input.value === 'Lý do khác') {
              customReasonDiv.style.display = 'block';
            } else {
              customReasonDiv.style.display = 'none';
            }
          });
        });
      }
    });

    if (formValues) {
      try {
        // ✅ THÊM: Hiển thị loading khi đang xử lý
        Swal.fire({
          title: 'Đang xử lý...',
          text: 'Vui lòng chờ trong giây lát',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // ✅ SỬA: Sử dụng API giao hàng không thành công với lý do
        const res = await fetch(`http://localhost:8080/api/donhang/giao-khong-thanh-cong/${orderId}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ghiChu: formValues })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Lỗi khi đánh dấu giao hàng không thành công: ${res.status} - ${errorText}`);
        }
        
        const updatedOrder = await res.json();
        setOrderInfo(updatedOrder);
        
        // ✅ THÊM: Hiển thị thông báo thành công với thông tin chi tiết
        Swal.fire({
          icon: 'success',
          title: '✅ Thành công!',
          html: `
            <div style="text-align: left;">
              <p style="color: #27ae60; font-weight: 600; margin-bottom: 16px;">
                Đơn hàng #${orderId} đã được đánh dấu là "Giao hàng không thành công"!
              </p>
              <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #155724;">📋 Thông tin cập nhật:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #155724;">
                  <li>Trạng thái: <strong>Giao hàng không thành công</strong></li>
                  <li>Lý do: <strong>${formValues}</strong></li>
                  <li>Ngày cập nhật: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></li>
                  <li>Tồn kho đã được hoàn lại tự động</li>
                  <li>Voucher đã được hoàn lại (nếu có)</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'Tuyệt vời!',
          confirmButtonColor: '#27ae60'
        });
        
        // ✅ THÊM: Refresh lại dữ liệu để cập nhật UI
        await refreshOrderData();
        
      } catch (err) {
        console.error('Lỗi khi đánh dấu giao hàng không thành công:', err);
        
        // ✅ THÊM: Xử lý lỗi chi tiết
        Swal.fire({
          icon: 'error',
          title: '❌ Lỗi!',
          html: `
            <div style="text-align: left;">
              <p style="color: #e74c3c; font-weight: 600; margin-bottom: 16px;">
                Không thể đánh dấu giao hàng không thành công!
              </p>
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #721c24;">🔍 Chi tiết lỗi:</h4>
                <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 12px; color: #495057; overflow-x: auto; white-space: pre-wrap;">${err.message}</pre>
              </div>
              <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #c53030;">🔧 Khắc phục:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #c53030;">
                  <li>Kiểm tra trạng thái đơn hàng có phải "Đang giao" không</li>
                  <li>Thử lại sau vài giây</li>
                  <li>Liên hệ quản trị viên nếu vấn đề vẫn tiếp tục</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'OK',
          width: '600px'
        });
      }
    }
  };

  // Stepper trạng thái (chỉ hiện các bước đã đi qua)
  const renderOrderStatusStepper = (currentStatus) => {
    // Tạo mảng các bước thực tế mà đơn hàng đã trải qua
    let actualSteps = [];
    
    // Luôn có bước đầu tiên (chờ xác nhận)
    actualSteps.push(TRANG_THAI[0]);
    
    // Nếu đơn hàng đã được xác nhận (trạng thái >= 1)
    if (currentStatus >= 1) {
      actualSteps.push(TRANG_THAI[1]);
    }
    
    // Nếu đơn hàng đang chuẩn bị (trạng thái >= 2)
    if (currentStatus >= 2) {
      actualSteps.push(TRANG_THAI[2]);
    }
    
    // Nếu đơn hàng đang giao (trạng thái >= 3)
    if (currentStatus >= 3) {
      actualSteps.push(TRANG_THAI[3]);
    }
    
    // Nếu đơn hàng hoàn thành (trạng thái >= 4)
    if (currentStatus >= 4) {
      actualSteps.push(TRANG_THAI[4]);
    }
    
    // Xử lý trường hợp đặc biệt: Nếu đơn hàng bị hủy (trạng thái = 5)
    // Sử dụng dữ liệu trangThaiTruocKhiHuy từ backend để hiển thị chính xác
    if (currentStatus === 5) {
      // ✅ SỬ DỤNG DỮ LIỆU CHÍNH XÁC TỪ BACKEND
      if (orderInfo && orderInfo.trangThaiTruocKhiHuy !== null && orderInfo.trangThaiTruocKhiHuy !== undefined) {
        // Có dữ liệu chính xác từ backend
        let stepsBeforeCancel = [];
        
        // Luôn có bước đầu tiên (chờ xác nhận)
        stepsBeforeCancel.push(TRANG_THAI[0]);
        
        // Thêm các bước đã đi qua dựa trên trạng thái thực tế từ backend
        if (orderInfo.trangThaiTruocKhiHuy >= 1) {
          stepsBeforeCancel.push(TRANG_THAI[1]); // Đã xác nhận
        }
        if (orderInfo.trangThaiTruocKhiHuy >= 2) {
          stepsBeforeCancel.push(TRANG_THAI[2]); // Đang chuẩn bị
        }
        if (orderInfo.trangThaiTruocKhiHuy >= 3) {
          stepsBeforeCancel.push(TRANG_THAI[3]); // Đang giao
        }
        
        // Thêm bước hủy vào cuối
        actualSteps = [...stepsBeforeCancel, TRANG_THAI.find(t => t.value === 5)];
        
        console.log('🎯 Đơn hàng bị hủy - Sử dụng dữ liệu từ backend:');
        console.log('📍 Trạng thái trước khi hủy:', orderInfo.trangThaiTruocKhiHuy);
        console.log('📍 Các bước hiển thị:', actualSteps.map(s => s.label));
      } else {
        // Fallback: sử dụng logic cũ nếu không có dữ liệu từ backend
        actualSteps = [TRANG_THAI[0], TRANG_THAI.find(t => t.value === 5)];
        console.log('⚠️ Không có dữ liệu trangThaiTruocKhiHuy, sử dụng logic cũ');
      }
    }
    
    // ✅ THÊM: Xử lý trường hợp giao hàng không thành công (trạng thái = 7)
    if (currentStatus === 7) {
      // Sử dụng dữ liệu trangThaiTruocKhiHuy từ backend để hiển thị chính xác
      if (orderInfo && orderInfo.trangThaiTruocKhiHuy !== null && orderInfo.trangThaiTruocKhiHuy !== undefined) {
        // Có dữ liệu chính xác từ backend
        let stepsBeforeFailed = [];
        
        // Luôn có bước đầu tiên (chờ xác nhận)
        stepsBeforeFailed.push(TRANG_THAI[0]);
        
        // Thêm các bước đã đi qua dựa trên trạng thái thực tế từ backend
        if (orderInfo.trangThaiTruocKhiHuy >= 1) {
          stepsBeforeFailed.push(TRANG_THAI[1]); // Đã xác nhận
        }
        if (orderInfo.trangThaiTruocKhiHuy >= 2) {
          stepsBeforeFailed.push(TRANG_THAI[2]); // Đang chuẩn bị
        }
        if (orderInfo.trangThaiTruocKhiHuy >= 3) {
          stepsBeforeFailed.push(TRANG_THAI[3]); // Đang giao
        }
        
        // Thêm bước giao hàng không thành công vào cuối
        actualSteps = [...stepsBeforeFailed, TRANG_THAI.find(t => t.value === 7)];
        
        console.log('🎯 Đơn hàng giao hàng không thành công - Sử dụng dữ liệu từ backend:');
        console.log('📍 Trạng thái trước khi giao hàng không thành công:', orderInfo.trangThaiTruocKhiHuy);
        console.log('📍 Các bước hiển thị:', actualSteps.map(s => s.label));
      } else {
        // Fallback: sử dụng logic cũ nếu không có dữ liệu từ backend
        // ✅ SỬA: Hiển thị đầy đủ quy trình đã đi qua
        actualSteps = [
          TRANG_THAI[0], 
          TRANG_THAI[1], 
          TRANG_THAI[2], 
          TRANG_THAI[3], 
          TRANG_THAI.find(t => t.value === 7)
        ]; 
        // Chờ xác nhận -> Đã xác nhận -> Đang chuẩn bị -> Đang giao -> Giao hàng không thành công
        console.log('⚠️ Không có dữ liệu trangThaiTruocKhiHuy, sử dụng logic cũ');
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
        {actualSteps.filter(Boolean).map((tt, idx) => (
          <React.Fragment key={tt.value}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 110
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: tt.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 4,
                border: `2px solid ${tt.color}`,
                transition: 'all 0.2s'
              }}>
                {idx + 1}
              </div>
              <span style={{
                color: tt.color,
                fontWeight: 700,
                fontSize: 14,
                textAlign: 'center'
              }}>{tt.label}</span>
            </div>
            {idx < actualSteps.length - 1 && (
              <div style={{
                flex: 1,
                height: 4,
                background: tt.color,
                margin: '0 4px',
                borderRadius: 2,
                transition: 'all 0.2s'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ✅ SỬA: Tính tổng kết đơn hàng chính xác (giống OrderDetail)
  const tongTienHang = orderProducts.reduce((sum, sp) => {
    // ✅ SỬA: Sử dụng giá từ DonHangChiTiet (gia) nếu có, nếu không thì dùng giá gốc
    const finalPrice = sp.gia || sp.giaBan;
    return sum + (finalPrice * sp.soLuong);
  }, 0);

  const tongGiamGia = orderInfo && orderInfo.tongTienGiamGia ? orderInfo.tongTienGiamGia : 0;
  const tienShip = orderInfo && orderInfo.phiVanChuyen ? orderInfo.phiVanChuyen : 0;
  
  // ✅ DEBUG: Log giá trị tienShip
  console.log('🔍 === DEBUG TIENSHIP ===');
  console.log('📊 orderInfo:', orderInfo);
  console.log('📊 orderInfo.phiVanChuyen:', orderInfo?.phiVanChuyen);
  console.log('📊 tienShip:', tienShip);
  console.log('🔍 === END DEBUG ===');

  // ✅ THÊM: Tính tổng tiền bao gồm phí ship (giống OrderDetail)
  const tongTienHangTinh = orderProducts.reduce((sum, sp) => sum + (sp.thanhTien || 0), 0);
  let tongTien = tongTienHang + tienShip - tongGiamGia;

  // ✅ Nếu backend đã có tongTien và khác với tính toán, sử dụng backend
  if (orderInfo && orderInfo.tongTien && Math.abs(orderInfo.tongTien - tongTien) > 1000) {
    console.log('⚠️ Phát hiện chênh lệch giữa frontend và backend:', {
      frontend: tongTien,
      backend: orderInfo.tongTien,
      difference: orderInfo.tongTien - tongTien
    });
    tongTien = orderInfo.tongTien;
  }

  // ✅ DEBUG: Log để kiểm tra tính toán
  console.log('🔍 === DEBUG TÍNH TOÁN TỔNG TIỀN ===');
  console.log('📊 orderInfo.tongTien:', orderInfo?.tongTien);
  console.log('📊 orderInfo.phiVanChuyen:', orderInfo?.phiVanChuyen);
  console.log('📊 orderInfo.tongTienGiamGia:', orderInfo?.tongTienGiamGia);
  console.log('📊 tongTienHang:', tongTienHang);
  console.log('📊 tongTienHangTinh:', tongTienHangTinh);
  console.log('📊 tienShip:', tienShip);
  console.log('📊 tongGiamGia:', tongGiamGia);
  console.log('📊 tongTien cuối cùng:', tongTien);
  console.log('🔍 === END DEBUG ===');

  // 🔄 Refresh lại dữ liệu đơn hàng
  const refreshOrderData = async () => {
    try {
      // Refresh thông tin đơn hàng
      const orderRes = await fetch(`http://localhost:8080/api/donhang/chi-tiet/${orderId}`);
      if (orderRes.ok) {
        const updatedOrder = await orderRes.json();
        setOrderInfo(updatedOrder);
      }
      
      // Refresh danh sách sản phẩm
      const orderDetails = await fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`).then(res => res.json());
      const productDetailPromises = orderDetails.map(item =>
        fetch(`http://localhost:8080/api/san-pham-chi-tiet/spct/${item.idSanPhamChiTiet}`).then(res => res.json())
      );
      const productDetails = await Promise.all(productDetailPromises);
              const joined = orderDetails.map((item, idx) => {
          const prod = productDetails[idx];
          return {
            ...item,
            tenSanPham: prod?.tenSanPham || '---',
            anh: prod?.images || '',
            mauSac: prod?.mauSac || '---',
            kichThuoc: prod?.kichThuoc || '---',
            // ✅ SỬA: Sử dụng giá từ DonHangChiTiet thay vì từ sản phẩm
            giaBan: prod?.giaBan,  // Giá gốc từ sản phẩm (để so sánh)
            giaBanGiamGia: item.giaBanGiamGia || item.gia,  // Giá khuyến mãi từ DonHangChiTiet
            gia: item.gia  // Giá thực tế đã lưu trong đơn hàng
          };
        });
      setOrderProducts(joined);
    } catch (err) {
      console.error('Lỗi khi refresh dữ liệu:', err);
    }
  };

  // ➕ Thêm sản phẩm vào đơn hàng
  const handleAddProduct = useCallback(async () => {
    // Kiểm tra trạng thái đơn hàng
    if (orderInfo && orderInfo.trangThai !== 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể thêm sản phẩm!',
        text: 'Chỉ có thể thêm sản phẩm khi đơn hàng ở trạng thái "Chờ xác nhận"!',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!selectedProduct || addProductQty < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Lỗi!',
        text: 'Vui lòng chọn sản phẩm và số lượng hợp lệ!',
        confirmButtonText: 'OK'
      });
      return;
    }

    setAddProductLoading(true);
    try {
      const body = {
        idDonHang: orderId,
        idSanPhamChiTiet: selectedProduct.id,
        soLuong: addProductQty,
        gia: selectedProduct.giaBanGiamGia || selectedProduct.giaBan,
        thanhTien: (selectedProduct.giaBanGiamGia || selectedProduct.giaBan) * addProductQty,
      };
      
      const res = await fetch('http://localhost:8080/api/donhangchitiet/them-sp-vao-don-hang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error('Lỗi khi thêm sản phẩm vào đơn hàng');
      
      setShowAddProductModal(false);
      setSelectedProduct(null);
      setAddProductQty(1);
      await refreshOrderData();
      
      // Refresh lại danh sách sản phẩm có thể thêm để cập nhật tồn kho
      await fetchAvailableProducts();
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm sản phẩm vào đơn hàng!',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Số lượng tồn kho không đủ để thêm!',
        confirmButtonText: 'OK'
      });
    } finally {
      setAddProductLoading(false);
    }
  }, [orderInfo, selectedProduct, addProductQty, orderId, refreshOrderData]);

  // ✏️ Cập nhật số lượng sản phẩm (tự động gọi API khi thay đổi)
  const handleUpdateQuantity = async (productId, newQty) => {
    // Kiểm tra trạng thái đơn hàng
    if (orderInfo && orderInfo.trangThai !== 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể sửa số lượng!',
        text: 'Chỉ có thể sửa số lượng khi đơn hàng ở trạng thái "Chờ xác nhận"!',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (newQty < 1) return;
    
    const product = orderProducts.find(p => p.id === productId);
    if (!product) return;
    
    setUpdateQtyLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      // ✅ SỬA: Logic tính giá khuyến mãi chính xác hơn
      let giaBanCuoi = product.giaBan; // Giá mặc định
      
      // Kiểm tra nếu có giá khuyến mãi và giá khuyến mãi > 0
      if (product.giaBanGiamGia && product.giaBanGiamGia > 0) {
        // Nếu giá khuyến mãi < giá gốc thì dùng giá khuyến mãi
        if (product.giaBanGiamGia < product.giaBan) {
          giaBanCuoi = product.giaBanGiamGia;
        }
      }
      
      const thanhTien = giaBanCuoi * newQty;
      
      console.log('🔍 === DEBUG UPDATE QUANTITY ===');
      console.log('📊 Product:', {
        id: product.id,
        ten: product.ten,
        giaBan: product.giaBan,
        giaBanGiamGia: product.giaBanGiamGia,
        giaBanCuoi: giaBanCuoi,
        soLuong: newQty,
        thanhTien: thanhTien
      });
      console.log('🔍 === END DEBUG ===');
      
              // ✅ SỬA: Gửi đầy đủ thông tin giá để backend cập nhật đúng
        const res = await fetch(`http://localhost:8080/api/donhangchitiet/updateOnline/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            soLuong: newQty,
            thanhTien: thanhTien,
            gia: giaBanCuoi,                    // ✅ THÊM: Giá cuối cùng (có thể là giá khuyến mãi)
            giaBanGiamGia: product.giaBanGiamGia, // ✅ THÊM: Giá khuyến mãi gốc
            giaBan: product.giaBan,             // ✅ THÊM: Giá gốc
          }),
        });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Lỗi khi cập nhật số lượng!');
      }
      
      // ✅ SỬA: Cập nhật UI ngay lập tức với đầy đủ thông tin
      setOrderProducts(prev => prev.map(p => 
        p.id === productId 
          ? { 
              ...p, 
              soLuong: newQty, 
              thanhTien: thanhTien,
              // ✅ THÊM: Đảm bảo giữ nguyên giá khuyến mãi và giá gốc
              giaBanGiamGia: product.giaBanGiamGia, // Sử dụng từ product gốc
              giaBan: product.giaBan,               // Sử dụng từ product gốc
              gia: giaBanCuoi                       // Cập nhật giá cuối cùng
            }
          : p
      ));
      
      // ✅ THÊM: Log để debug sau khi cập nhật UI
      console.log('🔍 === DEBUG SAU KHI UPDATE UI ===');
      console.log('📊 Product sau khi update:', {
        id: productId,
        soLuong: newQty,
        thanhTien: thanhTien,
        giaBanGiamGia: product.giaBanGiamGia,
        giaBan: product.giaBan
      });
      console.log('🔍 === END DEBUG ===');
      
      // Refresh lại dữ liệu để đảm bảo đồng bộ
      await refreshOrderData();
      
      // Refresh lại danh sách sản phẩm có thể thêm để cập nhật tồn kho
      await fetchAvailableProducts();
      
    } catch (err) {
      console.error('Số lượng tồn kho không đủ:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Số lượng tồn kho không đủ ' ,
        confirmButtonText: 'OK'
      });
    } finally {
      setUpdateQtyLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ❌ Xóa sản phẩm khỏi đơn hàng
  const handleDeleteProduct = async (productId) => {
    // Kiểm tra trạng thái đơn hàng
    if (orderInfo && orderInfo.trangThai !== 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể xóa sản phẩm!',
        text: 'Chỉ có thể xóa sản phẩm khi đơn hàng ở trạng thái "Chờ xác nhận"!',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Xác nhận xóa sản phẩm',
      text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy bỏ'
    });

    if (result.isConfirmed) {
      setDeleteProductLoading(prev => ({ ...prev, [productId]: true }));
      
      try {
        const res = await fetch(`http://localhost:8080/api/donhangchitiet/deleteOnline/${productId}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) throw new Error('Lỗi khi xóa sản phẩm khỏi đơn hàng');
        
        await refreshOrderData();
        
        // Refresh lại danh sách sản phẩm có thể thêm để cập nhật tồn kho
        await fetchAvailableProducts();
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã xóa sản phẩm khỏi đơn hàng!',
          confirmButtonText: 'OK'
        });
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Lỗi khi xóa sản phẩm: ' + err.message,
          confirmButtonText: 'OK'
      });
      } finally {
        setDeleteProductLoading(prev => ({ ...prev, [productId]: false }));
      }
    }
  };

  if (loading) return <div style={{padding: 32}}>Đang tải...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>{error} <button onClick={() => navigate(-1)}>Quay lại</button></div>;

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#e3f0ff', color: '#1976d2', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>← Quay lại</button>
      {/* Stepper trạng thái trong div riêng */}
      {orderInfo && (
        <div style={{
          border: '1px solid #e3e8ee',
          borderRadius: 12,
          padding: '20px 16px',
          marginBottom: 32,
          background: '#f8fafc',
          boxShadow: '0 1px 4px rgba(25,118,210,0.04)'
        }}>
          <div style={{ fontWeight: 700, color: '#1976d2', marginBottom: 12, fontSize: 16 }}>Trạng thái đơn hàng</div>
          {renderOrderStatusStepper(orderInfo.trangThai)}
          <div style={{ marginTop: 16 }}>
            {/* Nút chức năng theo trạng thái */}
            {orderInfo.trangThai === 0 && (
              <>
                <button
                  style={{ padding: '8px 20px', background: '#43b244', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={handleXacNhan}
                >✅ Xác nhận đơn</button>
                <button
                  style={{ padding: '8px 20px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={handleHuy}
                >❌ Hủy đơn</button>
                <button
                  style={{ padding: '8px 20px', background: '#607d8b', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleOpenEditAddressForm}
                >
                  ✏️ Sửa địa chỉ
                </button>
              </>
            )}
            
            {orderInfo.trangThai === 1 && (
              <>
                <button
                  style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={() => handleConfirmCapNhatTrangThai(2, 'chuẩn bị hàng')}
                >📦 Chuẩn bị hàng</button>
                <button
                  style={{ padding: '8px 20px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={handleHuy}
                >❌ Hủy đơn</button>
              </>
            )}
            
            {orderInfo.trangThai === 2 && (
              <>
                <button
                  style={{ padding: '8px 20px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={() => handleConfirmCapNhatTrangThai(3, 'giao hàng')}
                >🚚 Giao hàng</button>
                <button
                  style={{ padding: '8px 20px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={handleHuy}
                >❌ Hủy đơn</button>
              </>
            )}
            
            {orderInfo.trangThai === 3 && (
              <>
                <button
                  style={{ padding: '8px 20px', background: '#009688', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12, cursor: 'pointer' }}
                  onClick={() => handleConfirmCapNhatTrangThai(4, 'hoàn thành')}
                >✅ Hoàn thành</button>
                <button
                  style={{ padding: '8px 20px', background: '#9c27b0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleGiaoKhongThanhCong}
                >⚠️ Giao không thành công</button>
              </>
            )}
            
            {/* {orderInfo.trangThai === 4 && (
              <button
                style={{ padding: '8px 20px', background: '#9c27b0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleCapNhatTrangThai(6)}
              >🔄 Trả hàng/Hoàn tiền</button>
            )} */}
          </div>
        </div>
      )}
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24 }}>Chi tiết đơn hàng #{orderId}</h2>
      
      {/* Thông tin khách hàng và địa chỉ giao hàng */}
      {orderInfo && (
        <div style={{
          background: '#f8fafc',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: '1px solid #e3e8ee'
        }}>
          <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>📋 Thông tin giao hàng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <strong>👤 Người nhận:</strong> {orderInfo.tenNguoiNhan || 'Chưa có thông tin'}
            </div>
            <div>
              <strong>📞 Số điện thoại:</strong> {orderInfo.soDienThoaiGiaoHang || 'Chưa có thông tin'}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>📍 Địa chỉ:</strong> {orderInfo.diaChiGiaoHang || 'Chưa có thông tin'}
            </div>
            <div>
              <strong>📧 Email:</strong> {orderInfo.emailGiaoHang || 'Chưa có thông tin'}
            </div>
            <div>
              <strong>📅 Ngày tạo:</strong> {orderInfo.ngayTao || 'Chưa có thông tin'}
            </div>
            {orderInfo.ngayMua && (
              <div>
                <strong>💰 Ngày thanh toán:</strong> {orderInfo.ngayMua}
              </div>
            )}
          </div>
        </div>
      )}
      
      <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>🛍️ Chi tiết sản phẩm</h3>
      {/* Danh sách sản phẩm dạng card/table đẹp */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        {orderProducts.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có sản phẩm nào trong đơn hàng này.</div>
        ) : (
          orderProducts.map((sp, idx) => (
            <div key={sp.id} style={{ display: 'flex', alignItems: 'center', borderBottom: idx < orderProducts.length - 1 ? '1px solid #e3e8ee' : 'none', padding: '18px 0' }}>
              <div style={{ width: 80, height: 80, marginRight: 24 }}>
                {sp.anh
                  ? (
                    <img
                      src={sp.anh.includes(',')
                        ? `http://localhost:8080/api/images/${encodeURIComponent(sp.anh.split(',')[0].trim())}`
                        : `http://localhost:8080/api/images/${encodeURIComponent(sp.anh.trim())}`}
                      alt={sp.tenSanPham}
                      style={{ width: 100, height: 90, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  )
                  : '--'}
                {sp.anh && <div style={{ display: 'none', width: 100, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>Không có ảnh</div>}
              </div>
              <div style={{ flex: 2, fontWeight: 600, fontSize: 16 }}>{sp.tenSanPham}</div>
              <div style={{ flex: 1, color: '#555', fontSize: 15 }}>{sp.mauSac}</div>
              <div style={{ flex: 1, color: '#555', fontSize: 15 }}>{sp.kichThuoc}</div>
              <div style={{ flex: 1, color: '#1976d2', fontWeight: 700, fontSize: 16 }}>
                {/* ✅ SỬA: Hiển thị giá gốc và giá khuyến mãi nếu có */}
                {sp.gia && sp.giaBanGiamGia && sp.giaBanGiamGia > 0 && sp.giaBanGiamGia < sp.giaBan ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                      {sp.giaBan?.toLocaleString('vi-VN')} ₫
                    </span>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '16px' }}>
                      {sp.gia?.toLocaleString('vi-VN')} ₫
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 16 }}>
                    {(sp.gia || sp.giaBan)?.toLocaleString('vi-VN')} ₫
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  min={1}
                  value={sp.soLuong}
                  onChange={e => handleUpdateQuantity(sp.id, Number(e.target.value))}
                  disabled={updateQtyLoading[sp.id] || (orderInfo && orderInfo.trangThai !== 0)}
                  style={{ 
                    width: 48, 
                    padding: '6px 8px', 
                    borderRadius: 6, 
                    border: '1px solid #e3e8ee', 
                    fontSize: 15, 
                    textAlign: 'center',
                    opacity: (updateQtyLoading[sp.id] || (orderInfo && orderInfo.trangThai !== 0)) ? 0.6 : 1
                  }}
                />
                {updateQtyLoading[sp.id] && (
                  <div style={{ fontSize: 12, color: '#1976d2', marginTop: 4 }}>Đang cập nhật...</div>
                )}
              </div>
              <div style={{ flex: 1, fontWeight: 700, color: '#009688', fontSize: 16 }}>{sp.thanhTien?.toLocaleString('vi-VN')} ₫</div>
              <div style={{ flex: '0 0 auto', marginLeft: 16 }}>
                <button
                  style={{ 
                    background: (deleteProductLoading[sp.id] || (orderInfo && orderInfo.trangThai !== 0)) ? '#ccc' : '#e53935', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '8px 18px', 
                    fontWeight: 600, 
                    cursor: (deleteProductLoading[sp.id] || (orderInfo && orderInfo.trangThai !== 0)) ? 'not-allowed' : 'pointer' 
                  }}
                  onClick={() => handleDeleteProduct(sp.id)}
                  disabled={deleteProductLoading[sp.id] || (orderInfo && orderInfo.trangThai !== 0)}
                >
                  {deleteProductLoading[sp.id] ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))
        )}
        {/* Nút thêm sản phẩm */}
        <div style={{ textAlign: 'left', marginTop: 24 }}>
          <button 
            style={{ 
              background: (orderInfo && orderInfo.trangThai !== 0) ? '#ccc' : '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '10px 28px', 
              fontWeight: 600, 
              fontSize: 16, 
              cursor: (orderInfo && orderInfo.trangThai !== 0) ? 'not-allowed' : 'pointer' 
            }}
            onClick={handleOpenAddProductModal}
            disabled={orderInfo && orderInfo.trangThai !== 0}
          >
            ➕ Thêm sản phẩm
          </button>
        </div>
      </div>
      {/* Tổng kết đơn hàng */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(25,118,210,0.04)', fontSize: 16, fontWeight: 500, maxWidth: 400, marginLeft: 'auto' }}>
        <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>💰 Tổng kết đơn hàng</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Tiền hàng:</span>
          <span>{tongTienHang.toLocaleString()}đ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Phí vận chuyển:</span>
          <span>{tienShip.toLocaleString()}đ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#e53935' }}>
          <span>Giảm giá:</span>
          <span>-{tongGiamGia.toLocaleString()}đ</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #e3e8ee', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1976d2', fontSize: 18, marginTop: 8 }}>
          <span>Tổng cộng:</span>
          <span>{tongTien.toLocaleString()}đ</span>
        </div>
        
        
        {/* Thông tin bổ sung */}
        {orderInfo && (
          <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 14 }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Loại đơn:</strong> {orderInfo.loaiDonHang || 'Online'}
            </div>
            {orderInfo.idgiamGia && (
              <div style={{ marginBottom: 4 }}>
                <strong>Mã giảm giá:</strong> {voucherInfo ? voucherInfo.tenVoucher : `#${orderInfo.idgiamGia}`}
              </div>
            )}
            <div>
              <strong>Trạng thái:</strong> 
              <span style={{
                background: TRANG_THAI.find(t => t.value === orderInfo.trangThai)?.color || '#999',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 4,
                marginLeft: 8,
                fontSize: 12
              }}>
                {TRANG_THAI.find(t => t.value === orderInfo.trangThai)?.label || 'Không xác định'}
              </span>
            </div>
            
            {/* ✅ THÊM: Hiển thị lý do cho trạng thái 5 và 7 */}
            {(orderInfo.trangThai === 5 || orderInfo.trangThai === 7) && orderInfo.ghiChu && (
              <div style={{ marginTop: 8 }}>
                <strong style={{ color: '#000' }}>
                  {orderInfo.trangThai === 5 ? 'Lý do hủy đơn:' : 'Lý do giao hàng không thành công:'}
                </strong>
                <span style={{
                  color: '#e53935',
                  fontWeight: 600,
                  fontSize: 14,
                  marginLeft: 8
                }}>
                  {orderInfo.ghiChu}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal thêm sản phẩm */}
      {showAddProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 1200,
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#1976d2', fontWeight: 700, margin: 0 }}>➕ Thêm sản phẩm vào đơn hàng</h3>
              <button
                onClick={handleCloseAddProductModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Bộ lọc màu sắc và size */}
            <Box display="flex" gap={2} mb={2}>
              <TextField 
                select 
                label="Màu sắc" 
                value={filterColor} 
                onChange={e => setFilterColor(e.target.value)} 
                size="small" 
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {colorOptions.map(color => <MenuItem key={color} value={color}>{color}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                label="Size" 
                value={filterSize} 
                onChange={e => setFilterSize(e.target.value)} 
                size="small" 
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {sizeOptions.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
              </TextField>
            </Box>
            
            {/* Thanh tìm kiếm sản phẩm */}
            <div style={{ marginBottom: 16 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            {/* Bảng danh sách sản phẩm */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 8, 
                padding: 16, 
                marginBottom: 16,
                border: '1px solid #e3e8ee'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Danh sách sản phẩm có thể thêm:</h4>
                                <div style={{ overflow: 'auto', maxHeight: '400px', minHeight: '200px' }}>
                  {productsTable}
                </div>
              </div>
            </div>
            
            {/* Nút hành động */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseAddProductModal}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn số lượng khi thêm sản phẩm */}
      {showQtyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#1976d2', fontWeight: 700, margin: 0 }}>
                Chọn số lượng cho <span style={{ color: '#1976d2' }}>{selectedProduct?.tenSanPham}</span>
              </h3>
              <button
                onClick={() => setShowQtyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <TextField
                type="number"
                label="Số lượng"
                variant="outlined"
                fullWidth
                value={Number(addProductQty)}
                onChange={e => setAddProductQty(Number(e.target.value))}
                inputProps={{ min: 1, max: selectedProduct?.soLuong }}
                sx={{
                  '& .MuiInputBase-input': {
                    margin: '10px',      
                  },
                }}
                disabled={!orderId}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowQtyModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleAddProduct();
                  setShowQtyModal(false);
                }}
                disabled={addProductQty < 1 || addProductQty > selectedProduct?.soLuong || addProductLoading}
                style={{
                  padding: '10px 20px',
                  background: addProductLoading ? '#ccc' : '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: addProductLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {addProductLoading ? 'Đang thêm...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 