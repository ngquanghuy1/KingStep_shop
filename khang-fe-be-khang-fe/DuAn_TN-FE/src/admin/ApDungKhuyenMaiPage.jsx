import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Checkbox, Button, message, Space, Typography, Tag, Row, Col, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import '../styles/AdminPanel.css';

const { Title, Text } = Typography;

const ApDungKhuyenMaiPage = () => {
  const { khuyenMaiId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listSPCT, setListSPCT] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [selectedSPCTIds, setSelectedSPCTIds] = useState([]);
  
  // State cho bộ lọc
  const [filterTenSanPham, setFilterTenSanPham] = useState('');
  const [filterMauSac, setFilterMauSac] = useState('');
  const [filterKichThuoc, setFilterKichThuoc] = useState('');

  useEffect(() => {
    fetchPromotionDetails();
    fetchSPCTList();
  }, [khuyenMaiId]);

  const fetchPromotionDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/khuyenmai/${khuyenMaiId}`);
      setPromotion(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin khuyến mãi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Không thể tải thông tin khuyến mãi',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    }
  };

  const fetchSPCTList = async () => {
    setLoading(true);
    try {
      // Sử dụng API mới để lấy sản phẩm có thể áp dụng khuyến mãi
      const response = await axios.get(`http://localhost:8080/api/san-pham-chi-tiet/available-for-promotion/${khuyenMaiId}`);
      
      // Debug log để xem cấu trúc dữ liệu
      if (response.data && response.data.length > 0) {
        
      }
      
      setListSPCT(response.data);
      
      // Tự động tích các sản phẩm đã áp dụng khuyến mãi này
      const selectedIds = response.data
        .filter(spct => spct.khuyenMai && spct.khuyenMai.id === parseInt(khuyenMaiId))
        .map(spct => spct.id);
      setSelectedSPCTIds(selectedIds);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm chi tiết:', error);
      Swal.fire({
        icon: 'error',
        title: 'Không thể tải danh sách sản phẩm',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      setListSPCT([]);
      setSelectedSPCTIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyKhuyenMai = async () => {
    if (!khuyenMaiId || selectedSPCTIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng chọn sản phẩm chi tiết!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        width: 250
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`http://localhost:8080/api/khuyen-mai/ap-dung/${khuyenMaiId}`, selectedSPCTIds);
      
      Swal.fire({
        icon: 'success',
        title: 'Áp dụng khuyến mãi thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      
      // Refresh lại danh sách sản phẩm để cập nhật giá
      await fetchSPCTList();
      
      // Chờ 1 giây rồi mới chuyển trang
      setTimeout(() => {
        navigate('/admin-panel/promotions');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi áp dụng khuyến mãi:', error);
      let errorMessage = 'Áp dụng thất bại!';
      if (error.response && error.response.data) {
        errorMessage = error.response.data;
      }
      Swal.fire({
        icon: 'error',
        title: errorMessage,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        width: 350
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromotion = async () => {
    // Lấy danh sách sản phẩm đã được áp dụng khuyến mãi này
    const appliedProducts = listSPCT.filter(spct => 
      spct.khuyenMai && spct.khuyenMai.id === parseInt(khuyenMaiId)
    );
    
    if (appliedProducts.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Không có sản phẩm nào đang áp dụng khuyến mãi này',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        width: 300
      });
      return;
    }

    try {
      setLoading(true);
      const productIds = appliedProducts.map(spct => spct.id);
      await axios.post(`http://localhost:8080/api/khuyen-mai/${khuyenMaiId}/bo-ap-dung`, productIds);
      
      Swal.fire({
        icon: 'success',
        title: 'Bỏ áp dụng khuyến mãi thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      
      // Refresh danh sách sản phẩm
      fetchSPCTList();
    } catch (error) {
      console.error('Lỗi khi bỏ áp dụng khuyến mãi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Bỏ áp dụng thất bại!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        width: 250
      });
    } finally {
      setLoading(false);
    }
  };

  // Tính giá sau khuyến mãi
  const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!originalPrice || !discountPercent) return originalPrice;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + '₫' : '...';
  };

  // Hàm helper để lấy tên sản phẩm an toàn
  const getProductName = (spct) => {
    if (typeof spct.tenSanPham === 'string') return spct.tenSanPham;
    if (spct.sanPham?.tenSanPham) return spct.sanPham.tenSanPham;
    return 'SP';
  };

  // Hàm helper để lấy tên màu sắc an toàn
  const getColorName = (spct) => {
    if (typeof spct.mauSac === 'string') return spct.mauSac;
    if (spct.mauSac?.tenMauSac) return spct.mauSac.tenMauSac;
    return '...';
  };

  // Hàm helper để lấy tên kích thước an toàn
  const getSizeName = (spct) => {
    if (typeof spct.kichThuoc === 'string') return spct.kichThuoc;
    if (spct.kichThuoc?.tenKichThuoc) return spct.kichThuoc.tenKichThuoc;
    return '...';
  };

  // Hàm helper để lấy hình ảnh an toàn
  const getProductImage = (spct) => {
    // Thử nhiều cách để lấy ảnh từ sản phẩm chi tiết
    let images = spct.images || spct.sanPham?.images || spct.sanPham?.imanges;
    
    
    
    if (!images) return '/logo192.png';
    
    // Nếu là mảng, lấy phần tử đầu
    if (Array.isArray(images)) {
      const img = images[0];
      if (!img) return '/logo192.png';
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return 'http://localhost:8080' + img;
      return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
    }
    
    // Nếu là chuỗi nhiều ảnh, lấy ảnh đầu
    if (typeof images === 'string' && images.includes(',')) {
      const img = images.split(',')[0].trim();
      if (!img) return '/logo192.png';
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return 'http://localhost:8080' + img;
      return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
    }
    
    // Nếu là chuỗi đơn
    if (typeof images === 'string') {
      const img = images.trim();
      if (!img) return '/logo192.png';
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return 'http://localhost:8080' + img;
      return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
    }
    
    return '/logo192.png';
  };

  // Lọc sản phẩm theo filter
  const filteredListSPCT = listSPCT.filter(spct => {
    const tenSanPham = getProductName(spct).toLowerCase();
    const mauSac = getColorName(spct).toLowerCase();
    const kichThuoc = getSizeName(spct).toLowerCase();
    
    const matchTenSanPham = !filterTenSanPham || tenSanPham.includes(filterTenSanPham.toLowerCase());
    const matchMauSac = !filterMauSac || mauSac.includes(filterMauSac.toLowerCase());
    const matchKichThuoc = !filterKichThuoc || kichThuoc.includes(filterKichThuoc.toLowerCase());
    
    return matchTenSanPham && matchMauSac && matchKichThuoc;
  });

  // Lấy danh sách màu sắc và kích thước duy nhất cho filter
  const uniqueMauSac = [...new Set(listSPCT.map(spct => getColorName(spct)).filter(Boolean))];
  const uniqueKichThuoc = [...new Set(listSPCT.map(spct => getSizeName(spct)).filter(Boolean))];

  // Kiểm tra khuyến mãi có đang hoạt động không
  const isPromotionActive = (promotion) => {
    if (!promotion) return false;
    
    const now = moment();
    const startDate = moment(promotion.ngayBatDau);
    const endDate = moment(promotion.ngayKetThuc);
    
    return now.isBetween(startDate, endDate, null, '[]');
  };

  // Lấy trạng thái khuyến mãi
  const getPromotionStatus = (promotion) => {
    if (!promotion) return { text: 'Không xác định', color: 'default' };
    
    const now = moment();
    const startDate = moment(promotion.ngayBatDau);
    const endDate = moment(promotion.ngayKetThuc);
    
    if (now.isBefore(startDate)) {
      return { text: 'Chưa bắt đầu', color: 'orange' };
    } else if (now.isAfter(endDate)) {
      return { text: 'Đã hết hạn', color: 'red' };
    } else {
      return { text: 'Đang hoạt động', color: 'green' };
    }
  };

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin-panel/promotions')}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Áp Dụng Khuyến Mãi
          </Title>
        </Space>
      </div>

      {promotion && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>Thông Tin Khuyến Mãi</Title>
          <Space direction="vertical" size="small">
            <Text><strong>Tên khuyến mãi:</strong> {promotion.tenKhuyenMai}</Text>
            <Text><strong>Giá trị:</strong> {promotion.giaTri}%</Text>
            <Text><strong>Trạng thái:</strong> 
              <Tag color={getPromotionStatus(promotion).color}>
                {getPromotionStatus(promotion).text}
              </Tag>
            </Text>
            <Text><strong>Thời gian:</strong> {moment(promotion.ngayBatDau).format('DD/MM/YYYY HH:mm')} - {moment(promotion.ngayKetThuc).format('DD/MM/YYYY HH:mm')}</Text>
          </Space>
          
          {/* Hiển thị cảnh báo nếu khuyến mãi không trong thời gian hoạt động */}
          {!isPromotionActive(promotion) && (
            <div style={{ marginTop: 16 }}>
              <Tag color="warning" style={{ fontSize: '14px', padding: '8px 12px' }}>
                ⚠️ Khuyến mãi {getPromotionStatus(promotion).text.toLowerCase()} - Không thể áp dụng cho sản phẩm
              </Tag>
            </div>
          )}
        </Card>
      )}

      <Card
        title={`Chọn Sản Phẩm Chi Tiết (${selectedSPCTIds.length} sản phẩm đã chọn)`}
        extra={
          <Space>
            <Button
              danger
              onClick={handleRemovePromotion}
              loading={loading}
              title="Bỏ áp dụng khuyến mãi khỏi tất cả sản phẩm"
            >
              Bỏ Áp Dụng
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleApplyKhuyenMai}
              loading={loading}
              disabled={selectedSPCTIds.length === 0 || !isPromotionActive(promotion)}
              title={!isPromotionActive(promotion) ? `Khuyến mãi ${getPromotionStatus(promotion).text.toLowerCase()}` : 'Áp dụng khuyến mãi cho sản phẩm'}
            >
              Áp Dụng Khuyến Mãi
            </Button>
          </Space>
        }
      >
        {/* Bộ lọc sản phẩm */}
        <div style={{ marginBottom: 16, padding: '16px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: '#333' }}>🔍 Bộ lọc sản phẩm:</div>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Tên sản phẩm:</div>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={filterTenSanPham}
                onChange={(e) => setFilterTenSanPham(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Màu sắc:</div>
              <select
                value={filterMauSac}
                onChange={(e) => setFilterMauSac(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">Tất cả màu sắc</option>
                {uniqueMauSac.map(mau => (
                  <option key={mau} value={mau}>{mau}</option>
                ))}
              </select>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Kích thước:</div>
              <select
                value={filterKichThuoc}
                onChange={(e) => setFilterKichThuoc(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">Tất cả kích thước</option>
                {uniqueKichThuoc.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </Col>
          </Row>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              📊 Hiển thị {filteredListSPCT.length}/{listSPCT.length} sản phẩm
            </Text>
            {(filterTenSanPham || filterMauSac || filterKichThuoc) && (
              <Button
                size="small"
                onClick={() => {
                  setFilterTenSanPham('');
                  setFilterMauSac('');
                  setFilterKichThuoc('');
                }}
                style={{ fontSize: 12 }}
              >
                🔄 Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text>Đang tải danh sách sản phẩm...</Text>
          </div>
        ) : (
          <Checkbox.Group
            style={{ width: '100%' }}
            value={selectedSPCTIds}
            onChange={setSelectedSPCTIds}
          >
            <Row>
              {filteredListSPCT && filteredListSPCT.length > 0 ? filteredListSPCT.map(spct => {
                const originalPrice = spct.giaBan || 0;
                const discountedPrice = calculateDiscountedPrice(originalPrice, promotion?.giaTri);
                const isSelected = selectedSPCTIds.includes(spct.id);
                
                return (
                  <Col span={24} key={spct.id} style={{ marginBottom: 8 }}>
                    <Checkbox value={spct.id} style={{ width: '100%' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                     <img
                             src={getProductImage(spct)}
                             alt={getProductName(spct)}
                             style={{ 
                               width: 40, 
                               height: 40, 
                               objectFit: 'cover', 
                               borderRadius: 4, 
                               border: '1px solid #eee', 
                               marginRight: 8, 
                               background: '#fafafa' 
                             }}
                             onError={(e) => {
                               
                               e.target.src = "/logo192.png";
                             }}
                           />
                         <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: 600 }}>{getProductName(spct)}</div>
                           <div style={{ fontSize: 13, color: '#555' }}>
                             Màu: <span style={{ fontWeight: 500 }}>{getColorName(spct)}</span> | 
                             Size: <span style={{ fontWeight: 500 }}>{getSizeName(spct)}</span>
                           </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            {/* Giá gốc */}
                            <Text 
                              delete 
                              style={{ 
                                fontSize: 13, 
                                color: '#999',
                                textDecoration: isSelected ? 'line-through' : 'none'
                              }}
                            >
                              {formatPrice(originalPrice)}
                            </Text>
                            
                            {/* Giá sau khuyến mãi */}
                            {isSelected && promotion && (
                              <Text 
                                style={{ 
                                  fontSize: 14, 
                                  color: '#ff4d4f', 
                                  fontWeight: 600 
                                }}
                              >
                                {formatPrice(discountedPrice)}
                              </Text>
                            )}
                            
                            {/* Badge khuyến mãi */}
                            {isSelected && promotion && (
                              <Tag 
                                color="red" 
                                style={{ 
                                  fontSize: 11, 
                                  padding: '2px 6px',
                                  margin: 0
                                }}
                              >
                                -{promotion.giaTri}%
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Checkbox>
                  </Col>
                );
              }              ) : (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">
                      {listSPCT.length > 0 
                        ? `Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.`
                        : `Không có sản phẩm chi tiết nào.`
                      }
                    </Text>
                  </div>
                </Col>
              )}
            </Row>
          </Checkbox.Group>
        )}
      </Card>
    </div>
  );
};

export default ApDungKhuyenMaiPage; 