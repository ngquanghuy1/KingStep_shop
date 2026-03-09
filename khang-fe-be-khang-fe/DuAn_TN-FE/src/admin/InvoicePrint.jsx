import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const A4_WIDTH = 595; // pt
const A4_HEIGHT = 842; // pt

const InvoiceContent = React.forwardRef(({ order }, ref) => {
  // Lấy ngày hiện tại nếu không có order.date
  const today = new Date();
  const dateStr = order.date || today.toLocaleDateString('vi-VN');
  // Fallback logo nếu không có hoặc lỗi
  const logoUrl = order.logoUrl || '/logo.png';
  // Tên khách hàng fallback
  const customerName = (order.customerName && order.customerName.trim()) ? order.customerName : 'Khách vãng lai';
  // SĐT và địa chỉ cố định theo yêu cầu
  const phone = '0984184412';
  const address = 'Mỹ Đình - Nam Từ Liêm - Hà Nội';

  return (
    <div ref={ref} id="invoice-content" style={{ width: 595, margin: '0 auto', fontFamily: 'Arial', background: '#fff', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img
          src={logoUrl}
          alt="logo.png"
          style={{ width: 150, height: 90, objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.src = '/logo.png'; }}
        />
        <div style={{ textAlign: 'right', fontSize: 16 }}>
          <b>{order.shopName}</b><br />
          SĐT: {phone}<br />
          Địa chỉ: {address}<br />
          {order.shopAddress && <span style={{ display: 'none' }}>{order.shopAddress}</span>}
          {order.shopPhone && <span style={{ display: 'none' }}>{order.shopPhone}</span>}
        </div>
      </div>
      <h2 style={{ textAlign: 'center', margin: '32px 0 16px 0', color: '#1976d2' }}>HÓA ĐƠN</h2>
      <div style={{ marginBottom: 8 }}>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Tên khách hàng:</b> {customerName}
      </div>
      <div style={{ textAlign: 'right', fontStyle: 'italic', marginBottom: 12 }}>
        Ngày mua hàng: {dateStr}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>ID SPCT</th>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>Tên sản phẩm</th>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>Màu</th>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>Size</th>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>Số lượng</th>
            <th style={{ border: '1px solid #1976d2', padding: 4, background: '#1976d2', color: '#fff' }}>Đơn giá (VND)</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => {
            const giaBan = item.giaBan ?? item.price;
            const giaBanGiamGia = item.giaBanGiamGia ?? item.priceAfterDiscount;
            return (
              <tr key={idx}>
                <td style={{ border: '1px solid #1976d2', padding: 4, textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: '#666' }}>
                  {item.idSanPhamChiTiet || '-'}
                </td>
                <td style={{ border: '1px solid #1976d2', padding: 4 }}>{item.productName}</td>
                <td style={{ border: '1px solid #1976d2', padding: 4, textAlign: 'center' }}>{item.mauSac || '-'}</td>
                <td style={{ border: '1px solid #1976d2', padding: 4, textAlign: 'center' }}>{item.kichThuoc || '-'}</td>
                <td style={{ border: '1px solid #1976d2', padding: 4, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #1976d2', padding: 4, textAlign: 'right' }}>
                  {giaBanGiamGia && giaBanGiamGia < giaBan ? (
                    <div>
                      <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
                        {giaBan?.toLocaleString()} đ
                      </div>
                      <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        {giaBanGiamGia?.toLocaleString()} đ
                      </div>
                    </div>
                  ) : (
                    <div>{giaBan?.toLocaleString()} đ</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Thay phần tổng kết hóa đơn bằng các dòng rõ ràng */}
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
        Tổng tiền hàng: {order.totalHang ? order.totalHang.toLocaleString() : order.total?.toLocaleString()} VND
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#388e3c' }}>
        Tổng tiền giảm giá: -{order.totalGiamGia ? order.totalGiamGia.toLocaleString() : '0'} VND
      </div>
      <div style={{ textAlign: 'right', fontWeight: 'bold', marginBottom: 32, fontSize: 18, color: '#e53935' }}>
        Tổng tiền thanh toán: {order.totalThanhToan ? order.totalThanhToan.toLocaleString() : order.total?.toLocaleString()} VND
      </div>
      <div style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 32 }}>
        Cảm ơn quý khách đã mua hàng!
      </div>
    </div>
  );
});

const InvoicePrint = ({ order, onClose, chiTietList = [], spctList = [] }) => {
  const componentRef = useRef();

  // Nếu có chiTietList và spctList thì join thông tin sản phẩm chi tiết
  let items = order.items || [];
  let totalHang = order.totalHang || 0;
  if (chiTietList.length > 0 && spctList.length > 0) {
    items = chiTietList.map(ct => {
      const spct = spctList.find(sp => sp.id === ct.idSanPhamChiTiet) || {};
      return {
        idSanPhamChiTiet: ct.idSanPhamChiTiet || '',
        productName: spct.tenSanPham || '',
        mauSac: spct.mauSac || '',
        kichThuoc: spct.kichThuoc || '',
        quantity: ct.soLuong,
        giaBan: spct.giaBan || ct.gia, // giá gốc
        giaBanGiamGia: spct.giaBanGiamGia || spct.giaBanSauGiam || null, // giá sau giảm nếu có
      };
    });
    totalHang = chiTietList.reduce((sum, ct) => sum + ct.gia * ct.soLuong, 0);
  }
  // Tạo object order truyền vào InvoiceContent
  const orderData = {
    ...order,
    items,
    totalHang,
    totalGiamGia: order?.tongTienGiamGia || 0,
    totalThanhToan: order?.tongTien || 0,
  };

  const handleExportPDF = async () => {
    const input = componentRef.current;
    const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');

    // Tính tỉ lệ scale cho vừa trang A4
    const imgWidth = A4_WIDTH;
    const imgHeight = canvas.height * (A4_WIDTH / canvas.width);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('hoa-don.pdf');
  };

  return (
    <div>
      <button onClick={handleExportPDF} style={{ marginRight: 12 }}>Xuất PDF</button>
      <button onClick={onClose}>Đóng</button>
      <InvoiceContent ref={componentRef} order={orderData} />
    </div>
  );
};

export default InvoicePrint; 