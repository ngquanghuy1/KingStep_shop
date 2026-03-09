import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Image,
  Button,
  InputNumber,
  Typography,
  Tag,
  message,
  Modal,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { getCustomerId, isLoggedIn } from "../utils/authUtils";
import config from '../config/config';
import '../styles/Home.css';
const { Title, Paragraph, Text } = Typography;

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]); // danh sách biến thể từ API
  const [colorList, setColorList] = useState([]); // lấy từ API màu sắc
  const [sizeList, setSizeList] = useState([]); // lấy từ API kích thước
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ THÊM: Lấy ID khách hàng từ localStorage
  const customerId = getCustomerId();

  // Lấy chi tiết sản phẩm và biến thể từ API
  useEffect(() => {
    // Reset các state khi thay đổi sản phẩm
    setSelectedColor(undefined);
    setSelectedSize(undefined);
    setCurrentVariant(null);
    setQuantity(1);
    setLoading(true);
    setError(null);

    fetch(config.getApiUrl(`api/san-pham-chi-tiet/${id}`))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setVariants(data);
        setProduct(data[0]?.sanPham || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        setError("Không lấy được thông tin sản phẩm!");
        setLoading(false);
        message.error("Không lấy được thông tin sản phẩm!");
      });
  }, [id]);

  // Lấy danh sách màu từ API
  useEffect(() => {
    fetch(config.getApiUrl('api/mau-sac/getAll'))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setColorList(Array.isArray(data) ? data : data.data || []);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách màu:", error);
        // Fallback: set empty array để tránh lỗi
        setColorList([]);
      });

    fetch(config.getApiUrl('api/kich-thuoc/getAll'))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSizeList(Array.isArray(data) ? data : data.data || []);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách kích thước:", error);
        // Fallback: set empty array để tránh lỗi
        setSizeList([]);
      });
  }, []);

  // Lọc màu sắc và size có sẵn cho sản phẩm này
  const availableColors = colorList.filter(color => {
    // Kiểm tra xem màu này có trong bất kỳ variant nào không
    const hasColor = variants.some(variant => {
      const variantColor = variant.mauSac?.tenMauSac;
      const match = variantColor === color.tenMauSac;
      return match;
    });
    return hasColor;
  });

  const availableSizes = sizeList.filter(size => {
    // Kiểm tra xem size này có trong bất kỳ variant nào không
    const hasSize = variants.some(variant => {
      const variantSize = variant.kichThuoc?.tenKichThuoc;
      const match = variantSize === size.tenKichThuoc;
      return match;
    });
    return hasSize;
  });


  // Tự động chọn màu và size đầu tiên có sẵn
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].tenMauSac);
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].tenKichThuoc);
    }
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

  // Xác định biến thể hiện tại dựa trên các lựa chọn
  useEffect(() => {
    const found = variants.find((v) => {
      const variantColor = v.mauSac?.tenMauSac;
      const variantSize = v.kichThuoc?.tenKichThuoc;
      return variantColor === selectedColor && variantSize === selectedSize;
    });
    setCurrentVariant(found || null);

    setQuantity(1); // reset số lượng khi đổi biến thể
  }, [selectedColor, selectedSize, variants]);

  // Lấy số lượng còn lại của biến thể hiện tại
  const stock = currentVariant?.soLuong || 0;

  // ✅ THÊM: Hàm kiểm tra đăng nhập
  const checkLoginAndRedirect = () => {
    if (!isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Cần đăng nhập',
        text: 'Bạn cần đăng nhập để mua hàng!',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return false;
    }
    return true;
  };

  // ✅ CẬP NHẬT: Hàm mua ngay - kiểm tra đăng nhập trước
  const handleBuy = () => {
    if (!checkLoginAndRedirect()) return;

    if (!selectedColor || !selectedSize) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (!currentVariant) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    // ✅ SỬA: Chuyển đến trang payment thay vì checkout
    // Giống như thanh toán qua giỏ hàng
    navigate('/payment', {
      state: {
        cart: [{
          id: currentVariant.id,
          tenSanPham: product?.tenSanPham,
          giaBan: currentVariant.giaBan,
          giaBanGiamGia: currentVariant.giaBanGiamGia,
          soLuong: quantity,
          mauSac: selectedColor,
          kichThuoc: selectedSize,
          hinhAnh: getProductImage(currentVariant),
          idSanPhamChiTiet: currentVariant.id
        }],
        buyNow: true
      }
    });
  };

  // ✅ CẬP NHẬT: Hàm thêm vào giỏ hàng - kiểm tra đăng nhập trước
  const handleAddToCart = () => {
    if (!checkLoginAndRedirect()) return;

    if (!selectedColor || !selectedSize) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (!currentVariant) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có muốn thêm sản phẩm này vào giỏ hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ SỬ DỤNG ID KHÁCH HÀNG THỰC TẾ THAY VÌ HARDCODE
        axios
          .post(config.getApiUrl('api/gio-hang-chi-tiet/them'), {
            idKhachHang: customerId, // ✅ Sử dụng customerId thực tế
            idSanPhamChiTiet: currentVariant?.id,
            soLuong: quantity,
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Thành công",
              text: "Đã thêm vào giỏ hàng!",
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              width: 300
            });
          })
          .catch((error) => {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            Swal.fire({
              icon: "error",
              title: "Thất bại",
              text: `Thêm vào giỏ hàng thất bại: ${error.response?.data?.message || error.message}`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              width: 350
            });
          });
      }
    });
  };

  // Hàm lấy ảnh từ biến thể - sử dụng cùng logic như admin
  const getProductImage = (variant) => {
    if (!variant) return '/logo.png';

    let img = variant?.sanPham?.imanges || variant?.imanges || variant?.images;
    if (!img) return '/logo.png';

    if (Array.isArray(img)) img = img[0];
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];

    img = img.trim();
    if (!img) return '/logo.png';

    if (img.startsWith('http')) return img;

    return config.getApiUrl(`images/${encodeURIComponent(img)}`);
  };

  // ✅ THÊM: Helper function để xác định giá hiển thị
  const getDisplayPrice = (variant) => {
    if (!variant) return { originalPrice: 0, discountedPrice: 0, finalPrice: 0, hasDiscount: false };

    const originalPrice = variant.giaBan || 0;
    const discountedPrice = variant.giaBanGiamGia || 0;
    const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
    const finalPrice = hasDiscount ? discountedPrice : originalPrice;

    return {
      originalPrice,
      discountedPrice,
      finalPrice,
      hasDiscount
    };
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 16 }}>Đang tải thông tin sản phẩm...</div>
        <div>Vui lòng đảm bảo backend đang chạy trên port 8080</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#f5222d', marginBottom: 16 }}>{error}</div>
        <div style={{ marginBottom: 16 }}>Có thể backend chưa được khởi động hoặc có lỗi kết nối</div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Hiển thị nội dung chính
  return (
    <div className="product-detail-page">
      <div className="product-detail-card">
        <Row gutter={32}>
          <Col span={10} className="product-detail-image">
            <Image
              src={getProductImage(currentVariant || variants[0])}
              alt={currentVariant?.tenSanPham || variants[0]?.tenSanPham || 'Sản phẩm'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/logo.png";
              }}
            />
          </Col>
          <Col span={14} className="product-detail-info">
            <Title level={2}>{product?.tenSanPham || product?.name}</Title>
            <div style={{ marginBottom: 8 }}>
              {/* ✅ SỬA LẠI: Hiển thị giá khuyến mãi và giá gốc */}
              {(() => {
                const priceInfo = getDisplayPrice(currentVariant || variants[0]);

                if (priceInfo.hasDiscount) {
                  return (
                    <div>
                      <Text
                        delete
                        style={{
                          fontSize: 18,
                          color: '#666',
                          marginRight: 12
                        }}
                      >
                        {priceInfo.originalPrice.toLocaleString()}₫
                      </Text>
                      <Text
                        strong
                        style={{
                          color: "#f5222d",
                          fontSize: 22
                        }}
                      >
                        {priceInfo.finalPrice.toLocaleString()}₫
                      </Text>
                      <Tag
                        color="red"
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      >
                        -{Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}%
                      </Tag>
                    </div>
                  );
                } else {
                  return (
                    <Text strong style={{ color: "#f5222d", fontSize: 22 }}>
                      {priceInfo.finalPrice.toLocaleString()}₫
                    </Text>
                  );
                }
              })()}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag color="blue">
                Loại:{" "}
                {currentVariant?.danhMuc?.tenDanhMuc ||
                  product?.danhMuc?.tenDanhMuc ||
                  "---"}
              </Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag color={stock > 0 ? "green" : "red"}>
                {selectedColor && selectedSize
                  ? stock > 0
                    ? `Tình trạng: Màu ${selectedColor}, Size ${selectedSize} còn ${stock} sản phẩm`
                    : `Tình trạng: Màu ${selectedColor}, Size ${selectedSize} đã hết hàng`
                  : "Vui lòng chọn đủ màu và size"}
              </Tag>
            </div>
            <Paragraph>{product?.moTa || product?.description}</Paragraph>
            <div style={{ margin: "16px 0" }}>
              <div style={{ marginBottom: 8 }}>
                <span>Chọn màu: </span>

                {availableColors.map((color) => {

                  return (
                    <Button
                      key={color.id}
                      type={
                        selectedColor === color.tenMauSac ? "primary" : "default"
                      }
                      style={{
                        marginRight: 8,
                        background:
                          color.tenMauSac &&
                            color.tenMauSac.toLowerCase() !== "trắng"
                            ? color.tenMauSac
                            : undefined,
                        color:
                          color.tenMauSac &&
                            ["đen", "black"].includes(color.tenMauSac.toLowerCase())
                            ? "#fff"
                            : "#222",
                        border:
                          selectedColor === color.tenMauSac
                            ? "2px solid #1890ff"
                            : undefined,
                      }}
                      onClick={() => {
                        setSelectedColor(color.tenMauSac);
                        setTimeout(() => {
                          if (!selectedSize) {
                            message.info("Vui lòng chọn đủ size!");
                          }
                        }, 0);
                      }}
                    >
                      {color.tenMauSac}
                    </Button>
                  );
                })}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span>Chọn size: </span>
                {availableSizes.map((size) => (
                  <Button
                    key={size.id}
                    type={
                      selectedSize === size.tenKichThuoc ? "primary" : "default"
                    }
                    style={{
                      marginRight: 8,
                      border:
                        selectedSize === size.tenKichThuoc
                          ? "2px solid #1890ff"
                          : undefined,
                    }}
                    onClick={() => setSelectedSize(size.tenKichThuoc)}
                  >
                    {size.tenKichThuoc}
                  </Button>
                ))}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span>Số lượng: </span>
                <InputNumber
                  min={1}
                  max={stock}
                  value={quantity}
                  onChange={setQuantity}
                  style={{ width: 80, marginLeft: 8 }}
                />
              </div>
              <div className="product-detail-actions">
                <Button type="primary" size="large" onClick={handleBuy}>
                  Mua ngay
                </Button>
                <Button size="large" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ProductDetail; 
