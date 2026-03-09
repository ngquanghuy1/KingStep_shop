import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetailPOSPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [chiTietSanPham, setChiTietSanPham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenKhachHang, setTenKhachHang] = useState('Khách vãng lai');
  const [tenVoucher, setTenVoucher] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        // Lấy thông tin đơn hàng
        const resOrder = await fetch(`http://localhost:8080/api/donhang/${id}`);
        if (!resOrder.ok) throw new Error('Lỗi khi lấy thông tin đơn hàng');
        const orderData = await resOrder.json();
        setOrder(orderData);

        // Lấy tên khách hàng nếu có idkhachHang
        if (orderData.idkhachHang) {
          try {
            const resKH = await fetch(`http://localhost:8080/api/khachhang/${orderData.idkhachHang}`);
            if (resKH.ok) {
              const kh = await resKH.json();
              setTenKhachHang(kh.tenKhachHang || 'Khách vãng lai');
            } else {
              setTenKhachHang('Khách vãng lai');
            }
          } catch {
            setTenKhachHang('Khách vãng lai');
          }
        } else {
          setTenKhachHang('Khách vãng lai');
        }

        // Lấy tên voucher nếu có idgiamGia
        if (orderData.idgiamGia) {
          try {
            const resVoucher = await fetch(`http://localhost:8080/api/voucher/${orderData.idgiamGia}`);
            if (resVoucher.ok) {
              const voucher = await resVoucher.json();
              setTenVoucher(voucher.tenVoucher || '');
            } else {
              setTenVoucher('');
            }
          } catch {
            setTenVoucher('');
          }
        } else {
          setTenVoucher('');
        }

        // Lấy chi tiết sản phẩm trong đơn hàng
        const resDetail = await fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${id}`);
        if (!resDetail.ok) throw new Error('Lỗi khi lấy chi tiết hóa đơn');
        let detailData = await resDetail.json();

        // Lấy thông tin chi tiết từng sản phẩm
        const detailWithProduct = await Promise.all(
          detailData.map(async (item) => {
            const resProd = await fetch(`http://localhost:8080/api/san-pham-chi-tiet/spct/${item.idSanPhamChiTiet}`);
            const prod = await resProd.json();
            
            // Debug: Log thông tin ảnh
            console.log('Sản phẩm:', prod.tenSanPham, 'Images:', prod.images);
            
            return {
              ...item,
              tenSanPham: prod.tenSanPham,
              mauSac: prod.mauSac,
              kichThuoc: prod.kichThuoc,
              // ✅ SỬA: Lấy giá từ DonHangChiTiet và so sánh với giá gốc
              giaBan: prod.giaBan,  // Giá gốc từ sản phẩm
              giaBanGiamGia: item.gia,  // Giá đã lưu trong DonHangChiTiet (có thể là giá gốc hoặc giá khuyến mãi)
              anh: prod.images,
            };
          })
        );
        setChiTietSanPham(detailWithProduct);
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // ✅ SỬA: Tính tổng tiền hàng từ DonHangChiTiet
  const tongTienHang = chiTietSanPham.reduce((sum, sp) => {
    return sum + sp.thanhTien;  // Sử dụng thành tiền đã lưu trong DonHangChiTiet
  }, 0);
  const tongGiamGia = order?.tongTienGiamGia || 0;
  const tongTien = order?.tongTien || 0;

  // Hàm xử lý đường dẫn ảnh giống như SanPhamPage
  const getImageUrl = (img) => {
    if (!img) return '/default-image.png';
    // Nếu là mảng, lấy phần tử đầu
    if (Array.isArray(img)) img = img[0];
    // Nếu là chuỗi nhiều ảnh, lấy ảnh đầu
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];
    img = img.trim();
    if (!img) return '/default-image.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return 'http://localhost:8080' + img;
    
    // Sử dụng API endpoint thay vì static resource
    return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#f6f8fa' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Quay lại</button>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24 }}>Chi tiết đơn hàng POS #{id}</h2>
      {loading ? (
        <div style={{ color: '#1976d2', padding: 24, textAlign: 'center' }}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
      ) : (
        <>
                     <div style={{ marginBottom: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', padding: 24, maxWidth: 420 }}>
             <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Nhân viên: <span style={{ fontWeight: 400 }}>{order?.tenNhanVien || '-'}</span></div>
             <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Khách hàng: <span style={{ fontWeight: 400 }}>{tenKhachHang}</span></div>
             <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Ngày mua: <span style={{ fontWeight: 400 }}>{order?.ngayMua || '-'}</span></div>
             {tenVoucher && (
               <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Voucher: <span style={{ fontWeight: 400, color: '#e74c3c' }}>{tenVoucher}</span></div>
             )}
             <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Tổng tiền: <span style={{ fontWeight: 400 }}>{order?.tongTien?.toLocaleString()} đ</span></div>
             <div style={{ fontWeight: 700, fontSize: 18 }}>Trạng thái: <span style={{ fontWeight: 400 }}>{order?.trangThai === 1 ? 'Đã thanh toán' : 'Chờ thanh toán'}</span></div>
           </div>
          <h3 style={{ color: '#1976d2', margin: '32px 0 18px 0', fontWeight: 800, fontSize: 24 }}>Chi tiết sản phẩm trong đơn hàng</h3>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', padding: 24, marginBottom: 24 }}>
            {/* Hàng tiêu đề */}
            <div style={{ display: 'flex', fontWeight: 700, color: '#1976d2', marginBottom: 12, fontSize: 16 }}>
              <div style={{ width: 90, marginRight: 28 }}></div>
              <div style={{ flex: 1, textAlign: 'center' }}>ID SPCT</div>
              <div style={{ flex: 2 }}>Tên sản phẩm</div>
              <div style={{ flex: 1 }}>Màu</div>
              <div style={{ flex: 1 }}>Size</div>
              <div style={{ flex: 1, textAlign: 'right' }}>Giá</div>
              <div style={{ flex: 1, textAlign: 'center' }}>SL</div>
              <div style={{ flex: 1, textAlign: 'right' }}>Thành tiền</div>
            </div>
            {Array.isArray(chiTietSanPham) && chiTietSanPham.length > 0 ? (
              chiTietSanPham.map((sp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', borderBottom: idx < chiTietSanPham.length - 1 ? '1px solid #e3e8ee' : 'none', padding: '18px 0' }}>
                  <div style={{ width: 90, height: 90, marginRight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 12, boxShadow: '0 1px 4px rgba(25,118,210,0.06)' }}>
                    <img
                      src={getImageUrl(sp.anh)}
                      alt={sp.tenSanPham}
                      style={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.log('Lỗi tải ảnh:', sp.anh, 'cho sản phẩm:', sp.tenSanPham);
                        e.target.src = '/logo.png';
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: '#666', fontSize: 14 }}>
                    {sp.idSanPhamChiTiet}
                  </div>
                  <div style={{ flex: 2, fontWeight: 700, fontSize: 18 }}>{sp.tenSanPham}</div>
                  <div style={{ flex: 1, color: '#555', fontSize: 16 }}>{sp.mauSac}</div>
                  <div style={{ flex: 1, color: '#555', fontSize: 16 }}>{sp.kichThuoc}</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    {/* ✅ SỬA: Hiển thị giá gốc và giá khuyến mãi nếu có */}
                    {sp.giaBanGiamGia < sp.giaBan ? (
                      <div>
                        <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                          {sp.giaBan?.toLocaleString()}đ
                        </div>
                        <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>
                          {sp.giaBanGiamGia?.toLocaleString()}đ
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>
                        {sp.giaBanGiamGia?.toLocaleString()}đ
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, fontSize: 18, textAlign: 'center' }}>{sp.soLuong}</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    {/* ✅ SỬA: Hiển thị thành tiền từ DonHangChiTiet */}
                    <div style={{ color: '#388e3c', fontWeight: 700, fontSize: 18 }}>
                      {sp.thanhTien?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có sản phẩm nào trong đơn hàng này.</div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 260, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', padding: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 18 }}>
                Tiền hàng: {tongTienHang.toLocaleString()}đ
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#388e3c', fontSize: 18 }}>
                Tiền giảm giá: -{tongGiamGia.toLocaleString()}đ
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#1976d2', fontSize: 20 }}>
                Tổng tiền: {tongTien.toLocaleString()}đ
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailPOSPage; 