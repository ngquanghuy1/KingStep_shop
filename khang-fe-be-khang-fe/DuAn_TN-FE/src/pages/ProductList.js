import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Select, Input, Typography, Spin, Tag, Pagination, Space, Slider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Home.css'

const { Option } = Select;
const { Title, Text } = Typography;

// Ảnh mẫu cho từng loại sản phẩm
const categoryImages = {
  'Sneaker': 'https://images.unsplash.com/photo-1517260911205-8a3b66e655a4?auto=format&fit=crop&w=400&q=80',
  'Thể thao': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  'Chạy bộ': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  'Thời trang': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'Bóng rổ': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  'Adidas': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  'Nike': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
};

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Hàm lấy ảnh sản phẩm:
// - Luôn sử dụng ảnh local trong public/products theo brand + tên sản phẩm
// - Backend chỉ cung cấp tên / brand, không quyết định ảnh hiển thị
const getProductImage = (product) => {
  if (!product?.imanges) return '/logo.png';

  // nếu có nhiều ảnh thì lấy ảnh đầu tiên
  const firstImage = product.imanges.split(',')[0].trim();

  return `http://localhost:8080/images/${firstImage}`;
};

// Hàm hiển thị giá với giá gạch đi
const renderPrice = (product) => {
  // Lấy giá gốc và giá sau giảm tương tự như ở trang Home để tránh hiển thị 0đ
  const giaBanGoc =
    product.giaBanGoc ??
    (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
    product.price ??
    0;

  const giaBanGiamGia =
    product.giaBanSauGiam ??
    product.giaBanGiamGia ??
    null;

  const phanTramGiam = product.phanTramGiam || 0;

  // Nếu có giảm giá hợp lệ
  if (giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBanGoc) {
    return (
      <div style={{ textAlign: 'center', marginBottom: 8, minHeight: 60 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Text strong style={{ color: '#f5222d', fontSize: 18 }}>
            {giaBanGiamGia.toLocaleString()}đ
          </Text>
          <Text delete style={{ color: '#8c8c8c', fontSize: 14 }}>
            {giaBanGoc.toLocaleString()}đ
          </Text>
        </div>
      </div>
    );
  }

  // Nếu không có giảm giá nhưng có phần trăm giảm thì tính lại
  if (phanTramGiam > 0 && giaBanGoc > 0) {
    const giaSauGiam = Math.round(giaBanGoc * (1 - phanTramGiam / 100));
    return (
      <div style={{ textAlign: 'center', marginBottom: 8, minHeight: 60 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Text strong style={{ color: '#f5222d', fontSize: 18 }}>
            {giaSauGiam.toLocaleString()}đ
          </Text>
          <Text delete style={{ color: '#8c8c8c', fontSize: 14 }}>
            {giaBanGoc.toLocaleString()}đ
          </Text>
        </div>
      </div>
    );
  }

  // Nếu không có giảm giá
  return (
    <div style={{ textAlign: 'center', marginBottom: 8, minHeight: 60 }}>
      <Text strong style={{ color: '#f5222d', fontSize: 18 }}>
        {giaBanGoc.toLocaleString()}đ
      </Text>
    </div>
  );
};

function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  // Parse query string
  const params = new URLSearchParams(location.search);
  const initialBrand = params.get('brand');
  const initialCategory = params.get('category');

  // State cho filter
  const [sizeList, setSizeList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [filters, setFilters] = useState({
    size: undefined,
    brand: initialBrand || undefined,
    name: '',
    category: initialCategory || undefined
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [priceRange, setPriceRange] = useState([null, null]);

  // Lấy dữ liệu filter từ API
  useEffect(() => {
    fetch('http://localhost:8080/api/kich-thuoc/getAll')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSizeList(data);
        else if (Array.isArray(data.data)) setSizeList(data.data);
      });
    fetch('http://localhost:8080/api/thuong-hieu/getAll')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBrandList(data);
        else if (Array.isArray(data.data)) setBrandList(data.data);
      });
    fetch('http://localhost:8080/api/danh-muc/getAll')
      .then(res => res.json())
      .then(data => {
        console.log('Danh mục:', data);
        if (Array.isArray(data)) setCategoryList(data);
        else if (Array.isArray(data.data)) setCategoryList(data.data);
      });
  }, []);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/san-pham/getAll')
      .then(res => res.json())
      .then(async (data) => {
        let productsData = [];
        if (Array.isArray(data)) productsData = data;
        else if (Array.isArray(data.products)) productsData = data.products;
        else productsData = [];

        // ✅ THÊM: Fetch giá từ biến thể cho từng sản phẩm
        const productsWithPrices = await Promise.all(
          productsData.map(async (product) => {
            try {
              const variantsResponse = await fetch(`http://localhost:8080/api/san-pham-chi-tiet/${product.id}`);
              if (variantsResponse.ok) {
                const variants = await variantsResponse.json();
                if (variants && variants.length > 0) {
                  // Tìm giá thấp nhất từ tất cả biến thể (hoặc giá đầu tiên nếu không có giá hợp lệ)
                  let minPrice = null;
                  let minDiscountPrice = null;

                  for (const variant of variants) {
                    const variantPrice = variant.giaBan;
                    const variantDiscountPrice = variant.giaBanGiamGia;

                    // Chỉ lấy giá > 0
                    if (variantPrice && variantPrice > 0) {
                      if (minPrice === null || variantPrice < minPrice) {
                        minPrice = variantPrice;
                        // Nếu biến thể này có giá giảm, lấy giá giảm
                        if (variantDiscountPrice && variantDiscountPrice > 0 && variantDiscountPrice < variantPrice) {
                          minDiscountPrice = variantDiscountPrice;
                        } else {
                          minDiscountPrice = null;
                        }
                      }
                    }
                  }

                  // Nếu tìm thấy giá hợp lệ, cập nhật vào product
                  if (minPrice !== null && minPrice > 0) {
                    return {
                      ...product,
                      giaBan: minPrice,
                      giaBanGoc: minPrice,
                      giaBanGiamGia: minDiscountPrice,
                      giaBanSauGiam: minDiscountPrice && minDiscountPrice > 0 ? minDiscountPrice : null
                    };
                  }
                }
              }
            } catch (error) {
              console.warn(`⚠️ Không thể lấy giá cho sản phẩm ${product.id}:`, error);
            }
            return product;
          })
        );

        setProducts(productsWithPrices);
        setLoading(false);
        console.log('data', productsWithPrices);
      })
      .catch(() => setLoading(false));
  }, []);

  // Lọc sản phẩm theo filter
  const filteredProducts = products.filter(product => {
    const matchSize = !filters.size || (product.kichThuoc && (product.kichThuoc.tenKichThuoc === filters.size || product.kichThuoc.size === filters.size));
    const matchBrand = !filters.brand || (product.thuongHieu && (product.thuongHieu.tenThuongHieu === filters.brand || product.thuongHieu.brand === filters.brand));
    const matchName = !filters.name || (product.tenSanPham || product.name || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCategory = !filters.category || (product.danhMuc && (product.danhMuc.tenDanhMuc === filters.category || product.danhMuc.category === filters.category));
    const price =
      product.giaBanSauGiam ??
      product.giaBanGiamGia ??
      (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
      product.price ??
      0;
    const matchPrice =
      (!priceRange[0] || price >= priceRange[0]) &&
      (!priceRange[1] || price <= priceRange[1]);
    return matchSize && matchBrand && matchName && matchCategory && matchPrice;
  });

  // Reset về trang 1 khi filter hoặc giá thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, priceRange]);

  // Tính toán sản phẩm hiển thị theo trang
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedProducts = filteredProducts.slice(startIdx, endIdx);

  return (
    <div className="product-list-page">
      <div className="product-list-inner">
        <div className="product-list-header">
          <Title level={2}>Danh sách sản phẩm</Title>
          <Text className="product-list-subtitle">
            Lọc theo thương hiệu, size, giá và danh mục để tìm đôi giày phù hợp nhất với bạn
          </Text>
        </div>
        {/* Bộ lọc nằm ngang */}
        <div className="product-list-filters">
          <Space size="middle" wrap>
            <Select
              placeholder="Chọn size"
              style={{ width: 140 }}
              allowClear
              value={filters.size}
              onChange={value => setFilters(f => ({ ...f, size: value }))}
            >
              {sizeList.map(size => (
                <Option key={size.id || size} value={size.tenKichThuoc || size.size || size}>{size.tenKichThuoc || size.size || size}</Option>
              ))}
            </Select>
            <Select
              placeholder="Thương hiệu"
              style={{ width: 160 }}
              allowClear
              value={filters.brand}
              onChange={value => setFilters(f => ({ ...f, brand: value }))}
            >
              {brandList.map(brand => (
                <Option key={brand.id || brand} value={brand.tenThuongHieu || brand.brand || brand}>{brand.tenThuongHieu || brand.brand || brand}</Option>
              ))}
            </Select>
            {/* Filter giá */}
            <div style={{ width: 240, padding: '0 8px' }}>
              <Slider
                range
                min={0}
                max={10000000}
                step={50000}
                value={priceRange}
                onChange={setPriceRange}
                tooltip={{ formatter: value => value.toLocaleString() + 'đ' }}
              />
              <div style={{ fontSize: 13, textAlign: 'center' }}>
                Giá từ: <b>{priceRange[0] ? priceRange[0].toLocaleString() : 0}đ</b> đến <b>{priceRange[1] ? priceRange[1].toLocaleString() : 'Tối đa'}đ</b>
              </div>
            </div>
            <Input
              placeholder="Tìm kiếm tên giày..."
              style={{ width: 200 }}
              value={filters.name}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
            />
            <Select
              placeholder="Danh mục"
              style={{ width: 160 }}
              allowClear
              value={filters.category}
              onChange={value => setFilters(f => ({ ...f, category: value }))}
            >
              {categoryList.map(cat => (
                <Option key={cat.id} value={cat.tenDanhMuc}>{cat.tenDanhMuc}</Option>
              ))}
            </Select>
          </Space>
        </div>
        <Row gutter={16}>
          <Col span={24}>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: 80 }}><Spin size="large" /></div>
            ) : (
              <>
                <Row gutter={[24, 24]} justify="start">
                  {pagedProducts.length === 0 && (
                    <Col span={24} style={{ textAlign: 'center', marginTop: 40 }}>
                      <Text type="secondary">Không có sản phẩm phù hợp.</Text>
                    </Col>
                  )}
                  {pagedProducts.map(product => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 16,
                          boxShadow: '0 4px 16px #e0e0e0',
                          height: 480, // Cố định chiều cao
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 8
                        }}
                        cover={
                          <div
                            style={{
                              position: 'relative',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: 220,
                              background: '#fff',
                              borderRadius: 12,
                              cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/products/${product.id}`)}
                            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #1890ff'; }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <img
                              alt={product.tenSanPham || product.name}
                              src={getProductImage(product)}
                              onError={e => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                              style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, cursor: 'pointer' }}
                            />

                            {/* Tag giảm giá */}
                            {product.phanTramGiam > 0 && (
                              <Tag
                                color="red"
                                style={{
                                  position: 'absolute',
                                  top: 12,
                                  left: 12,
                                  fontWeight: 'bold',
                                  fontSize: 12,
                                  padding: '4px 8px',
                                  borderRadius: 12,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                              >
                                -{product.phanTramGiam}%
                              </Tag>
                            )}

                            {/* Tag khuyến mãi nếu có */}
                            {product.tenKhuyenMai && (
                              <Tag
                                color="orange"
                                style={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  fontWeight: 'bold',
                                  fontSize: 11,
                                  padding: '4px 8px',
                                  borderRadius: 12,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                              >
                                {product.tenKhuyenMai}
                              </Tag>
                            )}
                          </div>
                        }
                      >
                        <div style={{ textAlign: 'center', marginBottom: 8, minHeight: 48 }}>
                          <Text strong style={{ fontSize: 16, lineHeight: 1.4 }}>
                            {product.tenSanPham || product.name}
                          </Text>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 8, minHeight: 32 }}>
                          <Tag color="blue" style={{ fontSize: 13, marginBottom: 4 }}>
                            {product.thuongHieu?.tenThuongHieu || product.brand || 'Thương hiệu khác'}
                          </Tag>
                        </div>
                        {renderPrice(product)}
                        <Button type="primary" block style={{ borderRadius: 8 }} onClick={() => navigate(`/products/${product.id}`)}>
                          Xem chi tiết
                        </Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    onChange={page => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ProductList; 