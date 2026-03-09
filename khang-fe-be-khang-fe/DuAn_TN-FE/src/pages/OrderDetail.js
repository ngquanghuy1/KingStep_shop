import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const TRANG_THAI = [
  { value: 0, label: 'Chờ xác nhận', color: '#ff9800' },
  { value: 1, label: 'Đã xác nhận', color: '#43b244' },
  { value: 2, label: 'Đang chuẩn bị', color: '#1976d2' },
  { value: 3, label: 'Đang giao', color: '#1976d2' },
  { value: 4, label: 'Hoàn thành', color: '#009688' },
  { value: 5, label: 'Đã hủy', color: '#e53935' },
  { value: 7, label: 'Giao hàng không thành công', color: '#9c27b0' }
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState([]);
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch thông tin đơn hàng
      const orderResponse = await axios.get(`http://localhost:8080/api/donhang/chi-tiet/${id}`);
      setOrder(orderResponse.data);

      // Fetch thông tin voucher nếu có
      if (orderResponse.data.idgiamGia) {
        try {
          const voucherResponse = await axios.get(`http://localhost:8080/api/voucher/${orderResponse.data.idgiamGia}`);
          setVoucherInfo(voucherResponse.data);
        } catch (voucherErr) {
          console.warn('Không thể fetch thông tin voucher:', voucherErr);
          setVoucherInfo(null);
        }
      }

      // Fetch chi tiết sản phẩm
      const productsResponse = await axios.get(`http://localhost:8080/api/donhangchitiet/don-hang/${id}`);
      const products = productsResponse.data;

      // Fetch thông tin chi tiết từng sản phẩm
      const productDetails = await Promise.all(
        products.map(async (item) => {
          try {
            const productResponse = await axios.get(`http://localhost:8080/api/san-pham-chi-tiet/spct/${item.idSanPhamChiTiet}`);
            return {
              ...item,
              tenSanPham: productResponse.data?.tenSanPham || '---',
              anh: productResponse.data?.images || '',
              mauSac: productResponse.data?.mauSac || '---',
              kichThuoc: productResponse.data?.kichThuoc || '---',
              // ✅ SỬA: Giống hệt OrderDetailPOSPage
              giaBan: productResponse.data?.giaBan,                // Giá gốc từ sản phẩm
              giaBanGiamGia: item.gia,                             // Giá đã lưu trong DonHangChiTiet
            };
          } catch (err) {
            console.error('Lỗi khi fetch chi tiết sản phẩm:', err);
            return {
              ...item,
              tenSanPham: '---',
              anh: '',
              mauSac: '---',
              kichThuoc: '---',
              // ✅ SỬA: Giống hệt OrderDetailPOSPage
              giaBan: 0,                    // Giá gốc từ sản phẩm
              giaBanGiamGia: item.gia,      // Giá đã lưu trong DonHangChiTiet
            };
          }
        })
      );

      setOrderProducts(productDetails);
    } catch (err) {
      console.error('Lỗi khi fetch chi tiết đơn hàng:', err);
      setError('Không thể tải chi tiết đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hủy đơn hàng (chỉ cho trạng thái 0)
  const handleHuyDon = async () => {
    if (!order || order.trangThai !== 0) {
      alert('Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận"!');
      return;
    }

    // Sử dụng SweetAlert2 để tạo form chọn lý do hủy đơn
    const { value: formValues } = await Swal.fire({
      title: '🚫 Hủy đơn hàng',
      text: 'Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng chọn lý do hủy đơn:',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason1" name="reason" value="Đổi ý, không muốn mua nữa" style="margin-right: 8px;">
            <label for="reason1">Đổi ý, không muốn mua nữa</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason2" name="reason" value="Đặt nhầm sản phẩm" style="margin-right: 8px;">
            <label for="reason2">Đặt nhầm sản phẩm</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason3" name="reason" value="Chọn nhầm địa chỉ nhận hàng" style="margin-right: 8px;">
            <label for="reason3">Chọn nhầm địa chỉ nhận hàng</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason4" name="reason" value="Muốn thay đổi phương thức thanh toán" style="margin-right: 8px;">
            <label for="reason4">Muốn thay đổi phương thức thanh toán</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason5" name="reason" value="Người bán liên hệ báo hết hàng" style="margin-right: 8px;">
            <label for="reason5">Người bán liên hệ báo hết hàng</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason6" name="reason" value="Người bán thay đổi thời gian giao hàng" style="margin-right: 8px;">
            <label for="reason6">Người bán thay đổi thời gian giao hàng</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason7" name="reason" value="Người bán không phản hồi" style="margin-right: 8px;">
            <label for="reason7">Người bán không phản hồi</label>
          </div>
          <div style="margin-bottom: 10px;">
            <input type="radio" id="reason8" name="reason" value="Lý do khác" style="margin-right: 8px;">
            <label for="reason8">Lý do khác</label>
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
        const response = await axios.put(`http://localhost:8080/api/donhang/huy/${id}`, {
          ghiChu: formValues
        });
        
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đã hủy đơn hàng thành công!',
            confirmButtonText: 'OK'
          });
          // Refresh lại thông tin đơn hàng
          fetchOrderDetails();
        }
      } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Có lỗi xảy ra khi hủy đơn hàng: ' + error.message,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Stepper trạng thái (chỉ hiện các bước thực tế mà đơn hàng đã trải qua)
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
      if (order && order.trangThaiTruocKhiHuy !== null && order.trangThaiTruocKhiHuy !== undefined) {
        // Có dữ liệu chính xác từ backend
        let stepsBeforeCancel = [];
        
        // Luôn có bước đầu tiên (chờ xác nhận)
        stepsBeforeCancel.push(TRANG_THAI[0]);
        
        // Thêm các bước đã đi qua dựa trên trạng thái thực tế từ backend
        if (order.trangThaiTruocKhiHuy >= 1) {
          stepsBeforeCancel.push(TRANG_THAI[1]); // Đã xác nhận
        }
        if (order.trangThaiTruocKhiHuy >= 2) {
          stepsBeforeCancel.push(TRANG_THAI[2]); // Đang chuẩn bị
        }
        if (order.trangThaiTruocKhiHuy >= 3) {
          stepsBeforeCancel.push(TRANG_THAI[3]); // Đang giao
        }
        
        // Thêm bước hủy vào cuối
        actualSteps = [...stepsBeforeCancel, TRANG_THAI[5]];
        
        console.log('🎯 Đơn hàng bị hủy - Sử dụng dữ liệu từ backend:');
        console.log('📍 Trạng thái trước khi hủy:', order.trangThaiTruocKhiHuy);
        console.log('📍 Các bước hiển thị:', actualSteps.map(s => s.label));
      } else {
        // Fallback: sử dụng logic cũ nếu không có dữ liệu từ backend
        actualSteps = [TRANG_THAI[0], TRANG_THAI[5]];
        console.log('⚠️ Không có dữ liệu trangThaiTruocKhiHuy, sử dụng logic cũ');
      }
    }
    
    // Xử lý trường hợp đặc biệt: Nếu đơn hàng giao hàng không thành công (trạng thái = 7)
    if (currentStatus === 7) {
      // Sử dụng dữ liệu trangThaiTruocKhiHuy từ backend để hiển thị chính xác
      if (order && order.trangThaiTruocKhiHuy !== null && order.trangThaiTruocKhiHuy !== undefined) {
        // Có dữ liệu chính xác từ backend
        let stepsBeforeFailed = [];
        
        // Luôn có bước đầu tiên (chờ xác nhận)
        stepsBeforeFailed.push(TRANG_THAI[0]);
        
        // Thêm các bước đã đi qua dựa trên trạng thái thực tế từ backend
        if (order.trangThaiTruocKhiHuy >= 1) {
          stepsBeforeFailed.push(TRANG_THAI[1]); // Đã xác nhận
        }
        if (order.trangThaiTruocKhiHuy >= 2) {
          stepsBeforeFailed.push(TRANG_THAI[2]); // Đang chuẩn bị
        }
        if (order.trangThaiTruocKhiHuy >= 3) {
          stepsBeforeFailed.push(TRANG_THAI[3]); // Đang giao
        }
        
        // Thêm bước giao hàng không thành công vào cuối
        actualSteps = [...stepsBeforeFailed, TRANG_THAI.find(t => t.value === 7)];
        
        console.log('🎯 Đơn hàng giao hàng không thành công - Sử dụng dữ liệu từ backend:');
        console.log('📍 Trạng thái trước khi giao hàng không thành công:', order.trangThaiTruocKhiHuy);
        console.log('📍 Các bước hiển thị:', actualSteps.map(s => s.label));
      } else {
        // Fallback: sử dụng logic cũ nếu không có dữ liệu từ backend
        // Hiển thị đầy đủ quy trình đã đi qua
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
        {actualSteps.map((tt, idx) => (
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

  // Tính tổng kết đơn hàng
  const tongTienHang = orderProducts.reduce((sum, sp) => {
    const finalPrice = sp.giaBanGiamGia && sp.giaBanGiamGia < sp.giaBan 
                      ? sp.giaBanGiamGia 
                      : sp.giaBan;
    return sum + (finalPrice * sp.soLuong);
  }, 0);
  
  const tongGiamGia = order && order.tongTienGiamGia ? order.tongTienGiamGia : 0;
  const tienShip = order && order.phiVanChuyen ? order.phiVanChuyen : 0;
  
  // ✅ SỬA: Tính tổng tiền đúng cách - bao gồm phí ship
  let tongTien = 0;
  
  // Luôn tính lại để đảm bảo chính xác
  const tongTienHangTinh = orderProducts.reduce((sum, sp) => sum + (sp.thanhTien || 0), 0);
  tongTien = tongTienHangTinh + tienShip - tongGiamGia;
  
  // Nếu backend đã có tongTien và khác với tính toán, sử dụng backend
  if (order && order.tongTien && Math.abs(order.tongTien - tongTien) > 1000) {
    console.log('⚠️ Phát hiện chênh lệch giữa frontend và backend:', {
      frontend: tongTien,
      backend: order.tongTien,
      difference: order.tongTien - tongTien
    });
    tongTien = order.tongTien;
  }
  
  // ✅ DEBUG: Log để kiểm tra tính toán
  console.log('🔍 === DEBUG TÍNH TOÁN TỔNG TIỀN ===');
  console.log('📊 order.tongTien:', order?.tongTien);
  console.log('📊 order.phiVanChuyen:', order?.phiVanChuyen);
  console.log('📊 order.tongTienGiamGia:', order?.tongTienGiamGia);
  console.log('📊 tongTienHang:', tongTienHang);
  console.log('📊 tienShip:', tienShip);
  console.log('📊 tongGiamGia:', tongGiamGia);
  console.log('📊 tongTien cuối cùng:', tongTien);
  console.log('🔍 === END DEBUG ===');

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#1976d2' }}>
      <div style={{ fontSize: 18 }}>Đang tải chi tiết đơn hàng...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#f5222d' }}>
      <div style={{ fontSize: 18 }}>❌ {error}</div>
      <button 
        onClick={() => navigate(-1)}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        Quay lại
      </button>
    </div>
  );

  if (!order) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>
      Không tìm thấy thông tin đơn hàng
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginBottom: 24, 
          background: '#e3f0ff', 
          color: '#1976d2', 
          border: 'none', 
          borderRadius: 6, 
          padding: '8px 24px', 
          fontWeight: 600, 
          cursor: 'pointer' 
        }}
      >
        ← Quay lại
      </button>

      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
        Chi tiết đơn hàng #{id}
      </h2>

      {/* Stepper trạng thái */}
      <div style={{
        border: '1px solid #e3e8ee',
        borderRadius: 12,
        padding: '20px 16px',
        marginBottom: 32,
        background: '#f8fafc',
        boxShadow: '0 1px 4px rgba(25,118,210,0.04)'
      }}>
        <div style={{ fontWeight: 700, color: '#1976d2', marginBottom: 12, fontSize: 16 }}>Trạng thái đơn hàng</div>
        {renderOrderStatusStepper(order.trangThai)}
        
        {/* Nút hủy đơn (chỉ hiển thị ở trạng thái 0) */}
        {order.trangThai === 0 && (
          <div style={{ marginTop: 16 }}>
            <button
              style={{
                padding: '8px 20px',
                background: '#e53935',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14
              }}
              onClick={handleHuyDon}
            >
              ❌ Hủy đơn hàng
            </button>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              💡 Bạn chỉ có thể hủy đơn hàng khi đơn hàng chưa được xác nhận
            </div>
          </div>
        )}
        
        {/* ✅ THÊM: Thông báo hướng dẫn khi đơn hàng đã được xác nhận */}
        {(order.trangThai === 1 || order.trangThai === 2 || order.trangThai === 3) && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            background: '#e8f5e8', 
            borderRadius: 8, 
            border: '1px solid #4caf50',
            fontSize: 13,
            color: '#2e7d32'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>📞</span>
              <strong>Hỗ trợ khách hàng</strong>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>
              Nếu đơn hàng đã được xác nhận mà bạn có vấn đề gì thì hãy liên hệ cửa hàng để được hỗ trợ
            </div>
          </div>
        )}
      </div>

      {/* Thông tin khách hàng và địa chỉ giao hàng */}
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
            <strong>👤 Người nhận:</strong> {order.tenNguoiNhan || 'Chưa có thông tin'}
          </div>
          <div>
            <strong>📞 Số điện thoại:</strong> {order.soDienThoaiGiaoHang || 'Chưa có thông tin'}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>📍 Địa chỉ:</strong> {order.diaChiGiaoHang || 'Chưa có thông tin'}
          </div>
          <div>
            <strong>📧 Email:</strong> {order.emailGiaoHang || 'Chưa có thông tin'}
          </div>
          <div>
            <strong>📅 Ngày tạo:</strong> {order.ngayTao || 'Chưa có thông tin'}
          </div>
          {order.ngayMua && (
            <div>
              <strong>💰 Ngày thanh toán:</strong> {order.ngayMua}
            </div>
          )}
        </div>
      </div>

      <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>🛍️ Chi tiết sản phẩm</h3>
      
      {/* Danh sách sản phẩm */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        {orderProducts.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>
            Không có sản phẩm nào trong đơn hàng này.
          </div>
        ) : (
          orderProducts.map((sp, idx) => (
            <div key={sp.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: idx < orderProducts.length - 1 ? '1px solid #e3e8ee' : 'none', 
              padding: '18px 0' 
            }}>
              <div style={{ width: 80, height: 80, marginRight: 24 }}>
                {sp.anh && sp.anh.trim() !== '' ? (
                  <img
                    src={sp.anh.includes(',')
                      ? `http://localhost:8080/api/images/${encodeURIComponent(sp.anh.split(',')[0].trim())}`
                      : `http://localhost:8080/api/images/${encodeURIComponent(sp.anh.trim())}`}
                    alt={sp.tenSanPham}
                    style={{ width: 100, height: 90, objectFit: 'cover', borderRadius: 8 }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback khi không có ảnh hoặc ảnh bị lỗi */}
                <div 
                  style={{ 
                    width: 100, 
                    height: 90, 
                    background: '#f0f0f0', 
                    borderRadius: 8, 
                    display: (sp.anh && sp.anh.trim() !== '') ? 'none' : 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 12, 
                    color: '#999' 
                  }}
                  className="fallback-image"
                >
                  Không có ảnh
                </div>
              </div>
              <div style={{ flex: 2, fontWeight: 600, fontSize: 16 }}>{sp.tenSanPham}</div>
              <div style={{ flex: 1, color: '#555', fontSize: 15 }}>{sp.mauSac}</div>
              <div style={{ flex: 1, color: '#555', fontSize: 15 }}>{sp.kichThuoc}</div>
              <div style={{ flex: 1, color: '#1976d2', fontWeight: 700, fontSize: 16 }}>
                {/* ✅ SỬA: Hiển thị giá gốc và giá khuyến mãi nếu có (giống OrderDetailPOSPage) */}
                {sp.giaBanGiamGia < sp.giaBan ? (
                  <div>
                    <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                      {sp.giaBan?.toLocaleString()}đ
                    </div>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '16px' }}>
                      {sp.giaBanGiamGia?.toLocaleString()}đ
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 16 }}>
                    {sp.giaBanGiamGia?.toLocaleString()}đ
                  </div>
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: '#1976d2' }}>
                {sp.soLuong}
              </div>
              <div style={{ flex: 1, fontWeight: 700, color: '#009688', fontSize: 16 }}>
                {sp.thanhTien?.toLocaleString()}đ
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tổng kết đơn hàng */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: 24, 
        boxShadow: '0 1px 4px rgba(25,118,210,0.04)', 
        fontSize: 16, 
        fontWeight: 500, 
        maxWidth: 400, 
        marginLeft: 'auto' 
      }}>
        <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 16 }}>💰 Tổng kết đơn hàng</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Tiền hàng:</span>
          <span>{tongTienHangTinh.toLocaleString()}đ</span>
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
          <span>Tổng thanh toán:</span>
          <span>{tongTien.toLocaleString()}đ</span>
        </div>
        
        {/* ✅ DEBUG: Hiển thị tính toán chi tiết */}
        
        
        {/* Thông tin bổ sung */}
        <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 14 }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Loại đơn:</strong> {order.loaiDonHang || 'Online'}
          </div>
          {order.idgiamGia && (
            <div style={{ marginBottom: 4 }}>
              <strong>Mã giảm giá:</strong> {voucherInfo ? voucherInfo.tenVoucher : `#${order.idgiamGia}`}
            </div>
          )}
          <div>
            <strong>Trạng thái:</strong> 
            <span style={{
              background: TRANG_THAI.find(t => t.value === order.trangThai)?.color || '#999',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              marginLeft: 8,
              fontSize: 12
            }}>
              {TRANG_THAI.find(t => t.value === order.trangThai)?.label || 'Không xác định'}
            </span>
          </div>
          
          {/* ✅ THÊM: Hiển thị lý do cho trạng thái 5 và 7 */}
          {(order.trangThai === 5 || order.trangThai === 7) && order.ghiChu && (
            <div style={{ marginTop: 8 }}>
              <strong style={{ color: '#000' }}>
                {order.trangThai === 5 ? 'Lý do hủy đơn:' : 'Lý do giao hàng không thành công:'}
              </strong>
              <span style={{
                color: '#e53935',
                fontWeight: 600,
                fontSize: 14,
                marginLeft: 8
              }}>
                {order.ghiChu}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 