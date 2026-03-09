// 

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mockOrdersOnline from './mockOrdersOnline';

const TRANG_THAI = [
  { value: 0, label: 'Chờ xác nhận', color: '#ff9800' },
  { value: 1, label: 'Đã xác nhận', color: '#43b244' },
  { value: 2, label: 'Đang chuẩn bị', color: '#1976d2' },
  { value: 3, label: 'Đang giao', color: '#1976d2' },
  { value: 4, label: 'Hoàn thành', color: '#009688' },
  { value: 5, label: 'Đã hủy', color: '#e53935' },
  { value: 7, label: 'Giao hàng không thành công', color: '#9c27b0' }
];

const DonHangPage = () => {
  const navigate = useNavigate();
  // --- ONLINE ---
  const [activeTab, setActiveTab] = useState('ONLINE');
  const [ordersOnline, setOrdersOnline] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [errorOnline, setErrorOnline] = useState('');
  const [showDetailModalOnline, setShowDetailModalOnline] = useState(false);
  const [selectedOrderOnline, setSelectedOrderOnline] = useState(null);

  // Thêm các state cho filter và search hóa đơn online
  const [filterStatus, setFilterStatus] = useState(TRANG_THAI[0].value);
  const [searchText, setSearchText] = useState('');
  
  // State cho tìm kiếm đơn hàng online với API
  const [searchFromDateOnline, setSearchFromDateOnline] = useState('');
  const [searchToDateOnline, setSearchToDateOnline] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  
  // State cho modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Thêm state cho tìm kiếm đơn hàng POS
  const [searchCustomerName, setSearchCustomerName] = useState('');
  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');
  const [searchStatus, setSearchStatus] = useState(-1);
  const [isSearchingPOS, setIsSearchingPOS] = useState(false);

  // Hàm lọc và tìm kiếm hóa đơn online
  const filteredOrdersOnline = ordersOnline.filter(order => {
    // Lọc theo trạng thái nếu filterStatus khác ALL
    const matchStatus = Number(order.trangThai) === Number(filterStatus);
    // Tìm kiếm theo mã đơn hoặc tên khách hàng
    const search = searchText.trim().toLowerCase();
    const matchSearch =
      !search ||
      (order.maDon?.toLowerCase?.().includes(search) || '') ||
      (order.tenKhachHang?.toLowerCase?.().includes(search) || '') ||
      (order.tenNguoiNhan?.toLowerCase?.().includes(search) || '');
    return matchStatus && matchSearch;
  });

  // --- POS ---
  const [ordersPOS, setOrdersPOS] = useState([]);
  const [loadingPOS, setLoadingPOS] = useState(false);
  const [errorPOS, setErrorPOS] = useState('');
  const [showDetailModalPOS, setShowDetailModalPOS] = useState(false);
  const [selectedOrderPOS, setSelectedOrderPOS] = useState(null);
  const [chiTietSanPham, setChiTietSanPham] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Fetch danh sách sản phẩm chi tiết khi mount (POS)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll');
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Fetch danh sách khách hàng khi mount (POS)
  useEffect(() => {
    fetch('http://localhost:8080/api/khachhang')
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []));
  }, []);

  // Fetch đơn hàng POS khi chuyển tab hoặc khi component mount
  useEffect(() => {
    if (activeTab === 'POS') {
      fetchOrdersPOS();
    }
  }, [activeTab]);

  // Fetch dữ liệu ban đầu khi component mount
  useEffect(() => {
    // Fetch dữ liệu POS ngay từ đầu để đảm bảo có sẵn khi chuyển tab
    fetchOrdersPOS();
  }, []); // Chỉ chạy 1 lần khi mount

  // Hàm tìm kiếm đơn hàng POS
  const searchOrdersPOS = async () => {
    setIsSearchingPOS(true);
    setLoadingPOS(true);
    setErrorPOS('');
    
    try {
      const params = new URLSearchParams();
      if (searchCustomerName.trim()) {
        params.append('tenKhachHang', searchCustomerName.trim());
      }
      if (searchFromDate) {
        params.append('tuNgay', searchFromDate);
      }
      if (searchToDate) {
        params.append('denNgay', searchToDate);
      }
      if (searchStatus >= 0) {
        params.append('trangThai', searchStatus);
      }
      
      const url = `http://localhost:8080/api/donhang/search-pos?${params.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error('Lỗi khi tìm kiếm đơn hàng POS');
      const data = await res.json();
      
      setOrdersPOS(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorPOS(err.message || 'Lỗi không xác định');
    } finally {
      setLoadingPOS(false);
      setIsSearchingPOS(false);
    }
  };

  // Hàm tìm kiếm đơn hàng online
  const searchOrdersOnline = async () => {
    setIsSearchingOnline(true);
    setLoadingOnline(true);
    setErrorOnline('');
    
    try {
      const params = new URLSearchParams();
      
      // Thêm searchText nếu có
      if (searchText.trim()) {
        params.append('searchText', searchText.trim());
      }
      
      // Thêm filter ngày nếu có
      if (searchFromDateOnline) {
        params.append('tuNgay', searchFromDateOnline);
      }
      if (searchToDateOnline) {
        params.append('denNgay', searchToDateOnline);
      }
      
      const url = `http://localhost:8080/api/donhang/search-online?${params.toString()}`;
      console.log('🔍 Searching online orders with URL:', url);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Lỗi khi tìm kiếm đơn hàng online');
      
      const data = await res.json();
      console.log('🔍 Response data:', data);
      
      // Map lại dữ liệu cho đúng format bảng
      const mappedData = (Array.isArray(data) ? data : []).map(item => ({
        id: item.id,
        maDon: item.id,
        tenNguoiNhan: item.tenNguoiNhan,
        ngayTao: item.ngayTao,
        soDienThoaiGiaoHang: item.soDienThoaiGiaoHang,
        thanhTien: item.tongTien,
        loaiDon: item.loaiDonHang,
        trangThai: item.trangThai,
        ghiChu: item.ghiChu,
      }));
      
      // Sắp xếp theo ngày tạo từ mới đến cũ
      mappedData.sort((a, b) => {
        const dateA = new Date(a.ngayTao || 0);
        const dateB = new Date(b.ngayTao || 0);
        return dateB - dateA; // Giảm dần (mới nhất trước)
      });
      
      setOrdersOnline(mappedData);
    } catch (err) {
      console.error('🔍 Error searching online orders:', err);
      setErrorOnline(err.message || 'Lỗi không xác định');
    } finally {
      setLoadingOnline(false);
      setIsSearchingOnline(false);
    }
  };

  // Hàm reset tìm kiếm online
  const resetSearchOnline = () => {
    setSearchText('');
    setSearchFromDateOnline('');
    setSearchToDateOnline('');
    // Gọi lại API để lấy dữ liệu gốc với thứ tự sắp xếp đúng
    fetchOrdersOnline(Number(filterStatus));
  };

  // Hàm reset tìm kiếm
  const resetSearchPOS = () => {
    setSearchCustomerName('');
    setSearchFromDate('');
    setSearchToDate('');
    setSearchStatus(-1);
    fetchOrdersPOS(); // Load lại tất cả đơn hàng
  };

  // Fetch API đơn hàng online chờ xác nhận
  const fetchOrdersOnline = async (status) => {
    setLoadingOnline(true);
    setErrorOnline('');
    let url = '';
    switch (status) {
      case 0:
        url = 'http://localhost:8080/api/donhang/choxacnhan'; break;
      case 1:
        url = 'http://localhost:8080/api/donhang/daxacnhan'; break;
      case 2:
        url = 'http://localhost:8080/api/donhang/dangcbi'; break;
      case 3:
        url = 'http://localhost:8080/api/donhang/danggiao'; break;
      case 4:
        url = 'http://localhost:8080/api/donhang/dagiao'; break;
      case 5:
        url = 'http://localhost:8080/api/donhang/dahuy'; break;
      case 7:
        url = 'http://localhost:8080/api/donhang/giaohangthatbai'; break;
      default:
        url = 'http://localhost:8080/api/donhang/don-online';
    }
    
    if (!url) {
      setOrdersOnline([]);
      setLoadingOnline(false);
      return;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu đơn hàng online');
      let data = await res.json();
      
      // Map lại dữ liệu cho đúng format bảng
      data = (Array.isArray(data) ? data : []).map(item => ({
        id: item.id,
        maDon: `HD${item.id}`, // ✅ THÊM: Thêm chữ "HD" sau mã đơn hàng
        tenNguoiNhan: item.tenNguoiNhan, // giữ nguyên tên trường
        ngayTao: item.ngayTao,
        soDienThoaiGiaoHang: item.soDienThoaiGiaoHang, // giữ nguyên tên trường
        thanhTien: item.tongTien,
        loaiDon: item.loaiDonHang,
        trangThai: item.trangThai ?? status,
        ghiChu: item.ghiChu, // Lấy trực tiếp từ DonHangDTO
      }));
      
      // ✅ SỬA: Sắp xếp theo mã đơn hàng từ cao xuống thấp (thay vì theo ngày)
      data.sort((a, b) => {
        const orderIdA = Number(a.id) || 0;
        const orderIdB = Number(b.id) || 0;
        return orderIdB - orderIdA; // Giảm dần (mã cao nhất trước)
      });
      
      setOrdersOnline(data);
    } catch (err) {
      setErrorOnline(err.message || 'Lỗi không xác định');
    } finally {
      setLoadingOnline(false);
    }
  };

  // Gọi API khi vào tab ONLINE hoặc filterStatus đổi
  useEffect(() => {
    if (activeTab === 'ONLINE') {
      fetchOrdersOnline(Number(filterStatus));
    }
  }, [activeTab, filterStatus]);

  const fetchChiTietSanPham = async (orderId) => {
    setLoadingDetail(true);
    setErrorDetail('');
    try {
      const res = await fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`);
      if (!res.ok) throw new Error('Lỗi khi lấy chi tiết hóa đơn');
      let data = await res.json();
      // Join thêm tên, màu, size từ products (KHÔNG thay đổi giá)
      data = data.map(item => {
        const prod = products.find(p => p.id === item.idSanPhamChiTiet);
        return {
          ...item,
          tenSanPham: prod?.tenSanPham || '-',
          mauSac: prod?.mauSac || '-',
          kichThuoc: prod?.kichThuoc || '-',
          // Sử dụng giá tại thời điểm mua hàng, KHÔNG lấy giá hiện tại
          giaBan: item.gia || 0,
          giaBanGiamGia: null, // Không áp dụng khuyến mãi hiện tại cho đơn hàng cũ
        };
      });
      setChiTietSanPham(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorDetail(err.message || 'Lỗi khi lấy chi tiết hóa đơn');
      setChiTietSanPham([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleShowDetailPOS = (order) => {
    setSelectedOrderPOS(order);
    setShowDetailModalPOS(true);
    if (Array.isArray(order.donHangChiTiets) && order.donHangChiTiets.length > 0) {
      // Join với products nếu có (KHÔNG thay đổi giá)
      const data = order.donHangChiTiets.map(item => {
        const prod = products.find(p => p.id === item.idSanPhamChiTiet);
        return {
          ...item,
          tenSanPham: prod?.tenSanPham || '-',
          mauSac: prod?.mauSac || '-',
          kichThuoc: prod?.kichThuoc || '-',
          // Sử dụng giá tại thời điểm mua hàng, KHÔNG lấy giá hiện tại
          giaBan: item.gia || 0,
          giaBanGiamGia: null, // Không áp dụng khuyến mãi hiện tại cho đơn hàng cũ
        };
      });
      setChiTietSanPham(data);
    } else {
      fetchChiTietSanPham(order.id);
    }
  };

  const handleCloseDetailPOS = () => {
    setShowDetailModalPOS(false);
    setSelectedOrderPOS(null);
    setChiTietSanPham([]);
    setErrorDetail('');
  };

  const getTenKhachHang = (id) => {
    if (!id) return 'Khách vãng lai';
    const kh = customers.find(c => c.id === id || c.id === Number(id));
    return kh?.tenKhachHang || 'Khách vãng lai';
  };

  // Hàm xử lý hủy đơn hàng online
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`http://localhost:8080/api/donhang/huy/${selectedOrderToCancel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ghiChu: cancelReason.trim() })
      });

      if (!response.ok) {
        throw new Error('Lỗi khi hủy đơn hàng');
      }

      // Đóng modal và refresh dữ liệu
      setShowCancelModal(false);
      setSelectedOrderToCancel(null);
      setCancelReason('');
      
      // Refresh lại danh sách đơn hàng
      fetchOrdersOnline(Number(filterStatus));
      
      alert('Đã hủy đơn hàng thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Hàm mở modal hủy đơn hàng
  const openCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Hàm đóng modal hủy đơn hàng
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderToCancel(null);
    setCancelReason('');
  };

  const fetchOrdersPOS = async () => {
    setLoadingPOS(true);
    setErrorPOS('');
    try {
      // Sử dụng API cũ để lấy đơn hàng POS
      const res = await fetch('http://localhost:8080/api/donhang/getAllHoanThanh');
      if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu đơn hàng POS');
      
      let data = await res.json();
      
      // Debug: Log dữ liệu gốc từ API
      console.log('=== RAW DATA FROM API (getAllHoanThanh) ===');
      console.log('Total orders:', data.length);
      if (data.length > 0) {
        console.log('Sample order structure:', data[0]);
        console.log('Available fields:', Object.keys(data[0]));
      }
      console.log('========================');
      
      // ✅ THÊM: Nếu dữ liệu thiếu thông tin nhân viên, fetch bổ sung
      if (Array.isArray(data) && data.length > 0) {
        const enhancedData = await Promise.all(data.map(async (order) => {
          // Nếu thiếu thông tin nhân viên, fetch bổ sung
          if (!order.tenNhanVien && order.idnhanVien) {
            try {
              const nhanVienRes = await fetch(`http://localhost:8080/api/nhanvien/${order.idnhanVien}`);
              if (nhanVienRes.ok) {
                const nhanVien = await nhanVienRes.json();
                order.tenNhanVien = nhanVien.tenNhanVien || nhanVien.ten || 'Không xác định';
              }
            } catch (err) {
              console.warn(`Không thể fetch thông tin nhân viên cho order ${order.id}:`, err);
              order.tenNhanVien = 'Không xác định';
            }
          }
          
          // Nếu thiếu thông tin khách hàng, fetch bổ sung
          if (!order.tenKhachHang && order.idkhachHang) {
            try {
              const khachHangRes = await fetch(`http://localhost:8080/api/khachhang/${order.idkhachHang}`);
              if (khachHangRes.ok) {
                const khachHang = await khachHangRes.json();
                order.tenKhachHang = khachHang.tenKhachHang || khachHang.ten || 'Khách vãng lai';
              }
            } catch (err) {
              console.warn(`Không thể fetch thông tin khách hàng cho order ${order.id}:`, err);
              order.tenKhachHang = 'Khách vãng lai';
            }
          }
          
          return order;
        }));
        
        data = enhancedData;
      }
      
      // Sắp xếp theo ngày mua từ mới nhất đến cũ nhất
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        // Ưu tiên ngayMua trước, nếu không có thì dùng ngayTao
        const getDateValue = (order) => {
          const dateStr = order.ngayMua || order.ngayTao;
          if (!dateStr) return new Date(0);
          
          // Kiểm tra format date
          console.log(`Parsing date: "${dateStr}" for order ${order.id}`);
          const date = new Date(dateStr);
          
          // Kiểm tra xem date có hợp lệ không
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date: "${dateStr}" for order ${order.id}`);
            return new Date(0);
          }
          
          return date;
        };
        
        const dateA = getDateValue(a);
        const dateB = getDateValue(b);
        
        // Debug: Log để kiểm tra thứ tự sắp xếp
        console.log(`Comparing: Order ${a.id} (${dateA}) vs Order ${b.id} (${dateB})`);
        
        // Nếu cùng ngày, sắp xếp theo ID giảm dần (mới nhất trước)
        if (dateA.getTime() === dateB.getTime()) {
          console.log(`Same date, sorting by ID: ${b.id} vs ${a.id}`);
          return b.id - a.id; // ID lớn hơn (mới hơn) lên đầu
        }
        
        return dateB - dateA; // Sắp xếp giảm dần theo ngày (mới nhất trước)
      }) : [];
      
      // Debug: Log kết quả sắp xếp cuối cùng
      console.log('=== FINAL SORTED ORDERS ===');
      sortedData.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.id}: ngayMua=${order.ngayMua}, ngayTao=${order.ngayTao}, nhanVien=${order.tenNhanVien}`);
      });
      console.log('===========================');
      
      setOrdersPOS(sortedData);
    } catch (err) {
      console.error('❌ Error fetching POS orders:', err);
      setErrorPOS(err.message || 'Lỗi không xác định');
    } finally {
      setLoadingPOS(false);
    }
  };

  // Render filter trạng thái và ô tìm kiếm
  const renderFilterBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 8px 0', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8 }}>
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
          >{tt.label}</button>
        ))}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm kiếm tên khách hàng, số điện thoại..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e3e8ee',
            minWidth: 280,
            fontSize: 15,
          }}
        />
        
        {/* Bộ lọc từ ngày */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Từ:</label>
          <input
            type="date"
            value={searchFromDateOnline}
            onChange={e => setSearchFromDateOnline(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
          />
        </div>
        
        {/* Bộ lọc đến ngày */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Đến:</label>
          <input
            type="date"
            value={searchToDateOnline}
            onChange={e => setSearchToDateOnline(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
          />
        </div>
        
        {/* Nút tìm kiếm */}
        <button
          onClick={searchOrdersOnline}
          disabled={isSearchingOnline}
          style={{
            padding: '8px 20px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            opacity: isSearchingOnline ? 0.7 : 1,
          }}
        >
          {isSearchingOnline ? '🔍 Đang tìm...' : '🔍 Tìm kiếm'}
        </button>
        
        {/* Nút reset */}
        <button
          onClick={resetSearchOnline}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>  
  );

  // Render filter tìm kiếm đơn hàng POS
  const renderPOSSearchBar = () => (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '12px', 
      margin: '24px 0 16px 0',
      border: '1px solid #e3e8ee'
    }}>
      <h4 style={{ color: '#1976d2', marginBottom: '16px', fontSize: '18px' }}>
        🔍 Tìm kiếm đơn hàng POS
      </h4>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Tên khách hàng */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Tên khách hàng:</label>
          <input
            type="text"
            placeholder="Nhập tên khách hàng..."
            value={searchCustomerName}
            onChange={e => setSearchCustomerName(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
              minWidth: 180,
            }}
          />
        </div>

        {/* Từ ngày */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Từ ngày:</label>
          <input
            type="date"
            value={searchFromDate}
            onChange={e => setSearchFromDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
            title="Tìm theo ngày mua"
          />
        </div>

        {/* Đến ngày */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Đến ngày:</label>
          <input
            type="date"
            value={searchToDate}
            onChange={e => setSearchToDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
            title="Tìm theo ngày mua"
          />
        </div>

        {/* Trạng thái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Trạng thái:</label>
          <select
            value={searchStatus}
            onChange={e => setSearchStatus(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 14,
              minWidth: 140,
            }}
          >
            <option value={-1}>Tất cả</option>
            <option value={0}>Chờ thanh toán</option>
            <option value={1}>Đã thanh toán</option>
          </select>
        </div>

        {/* Nút tìm kiếm */}
        <button
          onClick={searchOrdersPOS}
          disabled={isSearchingPOS}
          style={{
            padding: '8px 20px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            opacity: isSearchingPOS ? 0.7 : 1,
          }}
        >
          {isSearchingPOS ? 'Đang tìm...' : '🔍 Tìm kiếm'}
        </button>

        {/* Nút reset */}
        <button
          onClick={resetSearchPOS}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          🔄 Reset
        </button>

        {/* Nút test sắp xếp */}
        {/* <button
          onClick={() => {
            console.log('=== CURRENT ORDERS ===');
            ordersPOS.forEach((order, index) => {
              console.log(`${index + 1}. Order #${order.id}: ngayMua="${order.ngayMua}", ngayTao="${order.ngayTao}"`);
            });
            console.log('=====================');
          }}
          style={{
            padding: '8px 16px',
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
          title="Kiểm tra thứ tự hiện tại"
        >
          🔍 Check Order
        </button> */}
      </div>
    </div>
  );

  // Render bảng danh sách đơn hàng POS
  const renderOrdersPOS = (orders) => (
    <div style={{ padding: '0 24px 24px 24px' }}>
      {/* Thông báo kết quả tìm kiếm */}
      {isSearchingPOS && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '12px 16px', 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #2196f3',
          color: '#1976d2',
          fontWeight: 500
        }}>
          🔍 Đang tìm kiếm đơn hàng POS...
        </div>
      )}
      
      {/* Hiển thị thông tin tìm kiếm nếu có */}
      {(searchCustomerName || searchFromDate || searchToDate || searchStatus >= 0) && !isSearchingPOS && (
        <div style={{ 
          background: '#f3e5f5', 
          padding: '12px 16px', 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #9c27b0',
          color: '#7b1fa2',
          fontWeight: 500
        }}>
          📊 Kết quả tìm kiếm: {orders.length} đơn hàng
          {(searchCustomerName || searchFromDate || searchToDate || searchStatus >= 0) && (
            <span style={{ fontSize: '14px', fontWeight: 400 }}>
              {searchCustomerName && ` • Tên KH: "${searchCustomerName}"`}
              {searchFromDate && ` • Từ: ${searchFromDate}`}
              {searchToDate && ` • Đến: ${searchToDate}`}
              {searchStatus >= 0 && ` • Trạng thái: ${searchStatus === 0 ? 'Chờ thanh toán' : 'Đã thanh toán'}`}
              <br />
              <small style={{ color: '#666' }}>💡 Tìm kiếm theo ngày mua</small>
            </span>
          )}
        </div>
      )}
      
      <table style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', overflow: 'hidden' }}>
      <thead>
        <tr style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 700 }}>
          <th style={{ padding: 12 }}>Mã đơn</th>
          <th style={{ padding: 12 }}>Nhân viên</th>
          <th style={{ padding: 12 }}>Khách hàng</th>
          <th style={{ padding: 12 }}>Ngày tạo</th>
          <th style={{ padding: 12 }}>Ngày Thanh Toán</th>
          <th style={{ padding: 12 }}>Tổng tiền</th>
          <th style={{ padding: 12 }}>Trạng thái</th>
          <th style={{ padding: 12 }}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 24 }}>Không có đơn hàng nào</td></tr>
        ) : (
          orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #e3e8ee', fontSize: 16 }}>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>#{order.id}</td>
              <td style={{ padding: 12 }}>{order.tenNhanVien || '-'}</td>
              <td style={{ padding: 12 }}>{getTenKhachHang(order.idkhachHang)}</td>
              <td style={{ padding: 12 }}>{order.ngayTao || '-'}</td>
              <td style={{ padding: 12 }}>{order.ngayMua || '-'}</td>
              <td style={{ padding: 12, color: '#1976d2', fontWeight: 700 }}>{order.tongTien?.toLocaleString()} đ</td>
              <td style={{ padding: 12 }}>
                <span style={{
                  background: order.trangThai === 1 ? '#43b244' : '#ff9800',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '4px 14px',
                  fontWeight: 600,
                  fontSize: 15,
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}>{order.trangThai === 1 ? 'Đã thanh toán' : 'Chờ thanh toán'}</span>
              </td>
              <td style={{ padding: 12 }}>
                <button style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/admin-panel/pos-orders/${order.id}`)}>
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
  );

  // Render modal chi tiết đơn hàng POS
  const renderDetailModalPOS = () => {
    if (!showDetailModalPOS || !selectedOrderPOS) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ background: '#fff', borderRadius: 12, minWidth: 400, maxWidth: 800, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 18 }}>Chi tiết sản phẩm trong hóa đơn #{selectedOrderPOS.id}</h3>
          {loadingDetail ? (
            <div style={{ color: '#1976d2', padding: 24, textAlign: 'center' }}>Đang tải chi tiết sản phẩm...</div>
          ) : errorDetail ? (
            <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{errorDetail}</div>
          ) : Array.isArray(chiTietSanPham) && chiTietSanPham.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e3f0ff' }}>
                  <th style={{ padding: 8 }}>Tên</th>
                  <th style={{ padding: 8 }}>Màu</th>
                  <th style={{ padding: 8 }}>Size</th>
                  <th style={{ padding: 8 }}>Giá</th>
                  <th style={{ padding: 8 }}>SL</th>
                  <th style={{ padding: 8 }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {chiTietSanPham.map((sp, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8 }}>{sp.tenSanPham || '-'}</td>
                    <td style={{ padding: 8 }}>{sp.mauSac || '-'}</td>
                    <td style={{ padding: 8 }}>{sp.kichThuoc || '-'}</td>
                    <td style={{ padding: 8 }}>
                      {sp.giaBanGiamGia && sp.giaBanGiamGia < sp.giaBan ? (
                        <div>
                          <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                            {sp.giaBan?.toLocaleString()} đ
                          </div>
                          <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            {sp.giaBanGiamGia?.toLocaleString()} đ
                          </div>
                        </div>
                      ) : (
                        <span>{sp.gia?.toLocaleString() || '-'} đ</span>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>{sp.soLuong || '-'}</td>
                    <td style={{ padding: 8 }}>
                      {sp.giaBanGiamGia && sp.giaBanGiamGia < sp.giaBan ? (
                        <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                          {(sp.giaBanGiamGia * sp.soLuong).toLocaleString()} đ
                        </div>
                      ) : (
                        <span>{sp.thanhTien?.toLocaleString() || '-'} đ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic', margin: '24px 0' }}>Không có sản phẩm trong hóa đơn này.</div>
          )}
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <button onClick={handleCloseDetailPOS} style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Đóng</button>
          </div>
        </div>
      </div>
    );
  };

  // Render bảng danh sách đơn hàng online (nâng cấp UI, badge trạng thái, nút thao tác)
  const renderOrdersOnline = (orders) => (
    <div style={{ width: '100%', marginTop: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', overflow: 'hidden', borderCollapse: 'collapse' }}>
      {renderFilterBar()}
      
      {/* Thông báo kết quả tìm kiếm */}
      {isSearchingOnline && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '12px 16px', 
          borderRadius: 8, 
          margin: '0 24px 16px 24px',
          border: '1px solid #2196f3',
          color: '#1976d2',
          fontWeight: 500
        }}>
          🔍 Đang tìm kiếm đơn hàng online...
        </div>
      )}
      
      {/* Hiển thị thông tin tìm kiếm nếu có */}
      {(searchText || searchFromDateOnline || searchToDateOnline) && !isSearchingOnline && (
        <div style={{ 
          background: '#f3e5f5', 
          padding: '12px 16px', 
          borderRadius: 8, 
          margin: '0 24px 16px 24px',
          border: '1px solid #9c27b0',
          color: '#7b1fa2',
          fontWeight: 500
        }}>
          📊 Kết quả tìm kiếm: {orders.length} đơn hàng
          {(searchText || searchFromDateOnline || searchToDateOnline) && (
            <span style={{ fontSize: '14px', fontWeight: 400 }}>
              {searchText && ` • Từ khóa: "${searchText}"`}
              {searchFromDateOnline && ` • Từ: ${searchFromDateOnline}`}
              {searchToDateOnline && ` • Đến: ${searchToDateOnline}`}
              <br />
              <small style={{ color: '#666' }}>💡 Tìm kiếm theo tên, SĐT và ngày tạo</small>
            </span>
          )}
        </div>
      )}
      
      {/* ✅ THÊM: Thông báo đặc biệt cho đơn hàng giao hàng không thành công */}
      {filterStatus === 7 && !isSearchingOnline && (
        <div style={{ 
          background: '#fff3e0', 
          padding: '12px 16px', 
          borderRadius: 8, 
          margin: '0 24px 16px 24px',
          border: '1px solid #ff9800',
          color: '#e65100',
          fontWeight: 500
        }}>
          ⚠️ Đơn hàng giao hàng không thành công: {orders.length} đơn hàng
          <br />
          <small style={{ color: '#666' }}>💡 Các đơn hàng này đã được đánh dấu là giao hàng không thành công. Bạn có thể xem chi tiết để biết thêm thông tin.</small>
        </div>
      )}
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 700 }}>
            <th style={{ padding: 12 }}>STT</th>
            <th style={{ padding: 12 }}>Mã đơn hàng</th>
            <th style={{ padding: 12 }}>Tên khách hàng</th>
            <th style={{ padding: 12 }}>Ngày tạo</th>
            <th style={{ padding: 12 }}>Số khách</th>
            <th style={{ padding: 12 }}>Thành tiền</th>
            <th style={{ padding: 12 }}>Trạng thái</th>
            {(filterStatus === 5 || filterStatus === 7) && (
              <th style={{ padding: 12, minWidth: 260 }}>
                {filterStatus === 5 ? 'Lý do hủy' : 'Lý do giao hàng không thành công'}
              </th>
            )}
            <th style={{ padding: 12 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={(filterStatus === 5 || filterStatus === 7) ? 9 : 8} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                Không có đơn hàng online nào
              </td>
            </tr>
          ) : (
            orders.map((order, idx) => {
              const trangThaiObj = TRANG_THAI.find(t => t.value === order.trangThai) || TRANG_THAI[0];
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #e3e8ee', fontSize: 16 }}>
                  <td style={{ padding: 12, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>{order.maDon}</td>
                  <td style={{ padding: 12 }}>{order.tenNguoiNhan || 'Chưa có thông tin'}</td>
                  <td style={{ padding: 12 }}>{order.ngayTao}</td>
                  <td style={{ padding: 12 }}>{order.soDienThoaiGiaoHang|| '---'}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{order.thanhTien?.toLocaleString()}đ</td>
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
                    <td style={{ padding: 12, minWidth: 280, maxWidth: 420 }} title={order.ghiChu || 'Chưa có lý do'}>
                      <span style={{
                        color: filterStatus === 5 ? '#d32f2f' : '#9c27b0',
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {order.ghiChu ? order.ghiChu : 'Chưa có lý do'}
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
                        cursor: 'pointer',
                        marginRight: 8,
                        fontSize: '13px'
                      }}
                      onClick={() => navigate(`/admin-panel/orders/${order.id}`)}
                    >Chi tiết</button>
                    {order.trangThai === 3 && (
                      <button
                        style={{
                          padding: '6px 16px',
                          background: '#ff9800',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginRight: 8
                        }}
                        // onClick={...} // TODO: Thêm logic xác nhận đơn nếu cần
                      >Xác nhận</button>
                    )}

                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // Giao diện
  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#f6f8fa' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24, letterSpacing: 1 }}>Quản lý đơn hàng</h2>
      <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
        <button
          style={{
            flex: 1,
            padding: '14px 0',
            border: 'none',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 0,
            background: activeTab === 'POS' ? '#1976d2' : '#e3f0ff',
            color: activeTab === 'POS' ? '#fff' : '#1976d2',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: activeTab === 'POS' ? '0 4px 16px rgba(25,118,210,0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('POS')}
        >
          <span role="img" aria-label="pos">🧾</span> Đơn hàng POS
        </button>
        <button
          style={{
            flex: 1,
            padding: '14px 0',
            border: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 16,
            background: activeTab === 'ONLINE' ? '#1976d2' : '#e3f0ff',
            color: activeTab === 'ONLINE' ? '#fff' : '#1976d2',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: activeTab === 'ONLINE' ? '0 4px 16px rgba(25,118,210,0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('ONLINE')}
        >
          <span role="img" aria-label="online">🌐</span> Đơn hàng Online
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 2px 8px rgba(25,118,210,0.04)', padding: 0, minHeight: 320 }}>
        {activeTab === 'POS' && (
          <>
            {renderPOSSearchBar()}
            {loadingPOS ? <div style={{ padding: 32, textAlign: 'center', color: '#1976d2' }}>Đang tải dữ liệu...</div>
            : errorPOS ? <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>{errorPOS}</div>
            : renderOrdersPOS(ordersPOS)}
          </>
        )}
        {activeTab === 'ONLINE' && (
          loadingOnline ? <div style={{ padding: 32, textAlign: 'center', color: '#1976d2' }}>Đang tải dữ liệu...</div>
          : errorOnline ? <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>{errorOnline}</div>
          : renderOrdersOnline(filteredOrdersOnline)
        )}
      </div>
      {activeTab === 'POS' && renderDetailModalPOS()}
      
      {/* Modal hủy đơn hàng online */}
      {showCancelModal && selectedOrderToCancel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ 
            background: '#fff', borderRadius: 12, minWidth: 400, maxWidth: 500, 
            padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' 
          }}>
            <h3 style={{ color: '#e53935', marginBottom: 20, textAlign: 'center' }}>
              🚫 Hủy đơn hàng #{selectedOrderToCancel.maDon}
            </h3>
            
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: '#666', marginBottom: 16, textAlign: 'center' }}>
                Đơn hàng này đang ở trạng thái <strong>"Đang giao"</strong>.<br/>
                Vui lòng nhập lý do giao hàng không thành công:
              </p>
              
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do giao hàng không thành công... (bắt buộc)"
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: 14,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={closeCancelModal}
                disabled={isCancelling}
                style={{
                  padding: '10px 24px',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                  opacity: isCancelling ? 0.7 : 1,
                }}
              >
                Hủy bỏ
              </button>
              
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                style={{
                  padding: '10px 24px',
                  background: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                  opacity: (isCancelling || !cancelReason.trim()) ? 0.7 : 1,
                }}
              >
                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonHangPage;