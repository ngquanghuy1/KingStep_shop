import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Divider, Button, Tag, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ErrorBoundary from '../components/ErrorBoundary';
import config from '../config/config';
import '../styles/Home.css';
import UserProfileCard from '../components/UserProfileCard';

const { Title, Text } = Typography;

// Helper function để xử lý thương hiệu an toàn
const getBrandName = (thuongHieu) => {
  if (!thuongHieu) return null;

  if (typeof thuongHieu === 'string') {
    return thuongHieu;
  }

  if (typeof thuongHieu === 'object') {
    // Thử các trường có thể có
    return thuongHieu.tenThuongHieu ||
      thuongHieu.ten ||
      thuongHieu.name ||
      thuongHieu.tenTh ||
      thuongHieu.thuongHieu ||
      thuongHieu.brand ||
      thuongHieu.tenBrand ||
      null;
  }

  return null;
};

function ProductCard({ product }) {
  // Kiểm tra product có tồn tại không
  if (!product) {
    return (
      <Card className="product-card">
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <p>Sản phẩm không tồn tại</p>
        </div>
      </Card>
    );
  }

  // Debug: Log toàn bộ dữ liệu sản phẩm để kiểm tra
  console.log('🔍 Full product data:', product);

  // Debug: Log thông tin khuyến mãi từ API mới
  if (product.idKhuyenMai || product.tenKhuyenMai || product.giaTriKhuyenMai) {
    console.log('🔍 API Khuyến mãi mới:', {
      idKhuyenMai: product.idKhuyenMai,
      tenKhuyenMai: product.tenKhuyenMai,
      giaTriKhuyenMai: product.giaTriKhuyenMai,
      giaBan: product.giaBan,
      giaBanSauGiam: product.giaBanSauGiam
    });
  }

  // Xử lý dữ liệu từ API
  const productName = product.ten ||
    product.name ||
    product.tenSanPham ||
    product.tenSP ||
    product.productName ||
    product.tenSP ||
    'Tên sản phẩm';

  // Debug: Log tên sản phẩm được xử lý
  console.log('🔍 Product ID:', product.id);
  console.log('🔍 ProductName raw:', {
    ten: product.ten,
    name: product.name,
    tenSanPham: product.tenSanPham,
    tenSP: product.tenSP,
    productName: product.productName
  });
  console.log('🔍 ProductName processed:', productName);

  // Xử lý thương hiệu - có thể là object hoặc string
  const productBrand = getBrandName(product.thuongHieu) ||
    product.brand ||
    product.thuongHieu ||
    product.thuongHieuName ||
    null;

  // Debug: Log thông tin thương hiệu
  console.log('🔍 ThuongHieu raw:', product.thuongHieu);
  console.log('🔍 ProductBrand processed:', productBrand);
  console.log('🔍 ProductBrand type:', typeof productBrand);

  // Xử lý giá từ API mới hoặc cũ
  // Ưu tiên dùng giá gốc và giá sau giảm nếu có, tránh trường hợp hiển thị 0đ
  const giaBanGoc =
    product.giaBanGoc ??
    (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
    product.originalPrice ??
    product.price ??
    0;

  const giaBanSauGiam =
    product.giaBanSauGiam ??
    product.giaBanGiamGia ??
    product.discountPrice ??
    null;

  // Giá giảm riêng lẻ nếu backend trả về dạng khác
  const discountPrice = product.giaGiamGia || product.discountPrice || null;

  const productPrice =
    (giaBanSauGiam && giaBanSauGiam > 0 ? giaBanSauGiam : null) ??
    (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
    product.price ??
    0;

  const originalPrice = giaBanGoc || productPrice;

  // Xử lý phần trăm giảm giá từ API mới
  const phanTramGiam = product.phanTramGiam || 0;

  // Xử lý thông tin khuyến mãi từ API mới
  const idKhuyenMai = product.idKhuyenMai || (product.khuyenMai && product.khuyenMai.id);
  const tenKhuyenMai = product.tenKhuyenMai || (product.khuyenMai && product.khuyenMai.tenKhuyenMai);
  const giaTriKhuyenMai = product.giaTriKhuyenMai || (product.khuyenMai && product.khuyenMai.giaTri);

  const slugify = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Xử lý ảnh sản phẩm - kiểm tra nhiều trường có thể có
  let productImage = product.hinhAnh || product.image || product.imanges || null;

  // Nếu imanges là array, lấy ảnh đầu tiên
  if (Array.isArray(productImage)) {
    productImage = productImage[0] || '/unnamed.jpg';
  }

  // Nếu imanges là string chứa nhiều ảnh được phân tách bởi dấu phẩy
  if (typeof productImage === 'string' && productImage.includes(',')) {
    productImage = productImage.split(',')[0].trim() || '/unnamed.jpg';
  }

  // Nếu không có ảnh hoặc ảnh rỗng, fallback về ảnh local trong public/products theo brand + tên sản phẩm
  if (!productImage || productImage === '' || productImage === 'null' || productImage === 'undefined') {
    const name = productName || '';
    const brand = productBrand || '';
    const brandSlug = slugify(brand) || 'other';
    const nameSlug = slugify(name);
    productImage = nameSlug ? `/products/${brandSlug}/${nameSlug}.jpg` : '/unnamed.jpg';
  }

  console.log('🔍 ProductImage processed:', productImage);

  const isNew = product.moi || product.isNew || false;
  const isOnSale = product.giamGia || product.isHotSale || false;
  const hasPromotion = idKhuyenMai || (product.khuyenMai && product.khuyenMai.id);

  // Tính phần trăm giảm giá
  let discountPercentage = 0;
  let discountType = '';

  // Ưu tiên sử dụng dữ liệu từ API mới (phanTramGiam)
  if (phanTramGiam > 0) {
    discountPercentage = phanTramGiam;
    discountType = 'new-api';
  } else if (giaTriKhuyenMai && giaTriKhuyenMai > 0) {
    discountPercentage = giaTriKhuyenMai;
    discountType = 'promotion';
  } else if (giaBanSauGiam && giaBanGoc && giaBanSauGiam < giaBanGoc) {
    discountPercentage = Math.round(((giaBanGoc - giaBanSauGiam) / giaBanGoc) * 100);
    discountType = 'backend';
  } else if (originalPrice > productPrice) {
    discountPercentage = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
    discountType = 'original';
  } else if (discountPrice && discountPrice < productPrice) {
    discountPercentage = Math.round(((productPrice - discountPrice) / productPrice) * 100);
    discountType = 'discount';
  } else if (hasPromotion && product.khuyenMai && product.khuyenMai.giaTri) {
    discountPercentage = product.khuyenMai.giaTri;
    discountType = 'promotion';
  }

  const displayPrice = discountPercentage > 0 ? (
    <div className="price-box">
      <Text strong className="price-sale">
        {(() => {
          // Ưu tiên sử dụng giá sau giảm từ API mới
          if (giaBanSauGiam && giaBanSauGiam < giaBanGoc) {
            return giaBanSauGiam.toLocaleString('vi-VN');
          }
          // Fallback cho các trường hợp khác
          if (discountType === 'new-api' && giaBanSauGiam) {
            return giaBanSauGiam.toLocaleString('vi-VN');
          } else if (discountType === 'promotion' && giaBanSauGiam) {
            return giaBanSauGiam.toLocaleString('vi-VN');
          } else if (discountType === 'backend' && giaBanSauGiam) {
            return giaBanSauGiam.toLocaleString('vi-VN');
          } else if (discountType === 'discount' && discountPrice) {
            return discountPrice.toLocaleString('vi-VN');
          } else if (discountType === 'original' && productPrice < originalPrice) {
            return productPrice.toLocaleString('vi-VN');
          } else {
            // Nếu không có giá sau giảm, tính toán giá giảm
            const calculatedDiscountPrice = giaBanGoc - (giaBanGoc * discountPercentage / 100);
            return Math.round(calculatedDiscountPrice).toLocaleString('vi-VN');
          }
        })()}đ
      </Text>
      <Text delete className="price-original">{giaBanGoc.toLocaleString('vi-VN')}đ</Text>
    </div>
  ) : (
    <Text strong className="price-sale">{giaBanGoc.toLocaleString('vi-VN')}đ</Text>
  );

  // Xử lý URL hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/unnamed.jpg';
    // Ảnh local trong public/
    if (imagePath.startsWith('/products/')) return imagePath;
    if (imagePath === '/unnamed.jpg') return '/unnamed.jpg';
    if (imagePath.startsWith('http')) return imagePath;

    // Nếu là đường dẫn tương đối, chuyển thành API endpoint đầy đủ
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080/api/images/${encodeURIComponent(imagePath.substring(1))}`;
    }

    // Nếu không có / ở đầu, thêm vào API endpoint
    return `http://localhost:8080/api/images/${encodeURIComponent(imagePath)}`;
  };

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-img-container">
          <img
            alt={productName}
            src={getImageUrl(productImage)}
            onError={(e) => {
              console.log('❌ Lỗi tải ảnh:', e.target.src);
              e.target.onerror = null;
              e.target.src = '/unnamed.jpg';
              // Thêm class loaded để ẩn spinner
              e.target.parentElement.classList.add('loaded');
            }}
            onLoad={(e) => {
              console.log('✅ Tải ảnh thành công:', getImageUrl(productImage));
              // Thêm class loaded để ẩn spinner
              e.target.parentElement.classList.add('loaded');
            }}
            className="product-card-img"
          />
          {discountPercentage > 0 && (
            <Tag color="red" className="tag-discount">
              {discountType === 'new-api'
                ? `-${phanTramGiam}%`
                : discountType === 'promotion' && giaTriKhuyenMai
                  ? `-${giaTriKhuyenMai}%`
                  : `-${discountPercentage}%`
              }
            </Tag>
          )}
          {hasPromotion && (
            <Tag color="orange" className="tag-promotion">
              {tenKhuyenMai || 'KHUYẾN MÃI'}
            </Tag>
          )}
          {isNew && (
            <Tag color="blue" className="tag-new">MỚI</Tag>
          )}
        </div>
      }
    >
      <div className="product-brand">
        {productBrand && typeof productBrand === 'string' && (
          <Tag color="geekblue">{productBrand}</Tag>
        )}
        {hasPromotion && tenKhuyenMai && (
          <Tag color="orange" style={{ marginLeft: '8px' }}>
            {tenKhuyenMai}
          </Tag>
        )}
      </div>
      <Title level={5} className="product-name" ellipsis={{ rows: 2 }}>
        {productName && productName !== 'Tên sản phẩm' ? productName : 'Chưa có tên sản phẩm'}
      </Title>
      <div className="product-price">{displayPrice}</div>
      <Link to={`/products/${product.id}`}>
        <Button type="primary" block className="btn-detail">Xem chi tiết</Button>
      </Link>
    </Card>
  );
}

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Đang fetch dữ liệu trang Home...');

        // Fetch tất cả sản phẩm một lần
        const productsResponse = await fetch(config.getApiUrl('api/san-pham/getAll'));
        if (productsResponse.ok) {
          let allProducts = await productsResponse.json();

          // Đảm bảo allProducts là array
          if (!Array.isArray(allProducts)) {
            if (allProducts.data && Array.isArray(allProducts.data)) {
              allProducts = allProducts.data;
            } else if (allProducts.products && Array.isArray(allProducts.products)) {
              allProducts = allProducts.products;
            } else {
              console.warn('⚠️ API trả về dữ liệu không đúng định dạng:', allProducts);
              allProducts = [];
            }
          }

          console.log('✅ Tổng số sản phẩm:', allProducts.length);

          // Debug: Log cấu trúc dữ liệu sản phẩm đầu tiên
          if (allProducts.length > 0) {
            console.log('🔍 Cấu trúc sản phẩm đầu tiên:', allProducts[0]);
            console.log('🔍 ThuongHieu type:', typeof allProducts[0].thuongHieu);
            console.log('🔍 ThuongHieu value:', allProducts[0].thuongHieu);
            console.log('🔍 HinhAnh:', allProducts[0].hinhAnh);
            console.log('🔍 Image:', allProducts[0].image);
            console.log('🔍 Imanges:', allProducts[0].imanges);

            // Debug tên sản phẩm
            console.log('🔍 Tên sản phẩm - ten:', allProducts[0].ten);
            console.log('🔍 Tên sản phẩm - name:', allProducts[0].name);
            console.log('🔍 Tên sản phẩm - tenSanPham:', allProducts[0].tenSanPham);
            console.log('🔍 Tên sản phẩm - tenSP:', allProducts[0].tenSP);
            console.log('🔍 Tên sản phẩm - productName:', allProducts[0].productName);

            // Debug thông tin khuyến mãi
            console.log('🔍 Khuyến mãi:', allProducts[0].khuyenMai);
            console.log('🔍 Giá bán sau giảm:', allProducts[0].giaBanSauGiam);
            console.log('🔍 Giá gốc:', allProducts[0].giaBanGoc);
            console.log('🔍 Giá bán:', allProducts[0].giaBan);

            // Log tất cả các key có thể có
            console.log('🔍 Tất cả các key của sản phẩm:', Object.keys(allProducts[0]));
          }

          // Lọc sản phẩm nổi bật (sản phẩm có lượt xem cao hoặc được đánh dấu nổi bật)
          const featured = allProducts
            .filter(product => product.trangThai === 1) // Chỉ sản phẩm đang hoạt động
            .sort((a, b) => {
              // Ưu tiên sản phẩm có trạng thái nổi bật
              if (a.noiBat && !b.noiBat) return -1;
              if (!a.noiBat && b.noiBat) return 1;
              // Sau đó sắp xếp theo lượt xem
              return (b.luotXem || 0) - (a.luotXem || 0);
            })
            .slice(0, 8);
          console.log('✅ Sản phẩm nổi bật:', featured.length);

          // ✅ THÊM: Fetch giá từ biến thể cho từng sản phẩm nổi bật
          const featuredWithPrices = await Promise.all(
            featured.map(async (product) => {
              try {
                const variantsResponse = await fetch(config.getApiUrl(`api/san-pham-chi-tiet/${product.id}`));
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

          setFeaturedProducts(featuredWithPrices);



          // Lọc sản phẩm giảm giá (sản phẩm có giá gốc cao hơn giá bán hoặc có khuyến mãi)
          let saleProducts = allProducts
            .filter(product => {
              if (product.trangThai !== 1) return false;

              // Kiểm tra nếu có khuyến mãi
              if (product.khuyenMai && product.khuyenMai.id) return true;

              // Kiểm tra nếu có giá gốc và giá bán khác nhau
              if (product.giaBanGoc && product.giaBan && product.giaBanGoc > product.giaBan) return true;

              // Kiểm tra nếu có giá giảm giá
              if (product.giaGiamGia && product.giaBan && product.giaGiamGia < product.giaBan) return true;

              // Kiểm tra nếu có giá bán sau giảm giá (từ backend)
              if (product.giaBanSauGiam && product.giaBan && product.giaBanSauGiam < product.giaBan) return true;

              return false;
            })
            .sort((a, b) => {
              // Sắp xếp theo phần trăm giảm giá cao nhất
              let discountA = 0;
              let discountB = 0;

              // Tính phần trăm giảm giá cho sản phẩm A
              if (a.giaBanGoc && a.giaBan && a.giaBanGoc > a.giaBan) {
                discountA = ((a.giaBanGoc - a.giaBan) / a.giaBanGoc) * 100;
              } else if (a.giaBanSauGiam && a.giaBan && a.giaBanSauGiam < a.giaBan) {
                discountA = ((a.giaBan - a.giaBanSauGiam) / a.giaBan) * 100;
              } else if (a.khuyenMai && a.khuyenMai.giaTri) {
                discountA = a.khuyenMai.giaTri;
              }

              // Tính phần trăm giảm giá cho sản phẩm B
              if (b.giaBanGoc && b.giaBan && b.giaBanGoc > b.giaBan) {
                discountB = ((b.giaBanGoc - b.giaBan) / b.giaBanGoc) * 100;
              } else if (b.giaBanSauGiam && b.giaBan && b.giaBanSauGiam < b.giaBan) {
                discountB = ((b.giaBan - b.giaBanSauGiam) / b.giaBan) * 100;
              } else if (b.khuyenMai && b.khuyenMai.giaTri) {
                discountB = b.khuyenMai.giaTri;
              }

              return discountB - discountA;
            })
            .slice(0, 6);
          console.log('✅ Sản phẩm giảm giá (từ getAllOnline):', saleProducts.length);

          // ✅ THÊM: Fetch giá từ biến thể cho từng sản phẩm giảm giá
          const saleProductsWithPrices = await Promise.all(
            saleProducts.map(async (product) => {
              try {
                const variantsResponse = await fetch(config.getApiUrl(`api/san-pham-chi-tiet/${product.id}`));
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

          setOnSaleProducts(saleProductsWithPrices);

        } else {
          console.error('❌ Lỗi fetch sản phẩm:', productsResponse.status);
          throw new Error('Không thể tải dữ liệu sản phẩm');
        }

        // Fetch sản phẩm khuyến mãi từ API mới
        try {
          const promotionResponse = await fetch(config.getApiUrl('api/san-pham/sp-co-khuyen-mai'));
          if (promotionResponse.ok) {
            const promotionProducts = await promotionResponse.json();
            console.log('✅ Sản phẩm khuyến mãi từ API mới:', promotionProducts.length);

            // Nếu có sản phẩm khuyến mãi từ API mới, sử dụng nó
            if (promotionProducts && promotionProducts.length > 0) {
              setOnSaleProducts(promotionProducts);
              console.log('✅ Đã cập nhật sản phẩm giảm giá từ API khuyến mãi');
            }
          } else {
            console.warn('⚠️ Không thể fetch sản phẩm khuyến mãi, sử dụng dữ liệu từ getAllOnline');
          }
        } catch (error) {
          console.warn('⚠️ Lỗi khi fetch sản phẩm khuyến mãi:', error);
          console.log('ℹ️ Sử dụng dữ liệu sản phẩm giảm giá từ getAllOnline');
        }



        console.log('✅ Hoàn thành fetch dữ liệu trang Home');
        setError(null);
      } catch (error) {
        console.error('❌ Lỗi khi fetch dữ liệu trang Home:', error);
        setError('Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
        message.error('Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#ff4d4f', marginBottom: '20px' }}>
          <h3>❌ Lỗi tải dữ liệu</h3>
          <p>{error}</p>
        </div>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="home-page">
        <HeroSection />
        <div className="home-wrapper">
          <Divider orientation="left"><Title level={3}>Sản phẩm nổi bật</Title></Divider>
          {featuredProducts.length > 0 ? (
            <Row gutter={[24, 24]}>
              {featuredProducts.slice(0, 4).map(product => (
                <Col xs={24} sm={12} md={12} lg={6} key={product.id || Math.random()}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>Chưa có sản phẩm nổi bật</p>
              <small>Hãy quay lại sau để xem các sản phẩm nổi bật</small>
            </div>
          )}

          <div className="on-sale-section">
            <Divider orientation="left"><Title level={3}>Giày đang giảm giá</Title></Divider>
            {onSaleProducts.length > 0 ? (
              <div className="on-sale-products">
                <Row gutter={[24, 24]}>
                  {onSaleProducts.slice(0, 4).map(product => (
                    <Col xs={24} sm={12} md={12} lg={6} key={product.id || Math.random()}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>Chưa có sản phẩm giảm giá</p>
                <small>Hãy theo dõi để không bỏ lỡ các ưu đãi hấp dẫn</small>
              </div>
            )}
          </div>

          <div className="btn-view-all">
            <Link to="/products">
              <Button type="primary" size="large">Xem tất cả sản phẩm</Button>
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Home;
