import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TRANG_THAI = [
  { value: 0, label: 'Chờ xác nhận', color: '#ff9800' },
  { value: 1, label: 'Đã xác nhận', color: '#43b244' },
  { value: 2, label: 'Đang chuẩn bị', color: '#1976d2' },
  { value: 3, label: 'Đang giao', color: '#1976d2' },
  { value: 4, label: 'Hoàn thành', color: '#009688' },
  { value: 5, label: 'Đã hủy', color: '#e53935' },
  { value: 7, label: 'Giao hàng không thành công', color: '#9c27b0' }
];

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // State cho filter và search
  const [filterStatus, setFilterStatus] = useState(-1); // Mặc định hiển thị tất cả
  const [searchText, setSearchText] = useState('');
  


  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Lấy customerId từ localStorage
      const customerId = localStorage.getItem('customerId') || localStorage.getItem('userId') || 1;
      
      let response;
      
             // Sử dụng API mới theo trạng thái cụ thể
       if (filterStatus === -1) {
         // Lấy tất cả đơn hàng của khách hàng
         response = await axios.get(`http://localhost:8080/api/donhang/khach/${customerId}`);
       } else {
         // Lấy đơn hàng theo trạng thái cụ thể (bao gồm cả trạng thái 7)
         response = await axios.get(`http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`);
       }
      
             console.log('Orders response:', response.data);
       // ✅ DEBUG: Log để kiểm tra dữ liệu ghiChu
       if (filterStatus === 7) {
         console.log('🔍 === DEBUG GIAO HÀNG KHÔNG THÀNH CÔNG ===');
         console.log('📡 API Response:', response.data);
         console.log('📊 Response type:', typeof response.data);
         console.log('📊 Response length:', response.data?.length);
         console.log('🔗 API URL:', `http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`);
         
         if (Array.isArray(response.data)) {
           response.data.forEach((order, idx) => {
             console.log(`📊 Đơn hàng ${idx + 1}:`, {
               id: order.id,
               trangThai: order.trangThai,
               ghiChu: order.ghiChu,
               hasGhiChu: !!order.ghiChu,
               ghiChuType: typeof order.ghiChu,
               // ✅ THÊM: Log toàn bộ object để kiểm tra
               fullOrder: order,
               // ✅ THÊM: Log tất cả keys để kiểm tra cấu trúc
               allKeys: Object.keys(order)
             });
           });
         } else {
           console.log('⚠️ Response không phải array:', response.data);
         }
         console.log('🔍 === END DEBUG ===');
       }
      
      let filteredOrders = response.data || [];
      
             // ✅ SỬA: Tab "Tất cả" chỉ hiển thị đơn hàng có trạng thái 0,1,2,3 (không bao gồm trạng thái 7)
       if (filterStatus === -1) {
         filteredOrders = filteredOrders.filter(order => [0, 1, 2, 3].includes(order.trangThai));
       }
      
      // ✅ THÊM: Sắp xếp theo ID từ cao xuống thấp
      filteredOrders.sort((a, b) => (b.id || 0) - (a.id || 0));
      
      // Tìm kiếm theo mã đơn hoặc tên khách hàng
      if (searchText.trim()) {
        const search = searchText.trim().toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          (order.id?.toString().includes(search) || '') ||
          (order.tenKhachHang?.toLowerCase().includes(search) || '') ||
          (order.tenNguoiNhan?.toLowerCase().includes(search) || '')
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      setError('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm
  const handleSearch = () => {
    fetchOrders();
  };

  // Hàm reset tìm kiếm
  const handleResetSearch = () => {
    setSearchText('');
    setFilterStatus(-1);
    fetchOrders();
  };
  




  // Render filter trạng thái và ô tìm kiếm
  const renderFilterBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 8px 0', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            padding: '6px 18px',
            border: 'none',
            borderRadius: 8,
            background: filterStatus === -1 ? '#1976d2' : '#e3f0ff',
            color: filterStatus === -1 ? '#fff' : '#1976d2',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => setFilterStatus(-1)}
        >
          Tất cả
        </button>
        {TRANG_THAI.map(tt => (
          <button
            key={tt.value}
            style={{
              padding: '6px 18px',
              border: 'none',
              borderRadius: 8,
              background: filterStatus === tt.value ? tt.color : '#e3f0ff',
              color: filterStatus === tt.value ? '#fff' : tt.color,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => setFilterStatus(tt.value)}
          >
            {tt.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <input
          type="text"
          placeholder="Tìm kiếm mã đơn, tên khách hàng..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e3e8ee',
            minWidth: 260,
            fontSize: 15,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 8,
          }}
        >
          🔍 Tìm kiếm
        </button>
        <button
          onClick={handleResetSearch}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 8,
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );

  // Render bảng danh sách đơn hàng
  const renderOrdersTable = () => (
    <div style={{ width: '100%', marginTop: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', overflow: 'hidden', borderCollapse: 'collapse' }}>
      {renderFilterBar()}
      
      {/* Hiển thị thông tin filter hiện tại */}
      {filterStatus !== -1 && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '12px 16px', 
          borderRadius: 8, 
          margin: '16px 24px',
          border: '1px solid #4caf50',
          color: '#2e7d32',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🔍 Đang lọc theo trạng thái: 
          <span style={{ 
            background: TRANG_THAI.find(t => t.value === filterStatus)?.color || '#999',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12
          }}>
            {TRANG_THAI.find(t => t.value === filterStatus)?.label || 'Không xác định'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>
            Tìm thấy {orders.length} đơn hàng
          </span>
        </div>
      )}
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 700 }}>
            <th style={{ padding: 12 }}>STT</th>
            <th style={{ padding: 12 }}>Mã đơn hàng</th>
            <th style={{ padding: 12 }}>Tên khách hàng</th>
            <th style={{ padding: 12 }}>Ngày tạo</th>
            <th style={{ padding: 12 }}>Số điện thoại</th>
            <th style={{ padding: 12 }}>Tổng tiền (đã bao gồm phí ship)</th>
            <th style={{ padding: 12 }}>Trạng thái</th>
            <th style={{ padding: 12 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                {loading ? 'Đang tải dữ liệu...' : 
                 filterStatus !== -1 ? `Không có đơn hàng nào ở trạng thái "${TRANG_THAI.find(t => t.value === filterStatus)?.label}"` :
                 'Không có đơn hàng nào'}
              </td>
            </tr>
          ) : (
            orders.map((order, idx) => {
              const trangThaiObj = TRANG_THAI.find(t => t.value === order.trangThai) || TRANG_THAI[0];
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #e3e8ee', fontSize: 16 }}>
                  <td style={{ padding: 12, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>#{order.id}</td>
                  <td style={{ padding: 12 }}>{order.tenKhachHang || order.tenNguoiNhan || 'Chưa có thông tin'}</td>
                  <td style={{ padding: 12 }}>{order.ngayTao || '-'}</td>
                  <td style={{ padding: 12 }}>{order.soDienThoaiGiaoHang || '---'}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>
                    {(() => {
                      // Tính tổng tiền bao gồm phí ship
                      const tongTien = order.tongTien || 0; // tongTien đã bao gồm phí ship từ backend
                      const phiVanChuyen = order.phiVanChuyen || 0;
                      
                      // Hiển thị tổng tiền cuối cùng (đã bao gồm phí ship)
                      return `${tongTien.toLocaleString()}₫`;
                    })()}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      background: trangThaiObj.color,
                      color: '#fff',
                      borderRadius: 12,
                      padding: '4px 18px',
                      fontWeight: 600,
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      minWidth: 110,
                      textAlign: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}>
                      {trangThaiObj.label}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                                         <button
                       style={{
                         padding: '6px 16px',
                         background: '#1976d2',
                         color: '#fff',
                         border: 'none',
                         borderRadius: 6,
                         fontWeight: 600,
                         cursor: 'pointer'
                       }}
                       onClick={() => navigate(`/orders/${order.id}`)}
                     >
                       Chi tiết
                     </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );



  // Tính tổng thống kê
  const totalStats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + (order.tongTien || 0), 0), // tongTien đã bao gồm phí ship
    totalProducts: orders.reduce((sum, order) => sum + (order.soSanPham || 0), 0),
    completedOrders: orders.filter(order => order.trangThai === 4).length,
    pendingOrders: orders.filter(order => [0, 1, 2, 3].includes(order.trangThai)).length,
    // ✅ SỬA: Không hiển thị đơn hàng đã hủy trong thống kê "Tất cả"
    cancelledOrders: filterStatus === 5 ? orders.length : 0, // Chỉ hiển thị khi filter theo trạng thái 5
    // ✅ THÊM: Đơn hàng giao hàng không thành công
    failedDeliveryOrders: filterStatus === 7 ? orders.length : 0, // Chỉ hiển thị khi filter theo trạng thái 7
  };

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
          📋 Lịch sử đơn hàng
        </h2>
        
        {/* Thống kê tổng quan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ textAlign: 'center', background: '#e6f7ff', padding: 16, borderRadius: 8, border: '1px solid #91d5ff' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {totalStats.totalOrders}
            </div>
            <div style={{ color: '#666' }}>
              {filterStatus === -1 ? 'Đơn hàng đang xử lý' : 'Tổng đơn hàng'}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', background: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
              {Number(totalStats.totalAmount).toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ color: '#666' }}>Tổng giá trị (đã bao gồm phí ship)</div>
          </div>
        </div>

        {/* Bảng đơn hàng */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#1976d2' }}>
            <div style={{ fontSize: 18 }}>Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#f5222d' }}>
            <div style={{ fontSize: 18 }}>❌ {error}</div>
            <button 
              onClick={fetchOrders}
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
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Luôn hiển thị filter bar và bảng */}
            <div style={{ width: '100%', marginTop: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', overflow: 'hidden', borderCollapse: 'collapse' }}>
              {renderFilterBar()}
              
              {/* Hiển thị thông tin filter hiện tại */}
              {filterStatus !== -1 ? (
                <div style={{ 
                  background: '#e8f5e8', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  margin: '16px 24px',
                  border: '1px solid #4caf50',
                  color: '#2e7d32',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  🔍 Đang lọc theo trạng thái: 
                  <span style={{ 
                    background: TRANG_THAI.find(t => t.value === filterStatus)?.color || '#999',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    {TRANG_THAI.find(t => t.value === filterStatus)?.label || 'Không xác định'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                    Tìm thấy {orders.length} đơn hàng
                  </span>
                </div>
              ) : (
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  margin: '16px 24px',
                  border: '1px solid #2196f3',
                  color: '#1565c0',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  📋 Hiển thị đơn hàng đang xử lý (Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao)
                  <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                    Tìm thấy {orders.length} đơn hàng
                  </span>
                </div>
              )}
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
          <tr style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 700 }}>
            <th style={{ padding: 12 }}>STT</th>
            <th style={{ padding: 12 }}>Mã đơn hàng</th>
            <th style={{ padding: 12 }}>Tên khách hàng</th>
            <th style={{ padding: 12 }}>Ngày tạo</th>
            <th style={{ padding: 12 }}>Số điện thoại</th>
            <th style={{ padding: 12 }}>Thành tiền</th>
            <th style={{ padding: 12 }}>Trạng thái</th>
            {(filterStatus === 5 || filterStatus === 7) && (
              <th style={{ padding: 12 }}>
                {filterStatus === 5 ? 'Lý do hủy đơn' : 'Lý do giao hàng không thành công'}
              </th>
            )}
            <th style={{ padding: 12 }}>Thao tác</th>
          </tr>
        </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={(filterStatus === 5 || filterStatus === 7) ? 9 : 8} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                        {filterStatus !== -1 ? 
                          `Không có đơn hàng nào ở trạng thái "${TRANG_THAI.find(t => t.value === filterStatus)?.label}"` :
                          'Không có đơn hàng nào'
                        }
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, idx) => {
                      const trangThaiObj = TRANG_THAI.find(t => t.value === order.trangThai) || TRANG_THAI[0];
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #e3e8ee', fontSize: 16 }}>
                          <td style={{ padding: 12, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>#{order.id}</td>
                          <td style={{ padding: 12 }}>{order.tenKhachHang || order.tenNguoiNhan || 'Chưa có thông tin'}</td>
                          <td style={{ padding: 12 }}>{order.ngayTao || '-'}</td>
                          <td style={{ padding: 12 }}>{order.soDienThoaiGiaoHang || '---'}</td>
                          <td style={{ padding: 12, fontWeight: 700 }}>{order.tongTienSauGiamGia?.toLocaleString() || order.tongTien?.toLocaleString() || 0}đ</td>
                          <td style={{ padding: 12 }}>
                            <span style={{
                              display: 'inline-block',
                              background: trangThaiObj.color,
                              color: '#fff',
                              borderRadius: 12,
                              padding: '4px 18px',
                              fontWeight: 600,
                              fontSize: 15,
                              whiteSpace: 'nowrap',
                              minWidth: 110,
                              textAlign: 'center',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                            }}>
                              {trangThaiObj.label}
                            </span>
                          </td>
                                                     {(filterStatus === 5 || filterStatus === 7) && (
                             <td style={{ padding: 12 }}>
                               <span style={{
                                 color: filterStatus === 5 ? '#e53935' : '#9c27b0',
                                 fontWeight: 600,
                                 fontSize: 14,
                                 padding: '4px 8px',
                                 background: filterStatus === 5 ? '#ffebee' : '#f3e5f5',
                                 borderRadius: 6,
                                 border: `1px solid ${filterStatus === 5 ? '#ffcdd2' : '#e1bee7'}`
                               }}>
                                                                   {(() => {
                                    // ✅ DEBUG: Log để kiểm tra từng order
                                    console.log('🔍 Order ghiChu:', {
                                      id: order.id,
                                      ghiChu: order.ghiChu,
                                      hasGhiChu: !!order.ghiChu,
                                      ghiChuType: typeof order.ghiChu,
                                      // ✅ THÊM: Log thêm thông tin để debug
                                      orderKeys: Object.keys(order),
                                      hasGhiChuKey: 'ghiChu' in order
                                    });
                                    
                                    // ✅ CẢI THIỆN: Xử lý nhiều trường hợp hơn
                                    if (order.ghiChu !== null && order.ghiChu !== undefined && order.ghiChu !== '') {
                                      const ghiChuStr = String(order.ghiChu).trim();
                                      if (ghiChuStr.length > 0) {
                                        return ghiChuStr;
                                      }
                                    }
                                    
                                    // Kiểm tra các trường khác có thể chứa lý do
                                    if (order.lyDo && order.lyDo.trim() !== '') {
                                      return order.lyDo;
                                    }
                                    
                                    if (order.ghiChuGiaoHang && order.ghiChuGiaoHang.trim() !== '') {
                                      return order.ghiChuGiaoHang;
                                    }
                                    
                                    return 'Chưa có lý do';
                                  })()}
                               </span>
                             </td>
                           )}
                          <td style={{ padding: 12 }}>
                                                         <button
                               style={{
                                 padding: '6px 16px',
                                 background: '#1976d2',
                                 color: '#fff',
                                 border: 'none',
                                 borderRadius: 6,
                                 fontWeight: 600,
                                 cursor: 'pointer'
                               }}
                               onClick={() => navigate(`/orders/${order.id}`)}
                             >
                               Chi tiết
                             </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Hiển thị thông báo khi không có dữ liệu */}
            {orders.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#666',
                background: '#fff',
                borderRadius: 12,
                marginTop: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                <h3 style={{ color: '#999', marginBottom: '8px' }}>
                  {filterStatus !== -1 ? 
                    `Không có đơn hàng nào ở trạng thái "${TRANG_THAI.find(t => t.value === filterStatus)?.label}"` :
                    'Chưa có đơn hàng nào'
                  }
                </h3>
                <p style={{ color: '#999', fontSize: '16px' }}>
                  {filterStatus !== -1 ? 
                    'Hãy thử chọn trạng thái khác hoặc tạo đơn hàng mới!' :
                                         'Bạn chưa có đơn hàng nào đang xử lý (Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao). Hãy mua sắm để tạo đơn hàng mới!'
                  }
                </p>
              </div>
                         )}
           </>
         )}
       </div>
       

     </div>
   );
 }

export default OrderHistory;