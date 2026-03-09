import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Payment.css';
import { getCustomerId, getCustomerName, getUserInfo, isLoggedIn } from '../utils/authUtils';
import config from '../config/config';
import AddressSelector from '../components/AddressSelector';
import { parseGHNResponse } from '../utils/ghnUtils';  // ✅ THÊM: Import parseGHNResponse

// ✅ THÊM: Import Material-UI components (giống BanHangTaiQuay)
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ✅ THÊM: Function kiểm tra số lượng đơn hàng hiện tại của khách hàng
const checkCustomerOrderLimit = async (customerId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/donhang/khach/${customerId}`);
    if (!response.ok) {
      throw new Error('Không thể kiểm tra đơn hàng của khách hàng');
    }

    const orders = await response.json();
    console.log('📋 Tất cả đơn hàng của khách hàng:', orders);

    // Lọc các đơn hàng không tính vào giới hạn (trạng thái 4: Hoàn thành, 5: Đã hủy, 6: Trả hàng)
    const activeOrders = orders.filter(order => ![4, 5, 6].includes(order.trangThai));
    console.log('📊 Đơn hàng đang hoạt động (không tính 4,5,6):', activeOrders);
    console.log('📈 Số lượng đơn hàng hiện tại:', activeOrders.length);

    return {
      success: true,
      currentOrderCount: activeOrders.length,
      canCreateOrder: activeOrders.length < 10,
      message: activeOrders.length >= 10
        ? `Bạn đã đạt giới hạn tối đa 10 đơn hàng đang xử lý (hiện tại: ${activeOrders.length}). Vui lòng chờ các đơn hàng hiện tại hoàn thành trước khi tạo đơn mới.`
        : `Bạn có thể tạo thêm ${10 - activeOrders.length} đơn hàng nữa.`
    };
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra giới hạn đơn hàng:', error);
    return {
      success: false,
      currentOrderCount: 0,
      canCreateOrder: false,
      message: 'Không thể kiểm tra giới hạn đơn hàng. Vui lòng thử lại sau.'
    };
  }
};

// Không cần constant SHIPPING_FEE nữa, sẽ tính từ GHN API

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  // ✅ THÊM: States cho địa chỉ chi tiết
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [addressDetail, setAddressDetail] = useState('');

  // ✅ THÊM: States cho tính phí ship
  const [shippingFee, setShippingFee] = useState(0); // Khởi tạo 0, sẽ tính từ GHN API
  const [shippingFeeLoading, setShippingFeeLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ✅ THÊM: State cho voucher (giống BanHangTaiQuay)
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);        // Tổng tiền sau voucher
  const [orderDiscount, setOrderDiscount] = useState(0);  // Số tiền giảm giá
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState('');

  // ✅ THÊM: State cho modal voucher (giống BanHangTaiQuay)
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // ✅ Sổ địa chỉ giao hàng (dùng cho popup chọn địa chỉ)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressModalMode, setAddressModalMode] = useState('list'); // 'list' | 'new'
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Áp dụng một địa chỉ từ sổ địa chỉ vào state hiện tại
  const applyAddressFromBook = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name || '');
    setCustomerPhone(addr.phone || '');
    setCustomerEmail(addr.email || '');
    setAddressDetail(addr.addressDetail || '');

    setSelectedProvince(addr.provinceId || null);
    setSelectedDistrict(addr.districtId || null);
    setSelectedWard(addr.wardCode || null);

    if (addr.fullAddress) {
      setCustomerAddress(addr.fullAddress);
    }

    setSavedAddresses(prev => {
      const next = prev.map(a => ({ ...a, isDefault: a.id === addr.id }));
      localStorage.setItem('savedAddresses', JSON.stringify(next));
      return next;
    });

    // gọi lại tính phí ship dựa trên địa chỉ mới
    setTimeout(() => {
      handleAddressChange();
    }, 200);
  };

  // Load sổ địa chỉ từ localStorage khi vào trang
  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedAddresses');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        setSavedAddresses(list);
        const def = list.find(a => a.isDefault) || list[0];
        if (def) {
          applyAddressFromBook(def);
        }
      }
    } catch {
      // ignore lỗi parse
    }
  }, []);

  // ✅ THÊM: Fetch giá khuyến mãi từ API sản phẩm nếu cần
  const [productPrices, setProductPrices] = useState({});

  useEffect(() => {
    if (!Array.isArray(location.state?.cart) || !location.state.cart.length) {
      toast.warning('Vui lòng chọn sản phẩm và vào trang thanh toán từ giỏ hàng!');
      navigate('/cart');
      return;
    }

    // Debug: Kiểm tra data từ giỏ hàng
    console.log('=== DEBUG PAYMENT PAGE ===');
    console.log('Location state:', location.state);
    console.log('Cart from state:', location.state?.cart);
    console.log('Cart length:', location.state?.cart?.length);

    // Xử lý data từ giỏ hàng
    const cartData = location.state.cart;
    setCart(cartData);

    // Tính tổng tiền dựa trên loại data
    let calculatedTotal = 0;
    if (cartData.length > 0) {


      // Kiểm tra xem data từ giỏ hàng hay mua ngay
      if (cartData[0].giaBan !== undefined && cartData[0].giaBanGiamGia !== undefined) {
        // Cấu trúc mới từ backend: item.giaBan, item.giaBanGiamGia, item.soLuong
        calculatedTotal = cartData.reduce((sum, item) => {
          // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
          const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
          const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;
          return sum + (finalPrice * item.soLuong);
        }, 0);
      } else if (cartData[0].sanPhamChiTiet) {
        // Kiểm tra xem có phải cấu trúc mới từ backend không
        if (cartData[0].giaBan !== undefined) {
          calculatedTotal = cartData.reduce((sum, item) => {
            // Thử lấy giá khuyến mãi từ API sản phẩm nếu không có trong dữ liệu giỏ hàng
            const productPriceInfo = productPrices[item.idSanPhamChiTiet];
            const giaBanGiamGia = item.giaBanGiamGia || (productPriceInfo?.giaBanGiamGia);

            // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
            const hasDiscount = giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < item.giaBan;
            const giaBan = hasDiscount ? giaBanGiamGia : item.giaBan;
            return sum + (giaBan * item.soLuong);
          }, 0);
        } else {
          calculatedTotal = cartData.reduce((sum, item) => {
            // ✅ SỬA: Logic tính tổng tiền cho giỏ hàng
            const giaBan = item.sanPhamChiTiet.giaBan || 0;
            const giaBanGiamGia = item.sanPhamChiTiet.giaBanGiamGia;
            const soLuong = item.soLuong || 1;

            // ✅ SỬA: Logic đúng - kiểm tra null và so sánh chính xác
            const hasDiscount = giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBan;
            const giaBanCuoi = hasDiscount ? giaBanGiamGia : giaBan;

            return sum + (giaBanCuoi * soLuong);
          }, 0);
        }
      } else if (cartData[0].price !== undefined) {
        calculatedTotal = cartData.reduce((sum, item) => {
          const finalPrice = item.discountPrice && item.discountPrice < item.originalPrice
            ? item.discountPrice
            : item.price;
          return sum + (finalPrice * item.quantity);
        }, 0);
      } else {
        // Thử xử lý với cấu trúc có thể có
        if (cartData[0].gia !== undefined) {
          calculatedTotal = cartData.reduce((sum, item) => {
            return sum + (item.gia * item.soLuong);
          }, 0);
        }
      }
    }

    setTotal(calculatedTotal);
    // ✅ SỬA: Khởi tạo finalTotal = total (chưa có phí ship, sẽ tính sau)
    setFinalTotal(calculatedTotal);


  }, [location, navigate]);

  // ✅ THÊM: Fetch voucher khả dụng từ API mới
  useEffect(() => {
    const fetchVouchers = async () => {
      setVoucherLoading(true);
      try {
        const response = await fetch(config.getApiUrl('api/voucher/available'));

        if (response.ok) {
          const data = await response.json();

          // ✅ Sử dụng trực tiếp data từ API (đã được backend lọc sẵn)
          setVouchers(data);
        } else {
          // Fallback: sử dụng API cũ nếu API mới lỗi
          // Fallback: sử dụng API cũ nếu API mới lỗi
          const fallbackResponse = await fetch(config.getApiUrl('api/voucher'));
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const availableVouchers = fallbackData.filter(voucher =>
              voucher.trangThai === 1 &&
              voucher.soLuong > 0 &&
              new Date(voucher.ngayBatDau) <= new Date() &&
              new Date(voucher.ngayKetThuc) >= new Date()
            );
            setVouchers(availableVouchers);

          }
        }
      } catch (error) {
        // Fallback: sử dụng API cũ nếu có lỗi
        try {
          const fallbackResponse = await fetch(config.getApiUrl('api/voucher'));
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const availableVouchers = fallbackData.filter(voucher =>
              voucher.trangThai === 1 &&
              voucher.soLuong > 0 &&
              new Date(voucher.ngayBatDau) <= new Date() &&
              new Date(voucher.ngayKetThuc) >= new Date()
            );
            setVouchers(availableVouchers);

          }
        } catch (fallbackError) {
          // Ignore fallback error
        }
      } finally {
        setVoucherLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // ✅ THÊM: Functions xử lý thay đổi địa chỉ
  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShippingFee(0); // Reset phí ship khi thay đổi tỉnh

    // Load districts cho province này
    if (provinceId) {
      await fetchDistrictsForProvince(provinceId);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
    setShippingFee(0); // Reset phí ship khi thay đổi quận

    // Load wards cho district này
    if (districtId) {
      await fetchWardsForDistrict(districtId);
    }
  };

  const handleWardChange = (wardId) => {
    setSelectedWard(wardId);
  };

  // ✅ THÊM: Tự động điền thông tin khách hàng và select địa chỉ
  useEffect(() => {
    const autoFillCustomerInfo = async () => {
      // Kiểm tra đăng nhập
      if (!isLoggedIn()) {
        return;
      }

      const customerId = getCustomerId();
      if (!customerId) {
        return;
      }

      try {
        // Thử lấy thông tin từ localStorage trước
        // ✅ SỬA: Lấy thông tin từ localStorage với logic ưu tiên
        const userInfo = getUserInfo();
        const userLocal = JSON.parse(localStorage.getItem('user') || '{}');

        if (userInfo || Object.keys(userLocal).length > 0) {

          // Ưu tiên dữ liệu đã chỉnh sửa từ localStorage
          setCustomerName(userLocal.ten || userLocal.name || userInfo?.ten || userInfo?.name || '');
          setCustomerEmail(userLocal.email || userInfo?.email || '');
          setCustomerPhone(userLocal.soDienThoai || userLocal.phone || userInfo?.soDienThoai || userInfo?.phone || '');

          // ✅ SỬA: Xử lý địa chỉ từ localStorage (giống UserProfileCard)
          const addressLocal = userLocal.diaChi || userLocal.address || userInfo?.diaChi || userInfo?.address;
          if (addressLocal) {
            setCustomerAddress(addressLocal);

            // Parse địa chỉ để select trong AddressSelector (giống UserProfileCard)
            const addressParts = addressLocal.split(',').map(p => p.trim());
            if (addressParts.length >= 4) {
              const addressDetail = addressParts[0];
              const wardCode = addressParts[1];
              const districtId = addressParts[2];
              const provinceId = addressParts[3];

              console.log('📍 Parse địa chỉ từ localStorage:', { addressDetail, wardCode, districtId, provinceId });
              setAddressDetail(addressDetail);

              // Đợi provinces load xong rồi mới parse địa chỉ
              setTimeout(async () => {
                await parseAndSelectAddress(addressLocal);
              }, 2000);
            }
          }
        }

        // Fetch thông tin chi tiết từ API
        const response = await fetch(config.getApiUrl(`api/khachhang/${customerId}`));

        if (response.ok) {
          const customerData = await response.json();

          // ✅ SỬA: Ưu tiên dữ liệu đã chỉnh sửa từ localStorage nếu có
          const userLocal = JSON.parse(localStorage.getItem('user') || '{}');

          // Cập nhật thông tin với logic ưu tiên
          setCustomerName(userLocal.ten || userLocal.name || customerData.ten || customerData.hoTen || '');
          setCustomerEmail(userLocal.email || customerData.email || '');
          setCustomerPhone(userLocal.soDienThoai || userLocal.phone || customerData.soDienThoai || customerData.sdt || '');

          // Xử lý địa chỉ từ thông tin đã đăng ký
          const addressLocal = userLocal.diaChi || userLocal.address || customerData.diaChi;
          if (addressLocal) {
            setCustomerAddress(addressLocal);

            // Đợi provinces load xong rồi mới parse địa chỉ
            setTimeout(async () => {
              await parseAndSelectAddress(addressLocal);
            }, 2000);
          }

          // Đã tự động điền thông tin khách hàng
          toast.success('Đã tự động điền thông tin khách hàng!');
        } else {
          // Sử dụng thông tin từ localStorage nếu API không hoạt động
        }
      } catch (error) {
        // Sử dụng thông tin từ localStorage nếu có lỗi
      }
    };

    autoFillCustomerInfo();
  }, []);

  // ✅ THÊM: Load provinces khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      if (provinces.length === 0) {
        // Thử load từ API trước
        const provincesData = await fetchProvinces();

        // Nếu API không hoạt động, thử load từ localStorage
        if (!provincesData || provincesData.length === 0) {
          const cachedProvinces = localStorage.getItem('ghn_provinces');
          if (cachedProvinces) {
            try {
              const parsedProvinces = JSON.parse(cachedProvinces);
              setProvinces(parsedProvinces);
            } catch (error) {
              // Ignore parse error
            }
          } else {
            toast.warning('Không thể load danh sách tỉnh thành. Vui lòng thử lại sau!');
          }
        } else {
          // Cache provinces vào localStorage
          localStorage.setItem('ghn_provinces', JSON.stringify(provincesData));
        }
      }
    };

    loadProvinces();
  }, [provinces.length]); // ✅ SỬA: Thêm dependency

  // ✅ THÊM: Khởi tạo orderTotal và orderDiscount
  useEffect(() => {
    setOrderTotal(total);
    setOrderDiscount(0);
    // ✅ THÊM: Cập nhật finalTotal khi total hoặc shippingFee thay đổi
    setFinalTotal(total + shippingFee);
  }, [total, shippingFee]);

  // ✅ THÊM: Tự động tính phí ship khi địa chỉ thay đổi
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      // Đợi một chút để đảm bảo state đã được cập nhật hoàn toàn
      const timer = setTimeout(() => {
        handleAddressChange();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [selectedProvince, selectedDistrict, selectedWard]);

  // ✅ THÊM: Function xử lý voucher (TÍNH TOÁN GIẢM GIÁ NGAY KHI CHỌN)
  const handleVoucherChange = async (voucherId) => {
    setSelectedVoucherId(voucherId);
    setVoucherMessage('');

    if (voucherId) {
      const voucher = vouchers.find(v => v.id === Number(voucherId));
      console.log('🎫 Voucher được chọn:', voucher);

      if (voucher) {
        // Kiểm tra điều kiện áp dụng voucher
        if (total >= voucher.donToiThieu) {
          // ✅ TÍNH TOÁN GIẢM GIÁ NGAY KHI CHỌN VOUCHER
          let discount = 0;
          if (voucher.loaiVoucher === 'Giảm giá %') {
            discount = (total * voucher.giaTri) / 100;
            console.log('🎯 Voucher %: giaTri=', voucher.giaTri, '%, discount=', discount);
          } else if (voucher.loaiVoucher === 'Giảm giá số tiền') {
            discount = voucher.giaTri;
            console.log('🎯 Voucher số tiền: giaTri=', voucher.giaTri, 'discount=', discount);
          }

          // Không cho giảm quá tổng tiền (giống backend)
          const finalDiscount = Math.min(discount, total);
          console.log('🎯 Giảm giá cuối cùng:', finalDiscount);

          setOrderDiscount(finalDiscount);
          setOrderTotal(total - finalDiscount);

          // ✅ QUAN TRỌNG: Cập nhật finalTotal để hiển thị đúng
          const newFinalTotal = (total - finalDiscount) + shippingFee;
          setFinalTotal(newFinalTotal);

          console.log('💰 Sau khi áp dụng voucher: orderDiscount=', finalDiscount, 'orderTotal=', total - finalDiscount, 'finalTotal=', newFinalTotal);

          toast.success(`Đã chọn voucher: ${voucher.tenVoucher}`);
          setVoucherMessage(`Voucher đã được áp dụng! Giảm ${finalDiscount.toLocaleString()}₫`);

          // ✅ LƯU Ý: Logic kiểm tra voucher hết số lượng sẽ được xử lý trong applyVoucherToOrder
          // khi thanh toán thành công, không cần xử lý ở đây
        } else {
          console.log('❌ Voucher không đủ điều kiện: total=', total, 'donToiThieu=', voucher.donToiThieu);
          toast.warning(`Voucher yêu cầu đơn hàng tối thiểu ${voucher.donToiThieu.toLocaleString()}₫`);
          setVoucherMessage('Voucher không đủ điều kiện áp dụng!');
          setSelectedVoucherId(''); // Reset nếu không đủ điều kiện
        }
      }
    } else {
      // Bỏ chọn voucher
      console.log('🚫 Bỏ chọn voucher');
      setOrderDiscount(0);
      setOrderTotal(total);

      // ✅ QUAN TRỌNG: Cập nhật finalTotal về giá trị ban đầu
      const newFinalTotal = total + shippingFee;
      setFinalTotal(newFinalTotal);

      console.log('💰 Sau khi bỏ voucher: orderDiscount=0, orderTotal=', total, 'finalTotal=', newFinalTotal);

      toast.info('Đã bỏ chọn voucher');
      setVoucherMessage('Đã bỏ chọn voucher!');
    }

    // Tự động ẩn thông báo sau 2.5 giây
    setTimeout(() => setVoucherMessage(''), 2500);
  };

  // ✅ THÊM: Function tính phí ship từ GHN API với retry mechanism
  const calculateShippingFee = async (fromDistrict, toDistrict, toWardCode, weight = 500, retryCount = 0) => {
    if (!fromDistrict || !toDistrict || !toWardCode) {
      return;
    }

    setShippingFeeLoading(true);
    try {


      const requestBody = {
        fromDistrict: fromDistrict,
        toDistrict: toDistrict,
        toWardCode: toWardCode,
        weight: weight
      };

      const response = await fetch(config.getApiUrl('api/ghn/calculate-fee'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const feeData = await response.json();

        // ✅ SỬA: Kiểm tra nhiều cấu trúc response có thể có
        let shippingFeeValue = 0;

        if (feeData.data && feeData.data.total) {
          // Cấu trúc: {code: 200, data: {total: 34000, ...}, message: "Success"}
          shippingFeeValue = feeData.data.total;
        } else if (feeData.data && feeData.data.total_fee) {
          // Cấu trúc: {code: 200, data: {total_fee: 34000, ...}, message: "Success"}
          shippingFeeValue = feeData.data.total_fee;
        } else if (feeData.total_fee) {
          shippingFeeValue = feeData.total_fee;
        } else if (feeData.total) {
          shippingFeeValue = feeData.total;
        } else if (feeData.data && feeData.data.length > 0) {
          // Nếu response có dạng {data: [{total_fee: xxx}]}
          shippingFeeValue = feeData.data[0].total_fee || feeData.data[0].total || 0;
        } else if (Array.isArray(feeData) && feeData.length > 0) {
          // Nếu response là array
          shippingFeeValue = feeData[0].total_fee || feeData[0].total || 0;
        }

        if (shippingFeeValue > 0) {
          setShippingFee(shippingFeeValue);
          toast.success(`Phí ship: ${shippingFeeValue.toLocaleString()}₫`);
        } else {
          setShippingFee(0);
          toast.warning('Không thể tính phí ship, vui lòng thử lại');
        }
      } else {
        const errorText = await response.text();

        // ✅ THÊM: Retry mechanism cho lỗi 403
        if (response.status === 403 && retryCount < 2) {
          setTimeout(() => {
            calculateShippingFee(fromDistrict, toDistrict, toWardCode, weight, retryCount + 1);
          }, 2000);
          return;
        }

        setShippingFee(0);
        if (response.status === 403) {
          toast.error('Lỗi xác thực API. Vui lòng liên hệ admin để kiểm tra cấu hình GHN!');
        } else {
          toast.warning('Không thể tính phí ship, vui lòng thử lại');
        }
      }
    } catch (error) {
      // ✅ THÊM: Retry mechanism cho lỗi network
      if (retryCount < 2) {
        setTimeout(() => {
          calculateShippingFee(fromDistrict, toDistrict, toWardCode, weight, retryCount + 1);
        }, 2000);
        return;
      }

      setShippingFee(0);
      toast.warning('Lỗi kết nối, vui lòng thử lại');
    } finally {
      if (retryCount === 0) {
        setShippingFeeLoading(false);
      }
    }
  };

  // ✅ THÊM: Function parse địa chỉ và select trong AddressSelector (sửa race condition)
  const parseAndSelectAddress = async (addressString) => {
    console.log('🔍 Đang parse địa chỉ:', addressString);

    if (!addressString) return;

    try {
      const addressParts = addressString.split(',').map(p => p.trim());
      console.log("📍 addressParts:", addressParts);

      // Format: [detail, wardCode, districtId, provinceId]
      if (addressParts.length < 4) {
        console.log('⚠️ Địa chỉ không đủ thông tin để parse, thử format khác...');

        // Thử format: [detail, wardName, districtName, provinceName]
        const addressDetail = addressParts[0] || '';
        setAddressDetail(addressDetail);

        // Không thể parse tự động, để user chọn thủ công
        toast.info('Không thể tự động parse địa chỉ. Vui lòng chọn địa chỉ giao hàng thủ công.');
        return;
      }

      let addressDetail = addressParts[0];
      let wardCode = addressParts[1];
      let districtId = addressParts[2];
      let provinceId = addressParts[3];

      console.log('📍 Parse địa chỉ:', { addressDetail, wardCode, districtId, provinceId });

      // ✅ SỬA: Đợi provinces load xong trước khi parse
      console.log('🔍 Kiểm tra provinces state:', { length: provinces.length, hasData: provinces.length > 0 });

      if (provinces.length === 0) {
        console.log('⏳ Provinces chưa load, đang đợi...');

        // Thử load provinces trước
        const provincesData = await fetchProvinces();
        if (provincesData.length === 0) {
          console.log('❌ Không thể load provinces từ API');
          toast.warning('Không thể load danh sách tỉnh thành. Vui lòng thử lại sau!');
          return;
        }

        console.log('✅ Đã load provinces từ API:', provincesData.length);
      } else {
        console.log('✅ Provinces đã có sẵn trong state:', provinces.length);
      }

      console.log('✅ Provinces đã sẵn sàng, bắt đầu parse địa chỉ');

      // Tìm province - sử dụng provinces từ state hoặc từ API
      const provincesToSearch = provinces.length > 0 ? provinces : await fetchProvinces();
      const province = provincesToSearch.find(p => Number(p.ProvinceID) === Number(provinceId));
      if (!province) {
        console.log('❌ Không tìm thấy tỉnh/thành:', provinceId);
        console.log('📋 Danh sách provinces có sẵn:', provincesToSearch.map(p => ({ id: p.ProvinceID, name: p.ProvinceName })));
        toast.warning(`Không tìm thấy tỉnh/thành: ${provinceId}`);
        return;
      }
      console.log('✅ Tìm thấy province:', province.ProvinceName);
      setSelectedProvince(province.ProvinceID);

      // Load districts
      console.log('🔄 Đang load districts cho province:', province.ProvinceID);
      const districtsData = await fetchDistrictsForProvince(province.ProvinceID);
      if (districtsData.length === 0) {
        console.log('❌ Không thể load districts');
        return;
      }

      const district = districtsData.find(d => Number(d.DistrictID) === Number(districtId));
      if (!district) {
        console.log('❌ Không tìm thấy quận/huyện:', districtId);
        toast.warning(`Không tìm thấy quận/huyện: ${districtId}`);
        return;
      }
      console.log('✅ Tìm thấy district:', district.DistrictName);
      setSelectedDistrict(district.DistrictID);

      // Load wards
      console.log('🔄 Đang load wards cho district:', district.DistrictID);
      const wardsData = await fetchWardsForDistrict(district.DistrictID);
      if (wardsData.length === 0) {
        console.log('❌ Không thể load wards');
        return;
      }

      const ward = wardsData.find(w => String(w.WardCode) === String(wardCode));
      if (!ward) {
        console.log('❌ Không tìm thấy phường/xã:', wardCode);
        toast.warning(`Không tìm thấy phường/xã: ${wardCode}`);
        return;
      }
      console.log('✅ Tìm thấy ward:', ward.WardName);
      setSelectedWard(ward.WardCode);

      // ✅ SỬA: Cập nhật địa chỉ chi tiết
      if (addressDetail) {
        setAddressDetail(addressDetail);
      }

      // ✅ SỬA: Cập nhật địa chỉ giao hàng đầy đủ
      const fullAddress = `${addressDetail}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
      setCustomerAddress(fullAddress);

      // ✅ THÊM: Đảm bảo địa chỉ chi tiết được lưu đúng
      console.log('📍 Địa chỉ chi tiết đã được set:', addressDetail);
      console.log('📍 Địa chỉ giao hàng đầy đủ:', fullAddress);

      console.log("✅ Parse địa chỉ thành công:", { addressDetail, province: province.ProvinceName, district: district.DistrictName, ward: ward.WardName });

      // ✅ THÊM: Tự động tính phí ship sau khi parse địa chỉ thành công
      setTimeout(() => {
        console.log('🚚 Tự động tính phí ship sau khi parse địa chỉ...');
        handleAddressChange();
      }, 1000);

    } catch (error) {
      console.error('❌ Lỗi khi parse địa chỉ:', error);

      // ✅ THÊM: Xử lý lỗi tốt hơn
      if (error.name === 'TypeError' && error.message.includes('toLowerCase')) {
        toast.warning('Địa chỉ không đúng định dạng. Vui lòng chọn địa chỉ giao hàng thủ công.');
      } else {
        toast.error('Có lỗi khi xử lý địa chỉ. Vui lòng thử lại sau!');
      }

      // Đặt địa chỉ chi tiết từ phần đầu của địa chỉ gốc
      const addressParts = addressString.split(',').map(p => p.trim());
      if (addressParts.length > 0) {
        setAddressDetail(addressParts[0]);
      }
    }
  };

  // ✅ THÊM: Function fetch provinces (sửa để match với UserProfileCard)
  const fetchProvinces = async () => {
    try {
      console.log('🔄 Đang fetch provinces...');
      console.log('📍 API URL:', config.getApiUrl('api/ghn/provinces'));

      const response = await fetch(config.getApiUrl('api/ghn/provinces'));
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', response.headers);

      if (response.ok) {
        const responseData = await response.json();
        console.log('📥 Raw response data:', responseData);
        console.log('📥 Response data type:', typeof responseData);
        console.log('📥 Response data keys:', responseData ? Object.keys(responseData) : 'null');

        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        console.log('🔧 Data sau khi parse:', data);
        console.log('🔧 Parsed data type:', typeof data);
        console.log('🔧 Parsed data is array:', Array.isArray(data));

        if (data && Array.isArray(data)) {
          console.log('✅ Parse thành công, đang set provinces...');
          setProvinces(data);
          console.log('✅ Đã load provinces:', data.length);
          console.log('📋 Sample provinces:', data.slice(0, 3));
          return data;
        } else {
          console.error('❌ Cấu trúc response không đúng sau khi parse:', data);
          return [];
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Lỗi fetch provinces:', response.status);
        console.error('❌ Error response:', errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch provinces:', error);
      console.error('❌ Error details:', error.message);
      return [];
    }
  };

  // ✅ THÊM: Function fetch districts cho province (sửa để match với UserProfileCard)
  const fetchDistrictsForProvince = async (provinceId) => {
    try {
      console.log('🔄 Đang fetch districts cho province:', provinceId);
      const response = await fetch(config.getApiUrl(`api/ghn/districts/${provinceId}`));
      if (response.ok) {
        const responseData = await response.json();
        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        if (data && Array.isArray(data)) {
          setDistricts(data);
          console.log('✅ Đã load districts:', data.length);
          return data;
        } else {
          console.error('❌ Cấu trúc districts không đúng sau khi parse:', data);
          return [];
        }
      } else {
        console.error('❌ Lỗi fetch districts:', response.status);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch districts:', error);
      return [];
    }
  };

  // ✅ THÊM: Function fetch wards cho district (sửa để match với UserProfileCard)
  const fetchWardsForDistrict = async (districtId) => {
    try {
      console.log('🔄 Đang fetch wards cho district:', districtId);
      const response = await fetch(config.getApiUrl(`api/ghn/wards/${districtId}`));
      if (response.ok) {
        const responseData = await response.json();
        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        if (data && Array.isArray(data)) {
          setWards(data);
          console.log('✅ Đã load wards:', data.length);
          return data;
        } else {
          console.error('❌ Cấu trúc wards không đúng sau khi parse:', data);
          return [];
        }
      } else {
        console.error('❌ Lỗi fetch wards:', response.status);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch wards:', error);
      return [];
    }
  };

  // ✅ THÊM: Function xử lý thay đổi địa chỉ
  const handleAddressChange = () => {
    console.log('🔄 handleAddressChange được gọi');
    console.log('📍 selectedProvince:', selectedProvince);
    console.log('📍 selectedDistrict:', selectedDistrict);
    console.log('📍 selectedWard:', selectedWard);

    if (selectedProvince && selectedDistrict && selectedWard) {
      // Tìm thông tin địa chỉ từ danh sách đã load
      const province = provinces.find(p => p.ProvinceID === selectedProvince);
      const district = districts.find(d => d.DistrictID === selectedDistrict);
      const ward = wards.find(w => w.WardCode === selectedWard);

      console.log('📍 Tìm thấy province:', province);
      console.log('📍 Tìm thấy district:', district);
      console.log('📍 Tìm thấy ward:', ward);

      if (province && district && ward) {
        // ✅ THÊM: Tính cân nặng từ cart
        let totalWeight = 0;
        cart.forEach(item => {
          // Ước tính cân nặng dựa trên số lượng (mỗi sản phẩm khoảng 500g)
          const itemWeight = 500; // gram
          const quantity = item.soLuong || item.quantity || 1;
          totalWeight += itemWeight * quantity;
        });

        // Đảm bảo cân nặng tối thiểu 500g
        totalWeight = Math.max(totalWeight, 500);

        console.log('📦 Cân nặng tính toán:', totalWeight, 'g');
        console.log('🚚 Gọi calculateShippingFee với params:', {
          fromDistrict: 1484, // Ba Đình, Hà Nội - địa chỉ shop thực tế (DistrictID chính xác)
          toDistrict: selectedDistrict,
          toWardCode: selectedWard,
          weight: totalWeight
        });

        // Tính phí ship từ Ba Đình, Hà Nội (district 1484) đến địa chỉ được chọn
        calculateShippingFee(1484, selectedDistrict, selectedWard, totalWeight);

        // Cập nhật địa chỉ giao hàng
        const fullAddress = `${addressDetail}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
        setCustomerAddress(fullAddress);

        // ✅ THÊM: Cập nhật địa chỉ chi tiết riêng biệt
        if (addressDetail) {
          setAddressDetail(addressDetail);
        }
      } else {
        console.log('❌ Không tìm thấy thông tin địa chỉ đầy đủ');
      }
    } else {
      console.log('❌ Thiếu thông tin địa chỉ:', { selectedProvince, selectedDistrict, selectedWard });
    }
  };

  // ✅ THÊM: Function fetch thông tin đơn hàng (giống BanHangTaiQuay)
  const fetchOrderInfo = async (orderId) => {
    if (!orderId) return null;

    try {
      console.log('🔄 Đang fetch thông tin đơn hàng...');
      const response = await fetch(config.getApiUrl(`api/donhang/${orderId}`));

      if (response.ok) {
        const orderData = await response.json();

        // Cập nhật state với thông tin từ backend
        if (orderData.tongTienGiamGia) {
          setOrderDiscount(orderData.tongTienGiamGia);
          setOrderTotal(orderData.tongTien);
        }

        return orderData;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // ✅ THÊM: Function áp dụng voucher qua API mới (giống BanHangTaiQuay)
  const applyVoucherToOrder = async (orderId, voucherId) => {
    if (!orderId || !voucherId) return false;

    try {
      const response = await fetch(config.getApiUrl(`api/donhang/${orderId}/apply-voucher/${voucherId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const updatedOrder = await response.json();

        // ✅ THÊM: Trừ số lượng voucher đi 1 sau khi áp dụng thành công
        try {
          console.log('🎫 Đang trừ số lượng voucher...');

          // ✅ SỬA: Sử dụng API update có sẵn thay vì tạo API mới
          // Tìm voucher hiện tại để lấy thông tin cập nhật
          const currentVoucher = vouchers.find(v => v.id === Number(voucherId));
          if (currentVoucher) {
            const newQuantity = Math.max(0, currentVoucher.soLuong - 1);

            const decreaseVoucherResponse = await fetch(config.getApiUrl(`api/voucher/update/${voucherId}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...currentVoucher,
                soLuong: newQuantity
              })
            });

            if (decreaseVoucherResponse.ok) {
              console.log('✅ Đã trừ số lượng voucher thành công');

              // ✅ Cập nhật state vouchers để giảm số lượng hiển thị
              setVouchers(prevVouchers =>
                prevVouchers.map(v =>
                  v.id === Number(voucherId)
                    ? { ...v, soLuong: newQuantity }
                    : v
                )
              );

              // ✅ THÊM: Thông báo nếu voucher hết số lượng
              if (newQuantity === 0) {
                toast.info('🎫 Voucher đã hết số lượng!');

                // ✅ Tự động bỏ chọn voucher nếu hết số lượng
                setSelectedVoucherId('');
                setOrderDiscount(0);
                setOrderTotal(total);
                setFinalTotal(total + shippingFee);
              }
            } else {
              console.warn('⚠️ Không thể trừ số lượng voucher, nhưng voucher đã được áp dụng');
            }
          } else {
            console.warn('⚠️ Không tìm thấy voucher để cập nhật số lượng');
          }
        } catch (decreaseError) {
          console.warn('⚠️ Lỗi khi trừ số lượng voucher:', decreaseError);
        }

        // ✅ Fetch lại thông tin đơn hàng để lấy tổng tiền mới (giống BanHangTaiQuay)
        await fetchOrderInfo(orderId);

        return true;
      } else {
        const errorMessage = await response.text();
        toast.error(`Không thể áp dụng voucher: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi áp dụng voucher');
      return false;
    }
  };

  const handlePayment = async () => {
    // ✅ SỬA: Validation chi tiết hơn
    if (!customerName.trim()) {
      toast.warning('Vui lòng nhập họ tên khách hàng!');
      return;
    }

    if (!customerPhone.trim()) {
      toast.warning('Vui lòng nhập số điện thoại!');
      return;
    }

    // Kiểm tra format số điện thoại
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      toast.warning('Số điện thoại không đúng định dạng!');
      return;
    }

    if (!customerEmail.trim()) {
      toast.warning('Vui lòng nhập email!');
      return;
    }

    // Kiểm tra format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      toast.warning('Email không đúng định dạng!');
      return;
    }

    if (!customerAddress.trim()) {
      toast.warning('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    // ✅ THÊM: Kiểm tra đã chọn địa chỉ để tính phí vận chuyển
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.warning('Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển!');
      return;
    }

    if (!addressDetail.trim()) {
      toast.warning('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường, tòa nhà)!');
      return;
    }

    // ✅ THÊM: Kiểm tra đã tính được phí vận chuyển
    if (shippingFee <= 0) {
      toast.warning('Vui lòng chờ tính phí vận chuyển hoặc thử lại!');
      return;
    }

    // ✅ THÊM: Kiểm tra giới hạn đơn hàng TRƯỚC KHI xử lý bất kỳ phương thức thanh toán nào
    try {
      const customerId = getCustomerId();
      if (!customerId) {
        toast.error('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại!');
        return;
      }

      console.log('🔍 Kiểm tra giới hạn đơn hàng cho khách hàng:', customerId);
      const orderLimitCheck = await checkCustomerOrderLimit(customerId);

      if (!orderLimitCheck.success) {
        toast.error(orderLimitCheck.message);
        return;
      }

      if (!orderLimitCheck.canCreateOrder) {
        // ✅ Hiển thị thông báo lỗi thân thiện với SweetAlert2 (nếu có) hoặc toast
        if (window.Swal) {
          window.Swal.fire({
            icon: 'warning',
            title: '⚠️ Đã đạt giới hạn đơn hàng!',
            html: `
              <div style="text-align: left; padding: 16px;">
                <p style="margin-bottom: 12px; color: #666;">
                  <strong>Bạn đã đạt giới hạn tối đa 10 đơn hàng đang xử lý.</strong>
                </p>
                <p style="margin-bottom: 12px; color: #666;">
                  Hiện tại: <span style="color: #f5222d; font-weight: bold;">${orderLimitCheck.currentOrderCount}/10 đơn hàng</span>
                </p>
                <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 12px; margin: 12px 0;">
                  <p style="margin: 0; color: #389e0d;">
                    💡 <strong>Gợi ý:</strong> Vui lòng chờ các đơn hàng hiện tại hoàn thành hoặc bị hủy trước khi tạo đơn mới.
                  </p>
                </div>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Bạn có thể kiểm tra trạng thái đơn hàng trong mục "Lịch sử đơn hàng".
                </p>
              </div>
            `,
            confirmButtonText: 'Xem lịch sử đơn hàng',
            showCancelButton: true,
            cancelButtonText: 'Đóng',
            confirmButtonColor: '#1890ff',
            cancelButtonColor: '#d9d9d9',
            width: '500px'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/order-history');
            }
          });
        } else {
          toast.error(orderLimitCheck.message, {
            position: "top-center",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      console.log('✅ Khách hàng có thể tạo đơn hàng mới:', orderLimitCheck.message);
    } catch (error) {
      toast.error('Lỗi khi kiểm tra giới hạn đơn hàng: ' + error.message);
      return;
    }

    setLoading(true);

    // Nếu chọn thanh toán online (VNPAY)
    if (paymentMethod === 'bank') {
      try {
        // ✅ KHÔI PHỤC: Lưu thông tin đơn hàng vào localStorage trước khi chuyển hướng VNPAY
        console.log('🔄 Đang chuẩn bị thanh toán VNPAY...');

        // ✅ DEBUG: Kiểm tra cấu trúc cart trước khi lưu


        const orderInfo = {
          tenNguoiNhan: customerName,
          soDienThoaiGiaoHang: customerPhone,
          emailGiaoHang: customerEmail,
          // ✅ SỬA: Chỉ sử dụng customerAddress (đã bao gồm địa chỉ chi tiết)
          diaChiGiaoHang: customerAddress,
          loaiDonHang: 'online',
          customerNote,
          paymentMethod,
          // ✅ SỬA: Gửi finalTotal (đã bao gồm phí ship từ GHN)
          tongTien: finalTotal, // Tổng tiền đã bao gồm phí ship thực tế
          phiVanChuyen: shippingFee, // Phí ship từ GHN API
          finalAmount: finalTotal, // Sử dụng finalTotal thay vì orderTotal + shippingFee
          trangThai: 1, // Thanh toán chuyển khoản thành công -> Đã xác nhận
          ngayTao: new Date().toISOString().slice(0, 10),
          cart: cart,
          selectedVoucherId: selectedVoucherId
        };

        localStorage.setItem('pendingOrderInfo', JSON.stringify(orderInfo));
        console.log('✅ Đã lưu thông tin đơn hàng vào localStorage, chưa tạo đơn hàng');
        console.log('📋 Thông tin đơn hàng đã lưu:', orderInfo);
        console.log('📦 Cart trong orderInfo:', orderInfo.cart);

        // ✅ THÊM DEBUG: Kiểm tra localStorage ngay sau khi lưu
        console.log('🔍 === DEBUG LOCALSTORAGE SAVE ===');
        console.log('📍 localStorage.pendingOrderInfo exists:', !!localStorage.getItem('pendingOrderInfo'));
        console.log('📍 localStorage.pendingOrderInfo value:', localStorage.getItem('pendingOrderInfo'));
        console.log('📍 All localStorage keys:', Object.keys(localStorage));
        console.log('🔍 === END DEBUG ===');

        // Chuyển đến VNPAY với số tiền cần thanh toán
        console.log('💰 Số tiền thanh toán VNPAY:', finalTotal);
        console.log('🔄 Đang gọi API tạo thanh toán VNPAY...');
        console.log('📍 API URL:', config.getApiUrl(`api/payment/create?amount=${finalTotal}`));

        const res = await fetch(config.getApiUrl(`api/payment/create?amount=${finalTotal}`));

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API VNPAY trả về lỗi:', res.status, errorText);
          throw new Error(`API VNPAY lỗi: ${res.status} - ${errorText}`);
        }

        const paymentUrl = await res.text();
        console.log('✅ URL thanh toán VNPAY:', paymentUrl);

        if (!paymentUrl || paymentUrl === '') {
          throw new Error('API VNPAY không trả về URL thanh toán');
        }

        // Kiểm tra URL có hợp lệ không
        try {
          new URL(paymentUrl);
        } catch (urlError) {
          console.error('❌ URL thanh toán không hợp lệ:', paymentUrl);
          throw new Error('URL thanh toán không hợp lệ');
        }

        console.log('🚀 Chuyển hướng đến VNPAY...');
        console.log('📍 VNPAY URL:', paymentUrl);

        // Thêm delay nhỏ để log được hiển thị
        console.log('🚀 Chuẩn bị chuyển hướng đến VNPAY...');
        console.log('📍 localStorage trước khi chuyển hướng:', localStorage.getItem('pendingOrderInfo'));

        setTimeout(() => {
          console.log('🚀 Đang chuyển hướng...');
          window.location.href = paymentUrl;
        }, 100);

      } catch (error) {
        toast.error(`Không thể tạo thanh toán VNPAY: ${error.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Đảm bảo total có giá trị hợp lệ
    if (!total || total <= 0) {
      toast.error('Tổng tiền không hợp lệ!');
      setLoading(false);
      return;
    }

    try {
      // ✅ Lấy ID khách hàng từ user đang đăng nhập (đã kiểm tra ở trên)
      const customerId = getCustomerId();

      // BƯỚC 1: Tạo đơn hàng cơ bản với API create-online
      const orderData = {
        idkhachHang: customerId, // ID khách hàng từ user đang đăng nhập
        idnhanVien: null,
        idgiamGia: selectedVoucherId || null,
        ngayTao: null,
        // ✅ QUAN TRỌNG: Gửi finalTotal (đã bao gồm phí ship)
        tongTien: finalTotal, // 660k (630k + 30k ship) - Frontend đã tính xong
        tongTienGiamGia: orderDiscount, // 70k (nếu có voucher)
        phiVanChuyen: shippingFee, // Phí ship từ GHN API
        tenNguoiNhan: customerName,
        soDienThoaiGiaoHang: customerPhone,
        emailGiaoHang: customerEmail,
        // ✅ SỬA: Chỉ sử dụng customerAddress (đã bao gồm địa chỉ chi tiết)
        diaChiGiaoHang: customerAddress,
        loaiDonHang: 'online', // Sử dụng chữ thường để phù hợp với Backend
        trangThai: 0 // COD: Chờ xác nhận (cần xác nhận thủ công)
      };



      const orderRes = await fetch(config.getApiUrl('api/donhang/create-online'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) throw new Error('Lỗi khi tạo đơn hàng');

      const createdOrder = await orderRes.json();
      const newOrderId = createdOrder.id;


      // BƯỚC 2: Tạo đơn hàng chi tiết cho từng sản phẩm (giống BanHangTaiQuay)

      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        // Xử lý data từ giỏ hàng
        let chiTietData;

        // ✅ SỬA: Logic xử lý cấu trúc dữ liệu giỏ hàng
        if (item.sanPhamChiTiet && item.sanPhamChiTiet.id) {
          // 📦 Cấu trúc từ giỏ hàng với sanPhamChiTiet
          const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia &&
            item.sanPhamChiTiet.giaBanGiamGia > 0 &&
            item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
          const giaBan = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.sanPhamChiTiet.id,
            soLuong: item.soLuong || 1,
            gia: giaBan,
            thanhTien: giaBan * (item.soLuong || 1),
          };



        } else if (item.giaBan !== undefined && item.idSanPhamChiTiet) {
          // 🆕 Cấu trúc mới từ backend
          const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
          const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.idSanPhamChiTiet,
            soLuong: item.soLuong || 1,
            gia: finalPrice,
            thanhTien: finalPrice * (item.soLuong || 1),
          };



        } else if (item.gia !== undefined && item.idSanPhamChiTiet) {
          // 🔍 Cấu trúc có trường gia trực tiếp
          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.idSanPhamChiTiet,
            soLuong: item.soLuong || 1,
            gia: item.gia,
            thanhTien: item.gia * (item.soLuong || 1),
          };



        } else if (item.price !== undefined) {
          // 🛒 Data từ mua ngay
          const hasDiscount = item.discountPrice && item.discountPrice < item.originalPrice;
          const finalPrice = hasDiscount ? item.discountPrice : item.price;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.id,
            soLuong: item.quantity || 1,
            gia: finalPrice,
            thanhTien: finalPrice * (item.quantity || 1),
          };



        } else {
          // ❌ Không nhận diện được cấu trúc
          console.error(`❌ Không thể xử lý item ${i + 1}:`, item);
          throw new Error(`Không thể xử lý sản phẩm ${i + 1}`);
        }

        console.log(`Tạo chi tiết sản phẩm ${i + 1}:`, chiTietData);

        // ✅ SỬA: Sử dụng API khác nhau cho COD và VNPAY
        let apiUrl;
        if (paymentMethod === 'cod') {
          // COD: Sử dụng API không trừ tồn kho
          apiUrl = config.getApiUrl('api/donhangchitiet/create_k_tru_ton_kho');
          console.log(`🎯 COD - Sử dụng API không trừ tồn kho: ${apiUrl}`);
        } else {
          // VNPAY: Sử dụng API trừ tồn kho (giữ nguyên)
          apiUrl = config.getApiUrl('api/donhangchitiet/create');
          console.log(`💳 VNPAY - Sử dụng API trừ tồn kho: ${apiUrl}`);
        }

        const chiTietRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiTietData)
        });

        if (!chiTietRes.ok) {
          console.error(`Lỗi tạo chi tiết sản phẩm ${i + 1}:`, await chiTietRes.text());
          throw new Error(`Lỗi khi tạo chi tiết sản phẩm ${i + 1}`);
        }

        console.log(`Đã tạo chi tiết sản phẩm ${i + 1} thành công`);
      }

      console.log('Hoàn thành tạo đơn hàng và chi tiết!');

      // ✅ BƯỚC 3: Cập nhật tổng tiền đơn hàng (chỉ khi KHÔNG có voucher)
      if (!selectedVoucherId) {
        console.log('Bước 3: Không có voucher - cập nhật tổng tiền đơn hàng...');

        try {
          const updateTotalRes = await fetch(config.getApiUrl(`api/don-hang/${newOrderId}/cap-nhat-tong-tien`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });

          if (updateTotalRes.ok) {
            const updatedOrder = await updateTotalRes.json();

            console.log('💰 Tổng tiền sau khi cập nhật:', updatedOrder.tongTien);
            console.log('🚚 Phí vận chuyển:', updatedOrder.phiVanChuyen);
          } else {
            console.warn('⚠️ Không thể cập nhật tổng tiền đơn hàng, nhưng đơn hàng đã được tạo');
          }
        } catch (updateTotalError) {
          console.warn('⚠️ Lỗi khi cập nhật tổng tiền đơn hàng:', updateTotalError);
        }
      } else {
        console.log('Bước 3: Có voucher - KHÔNG cần cập nhật tổng tiền (backend đã tính đúng)');
      }

      // ✅ BƯỚC 4: Áp dụng voucher qua API mới (nếu có chọn voucher) - GIỐNG BANHANGTAIQUAY
      if (selectedVoucherId) {
        console.log('Bước 4: Áp dụng voucher qua API mới (giống BanHangTaiQuay)...');
        console.log('🎫 Voucher ID:', selectedVoucherId);
        console.log('📦 Order ID:', newOrderId);

        const voucherApplied = await applyVoucherToOrder(newOrderId, selectedVoucherId);
        if (voucherApplied) {

          toast.success('Voucher đã được áp dụng thành công!');

          // ✅ Fetch lại thông tin đơn hàng để lấy tổng tiền chính xác từ backend
          await fetchOrderInfo(newOrderId);
        } else {
          console.warn('⚠️ Không thể áp dụng voucher qua API mới, nhưng đơn hàng đã tạo thành công');
        }
      }

      // ✅ BƯỚC 5: Xóa giỏ hàng CHỈ KHI thanh toán từ giỏ hàng, KHÔNG xóa khi mua ngay
      console.log('Bước 5: Xử lý xóa giỏ hàng...');

      // Kiểm tra xem có phải mua ngay không
      const isBuyNow = location.state?.buyNow === true;


      if (!isBuyNow && cart.length > 0) {
        console.log('🛒 Thanh toán từ giỏ hàng - Bắt đầu xóa giỏ hàng...');

        // ✅ SỬA LẠI: Lấy ID khách hàng từ user đang đăng nhập
        const customerId = getCustomerId();
        if (!customerId) {
          console.warn('⚠️ Không thể xác định ID khách hàng, bỏ qua xóa giỏ hàng');
        } else {
          try {

            const clearCartRes = await fetch(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`), {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });

            if (clearCartRes.ok) {

              toast.success('Đã xóa giỏ hàng sau khi thanh toán!');
            } else {
              const errorText = await clearCartRes.text();
              console.warn('⚠️ Không thể xóa giỏ hàng trên backend:', errorText);
            }
          } catch (clearCartError) {
            console.warn('⚠️ Lỗi khi xóa giỏ hàng backend:', clearCartError);
          }
        }

        // ✅ LUÔN xóa localStorage cart khi thanh toán từ giỏ hàng (bất kể backend có thành công hay không)
        try {
          localStorage.removeItem('cart');
          console.log('✅ Đã xóa localStorage cart (thanh toán từ giỏ hàng)');

          // ✅ Dispatch event để cập nhật UI
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
          console.log('✅ Đã dispatch event cartUpdated');

        } catch (localStorageError) {
          console.warn('⚠️ Lỗi khi xóa localStorage cart:', localStorageError);
        }

      } else if (isBuyNow) {
        console.log('✅ Mua ngay - KHÔNG xóa giỏ hàng');
      } else {
        console.log('✅ Không có sản phẩm nào trong giỏ hàng để xóa');
      }

      setLoading(false);

      // ✅ SỬA: Xử lý khác nhau cho COD và VNPAY
      if (paymentMethod === 'cod') {
        // ✅ COD: Hiển thị thông báo thành công và chuyển trang sau delay
        toast.success('🎊 Đặt hàng thành công! Đơn hàng đang chờ xác nhận.', {
          position: "top-center",
          autoClose: 5000,
        });

        // ✅ COD: Chuyển trang sau 3 giây để user đọc thông báo
        setTimeout(() => {
          navigate('/orders');
        }, 3000);

      } else {
        // ✅ VNPAY: Logic cũ (đã được xử lý ở CheckPayment)
        toast.success('Đặt hàng thành công!');
        navigate('/orders');
      }

    } catch (err) {
      console.error('Lỗi trong quá trình đặt hàng:', err);
      setLoading(false);
      toast.error(`Đặt hàng thất bại: ${err.message}`);
    }
  };





  return (
    <div className="gx-payment-root">
      <div className="gx-payment-main">
        {/* Cột trái: Form khách hàng */}
        <div className="gx-payment-form-col">
          {/* Khối địa chỉ kiểu Shopee */}
          <div className="gx-payment-address-card gx-payment-card">
            <div className="gx-payment-address-header">
              <div className="gx-payment-address-title-wrapper">
                <span className="gx-payment-address-title">Địa chỉ nhận hàng</span>
                {customerAddress && (
                  <span className="gx-payment-address-tag">Mặc định</span>
                )}
              </div>
              <button
                type="button"
                className="gx-payment-address-change"
                onClick={() => {
                  setAddressModalMode('list');
                  setAddressModalOpen(true);
                }}
              >
                Thay đổi
              </button>
            </div>
            <div className="gx-payment-address-body">
              <div className="gx-payment-address-name">
                {customerName || 'Chưa có tên'}{' '}
                {customerPhone && <span className="gx-payment-address-phone">{customerPhone}</span>}
              </div>
              <div className="gx-payment-address-text">
                {customerAddress || 'Chưa có địa chỉ. Vui lòng nhập thông tin bên dưới.'}
              </div>
            </div>
          </div>

          {/* <div className="gx-payment-form-group">
            <label>Ghi chú</label>
            <textarea className="gx-payment-input" style={{ minHeight: 60 }} value={customerNote} onChange={e => setCustomerNote(e.target.value)} placeholder="Ghi chú cho đơn hàng (nếu có)" />
          </div> */}
          <div className="gx-payment-card">
            <div className="gx-payment-form-group" style={{ marginBottom: 0 }}>
              <label>Phương thức thanh toán</label>
              <select
                className="gx-payment-input"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cột phải: Đơn hàng */}
        <div className="gx-payment-order-col">
          <h2 className="gx-payment-title">Đơn hàng của bạn</h2>

          {/* ✅ THÊM: Phần chọn voucher (giống BanHangTaiQuay - Modal) */}
          <div className="gx-payment-voucher-section gx-payment-card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>🎫 Mã giảm giá</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                className="gx-payment-button"
                style={{
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => setShowVoucherModal(true)}
                disabled={voucherLoading}
              >
                {voucherLoading ? 'Đang tải...' : 'Chọn voucher'}
              </button>
              {selectedVoucherId && (
                <button
                  className="gx-payment-button"
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleVoucherChange('')}
                >
                  Bỏ voucher
                </button>
              )}
            </div>

            {/* Hiển thị thông tin voucher đã chọn */}
            {selectedVoucherId && (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                  🎉 Voucher đã được áp dụng
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {vouchers.find(v => v.id === Number(selectedVoucherId))?.tenVoucher}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  {vouchers.find(v => v.id === Number(selectedVoucherId))?.moTa}
                </div>
                <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold' }}>
                  💰 Giá trị: {
                    (() => {
                      const voucher = vouchers.find(v => v.id === Number(selectedVoucherId));
                      if (voucher?.loaiVoucher === 'Giảm giá %') {
                        return `Giảm ${voucher.giaTri}% (tối đa ${((total * voucher.giaTri) / 100).toLocaleString()}₫)`;
                      } else if (voucher?.loaiVoucher === 'Giảm giá số tiền') {
                        return `Giảm ${voucher.giaTri.toLocaleString()}₫`;
                      }
                      return '';
                    })()
                  }
                </div>
              </div>
            )}

            {/* Hiển thị thông báo voucher */}
            {voucherMessage && (
              <div style={{
                background: voucherMessage.includes('thành công') ? '#f6ffed' : '#fff2f0',
                border: voucherMessage.includes('thành công') ? '1px solid #b7eb8f' : '1px solid #ffccc7',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: voucherMessage.includes('thành công') ? '#52c41a' : '#ff4d4f'
              }}>
                {voucherMessage}
              </div>
            )}
          </div>
          <div className="gx-payment-order-list gx-payment-card">
            {cart.length === 0 ? (
              <p>Không có sản phẩm nào!</p>
            ) : (
              cart.map((item, index) => {
                console.log(`🔍 DEBUG Item ${index}:`, item);
                console.log(`🔍 DEBUG Item ${index} keys:`, Object.keys(item));

                // ✅ SỬA: Xử lý "mua ngay" TRƯỚC TIÊN (có trường hinhAnh)
                if (item.hinhAnh) {
                  // 🛒 MUA NGAY: Có trường hinhAnh, giaBan, giaBanGiamGia, soLuong
                  const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
                  const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;
                  const soLuong = item.soLuong || 1;

                  return (
                    <div key={index} className="gx-payment-order-item">
                      <img
                        src={item.hinhAnh || 'https://via.placeholder.com/80'}
                        alt={item.tenSanPham || 'Sản phẩm'}
                        className="gx-payment-order-img"
                      />
                      <div className="gx-payment-order-info">
                        <div className="gx-payment-order-name">
                          {item.tenSanPham || 'Tên sản phẩm'}
                        </div>
                        <div className="gx-payment-order-variant">
                          {item.mauSac && <span>Màu: {item.mauSac} </span>}
                          {item.kichThuoc && <span>Size: {item.kichThuoc}</span>}
                        </div>
                        <div className="gx-payment-order-qty">
                          Số lượng: {soLuong}
                        </div>
                      </div>
                      <div className="gx-payment-order-price">
                        {hasDiscount ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                              {(item.giaBan * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                          </div>
                        ) : (
                          <div>{(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</div>
                        )}
                      </div>
                    </div>
                  );
                } else if (item.giaBan !== undefined && item.giaBanGiamGia !== undefined) {
                  // 🆕 Cấu trúc mới từ backend
                  const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
                  const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;
                  const soLuong = item.soLuong || 1;

                  return (
                    <div key={index} className="gx-payment-order-item">
                      <img
                        src={item.imanges ?
                          `http://localhost:8080/api/images/${encodeURIComponent(item.imanges)}` :
                          'https://via.placeholder.com/80'
                        }
                        alt={item.tenSanPham || 'Sản phẩm'}
                        className="gx-payment-order-img"
                      />
                      <div className="gx-payment-order-info">
                        <div className="gx-payment-order-name">
                          {item.tenSanPham || 'Tên sản phẩm'}
                        </div>
                        <div className="gx-payment-order-variant">
                          {item.tenMauSac && <span>Màu: {item.tenMauSac} </span>}
                          {item.tenKichThuoc && <span>Size: {item.tenKichThuoc}</span>}
                        </div>
                        <div className="gx-payment-order-qty">
                          Số lượng: {soLuong}
                        </div>
                      </div>
                      <div className="gx-payment-order-price">
                        {hasDiscount ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                              {(item.giaBan * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                          </div>
                        ) : (
                          <div>{(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</div>
                        )}
                      </div>
                    </div>
                  );
                } else if (item.sanPhamChiTiet) {
                  // 🔄 Cấu trúc cũ từ giỏ hàng
                  const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia &&
                    item.sanPhamChiTiet.giaBanGiamGia > 0 &&
                    item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
                  const finalPrice = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;
                  const soLuong = item.soLuong || 1;

                  return (
                    <div key={index} className="gx-payment-order-item">
                      <img
                        src={item.sanPhamChiTiet.sanPham?.imanges ?
                          `http://localhost:8080/api/images/${encodeURIComponent(item.sanPhamChiTiet.sanPham.imanges)}` :
                          'https://via.placeholder.com/80'
                        }
                        alt={item.sanPhamChiTiet.sanPham?.tenSanPham || 'Sản phẩm'}
                        className="gx-payment-order-img"
                      />
                      <div className="gx-payment-order-info">
                        <div className="gx-payment-order-name">
                          {item.sanPhamChiTiet.sanPham?.tenSanPham || 'Tên sản phẩm'}
                        </div>
                        <div className="gx-payment-order-variant">
                          {/* Có thể thêm màu, size nếu có */}
                        </div>
                        <div className="gx-payment-order-qty">
                          Số lượng: {soLuong}
                        </div>
                      </div>
                      <div className="gx-payment-order-price">
                        {hasDiscount ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                              {(item.sanPhamChiTiet.giaBan * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</div>
                          </div>
                        ) : (
                          <div>{(finalPrice * soLuong).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</div>
                        )}
                      </div>
                    </div>
                  );
                } else if (item.gia !== undefined) {
                  // Cấu trúc có trường gia trực tiếp
                  const soLuong = item.soLuong || 1;
                  console.log(`🔍 Cấu trúc gia trực tiếp: gia=${item.gia}, soLuong=${soLuong}`);
                  return (
                    <div key={index} className="gx-payment-order-item">
                      <img
                        src={item.imanges ?
                          `http://localhost:8080/api/images/${encodeURIComponent(item.imanges)}` :
                          'https://via.placeholder.com/80'
                        }
                        alt={item.tenSanPham || 'Sản phẩm'}
                        className="gx-payment-order-img"
                      />
                      <div className="gx-payment-order-info">
                        <div className="gx-payment-order-name">
                          {item.tenSanPham || 'Tên sản phẩm'}
                        </div>
                        <div className="gx-payment-order-variant">
                          {item.tenMauSac && <span>Màu: {item.tenMauSac} </span>}
                          {item.tenKichThuoc && <span>Size: {item.kichThuoc}</span>}
                        </div>
                        <div className="gx-payment-order-qty">
                          Số lượng: {soLuong}
                        </div>
                      </div>
                      <div className="gx-payment-order-price">
                        {(item.gia * soLuong).toLocaleString('vi-VN').replaceAll(',', '.') + ' ₫'}
                      </div>
                    </div>
                  );
                } else {
                  // Xử lý data từ mua ngay (cấu trúc cũ)
                  const quantity = item.quantity || 1;
                  console.log(`🛒 Data từ mua ngay (cấu trúc cũ): price=${item.price}, discountPrice=${item.discountPrice}, originalPrice=${item.originalPrice}, quantity=${quantity}`);
                  const hasDiscount = item.discountPrice && item.discountPrice < item.originalPrice;
                  const finalPrice = hasDiscount ? item.discountPrice : item.price;
                  console.log(`💰 Kết quả: hasDiscount=${hasDiscount}, finalPrice=${finalPrice}`);

                  return (
                    <div key={index} className="gx-payment-order-item">
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name || 'Sản phẩm'}
                        className="gx-payment-order-img"
                      />
                      <div className="gx-payment-order-info">
                        <div className="gx-payment-order-name">
                          {item.name || 'Tên sản phẩm'}
                        </div>
                        <div className="gx-payment-order-variant">
                          {item.color && <span>Màu: {item.color} </span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </div>
                        <div className="gx-payment-order-qty">
                          Số lượng: {quantity}
                        </div>
                      </div>
                      <div className="gx-payment-order-price">
                        {hasDiscount ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                              {(item.originalPrice * quantity).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {(finalPrice * quantity).toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                            </div>
                          </div>
                        ) : (
                          <div>{(finalPrice * quantity).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</div>
                        )}
                      </div>
                    </div>
                  );
                }
              })
            )}
          </div>
          <div className="gx-payment-summary gx-payment-card">
            <div className="gx-payment-summary-row">
              <span className="gx-payment-label">Tạm tính:</span>
              <span className="gx-payment-value">{total.toLocaleString('vi-VN').replaceAll(',', '.')} ₫</span>
            </div>

            {/* ✅ THÊM: Hiển thị giảm giá voucher */}
            {selectedVoucherId && (
              <div className="gx-payment-summary-row" style={{ color: '#52c41a' }}>
                <span className="gx-payment-label">🎫 Giảm giá voucher:</span>
                <span className="gx-payment-value">
                  -{orderDiscount.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                </span>
              </div>
            )}

            {/* ✅ THÊM: Hiển thị tiết kiệm từ khuyến mãi sản phẩm */}
            {(() => {
              let totalTietKiem = 0;
              cart.forEach(item => {
                if (item.giaBan !== undefined && item.giaBanGiamGia !== undefined) {
                  // Cấu trúc mới từ backend
                  // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
                  if (item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan) {
                    totalTietKiem += (item.giaBan - item.giaBanGiamGia) * item.soLuong;
                  }
                } else if (item.sanPhamChiTiet) {
                  if (item.giaBan !== undefined) {
                    // Cấu trúc mới từ backend
                    // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
                    if (item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan) {
                      totalTietKiem += (item.giaBan - item.giaBanGiamGia) * item.soLuong;
                    }
                  } else {
                    // Cấu trúc cũ
                    // ✅ SỬA: Logic đúng - kiểm tra null trước khi so sánh
                    if (item.sanPhamChiTiet.giaBanGiamGia && item.sanPhamChiTiet.giaBanGiamGia > 0 && item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan) {
                      totalTietKiem += (item.sanPhamChiTiet.giaBan - item.sanPhamChiTiet.giaBanGiamGia) * item.soLuong;
                    }
                  }
                } else if (item.discountPrice && item.discountPrice < item.originalPrice) {
                  // Mua ngay
                  totalTietKiem += (item.originalPrice - item.discountPrice) * item.quantity;
                }
              });

              if (totalTietKiem > 0) {
                return (
                  <div className="gx-payment-summary-row" style={{ color: '#e74c3c' }}>
                    <span className="gx-payment-label">💰 Tiết kiệm từ khuyến mãi:</span>
                    <span className="gx-payment-value">
                      -{totalTietKiem.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* ✅ THÊM: Hiển thị tổng tiền sau khi áp dụng voucher */}
            {selectedVoucherId && orderDiscount > 0 && (
              <div className="gx-payment-summary-row" style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#52c41a',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '8px'
              }}>
                <span className="gx-payment-label">Tổng tiền sau voucher:</span>
                <span className="gx-payment-value">{(total - orderDiscount).toLocaleString('vi-VN').replaceAll(',', '.')} ₫</span>
              </div>
            )}

            <div className="gx-payment-summary-row">
              <span className="gx-payment-label">Phí vận chuyển:</span>
              <span className="gx-payment-value">
                {shippingFeeLoading ? (
                  <span style={{ color: '#1890ff' }}>Đang tính...</span>
                ) : shippingFee > 0 ? (
                  `${shippingFee.toLocaleString('vi-VN').replaceAll(',', '.')} ₫`
                ) : (
                  <span style={{ color: '#ff4d4f' }}>Chưa tính phí</span>
                )}
              </span>
            </div>

            {/* Thông báo hướng dẫn tính phí vận chuyển */}
            {!selectedProvince || !selectedDistrict || !selectedWard ? (
              <div style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '8px 12px',
                marginTop: '8px',
                fontSize: '14px',
                color: '#d46b08'
              }}>
                💡 Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển chính xác
              </div>
            ) : (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '8px 12px',
                marginTop: '8px',
                fontSize: '14px',
                color: '#52c41a'
              }}>
                ✅ Đã chọn địa chỉ giao hàng
                {shippingFee > 0 && (
                  <span style={{ marginLeft: '8px' }}>
                    - Phí vận chuyển: {shippingFee.toLocaleString()}₫
                  </span>
                )}
              </div>
            )}

            <div className="gx-payment-summary-row" style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#e74c3c',
              borderTop: '2px solid #f0f0f0',
              paddingTop: '12px'
            }}>
              <span className="gx-payment-label">Tổng thanh toán:</span>
              <span className="gx-payment-value">{finalTotal.toLocaleString('vi-VN').replaceAll(',', '.')} ₫</span>
            </div>
          </div>

          <button
            className="gx-payment-btn"
            onClick={handlePayment}
            disabled={loading || !selectedProvince || !selectedDistrict || !selectedWard || shippingFee <= 0}
            style={{
              opacity: (!selectedProvince || !selectedDistrict || !selectedWard || shippingFee <= 0) ? 0.6 : 1,
              cursor: (!selectedProvince || !selectedDistrict || !selectedWard || shippingFee <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang xử lý...' :
              !selectedProvince || !selectedDistrict || !selectedWard ? 'Chọn địa chỉ giao hàng' :
                shippingFee <= 0 ? 'Đang tính phí vận chuyển...' : 'ĐẶT HÀNG'}
          </button>






        </div>
      </div>

      {/* ✅ THÊM: MODAL CHỌN VOUCHER (giống BanHangTaiQuay) */}
      <Dialog open={showVoucherModal} onClose={() => setShowVoucherModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chọn voucher</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell> {/* Cột icon đánh dấu */}
                <TableCell>Mã voucher</TableCell>
                <TableCell>Tên voucher</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell>Đơn tối thiểu</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vouchers.map(v => (
                <TableRow
                  key={v.id}
                  selected={String(selectedVoucherId) === String(v.id)}
                  style={
                    total < v.donToiThieu
                      ? { background: '#f5f5f5', color: '#aaa' }
                      : String(selectedVoucherId) === String(v.id)
                        ? { background: '#e3f2fd' }
                        : {}
                  }
                >
                  <TableCell>
                    {String(selectedVoucherId) === String(v.id) && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </TableCell>
                  <TableCell>{v.maVoucher}</TableCell>
                  <TableCell>{v.tenVoucher}</TableCell>
                  <TableCell>{v.loaiVoucher}</TableCell>
                  <TableCell>{v.soLuong}</TableCell>
                  <TableCell>
                    {v.loaiVoucher?.toLowerCase().includes('%') ? `${v.giaTri}%` : v.giaTri?.toLocaleString() + ' ₫'}
                  </TableCell>
                  <TableCell>{v.donToiThieu?.toLocaleString() || 0} ₫</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        setShowVoucherModal(false);
                        handleVoucherChange(v.id);
                      }}
                      disabled={total < v.donToiThieu}
                    >
                      Chọn
                    </Button>
                    {total < v.donToiThieu && (
                      <span style={{ color: 'red', fontSize: 12, marginLeft: 8 }}>
                        Không đủ điều kiện
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowVoucherModal(false);
              handleVoucherChange('');
            }}
            color="error"
            variant="outlined"
          >
            Bỏ voucher
          </Button>
          <Button onClick={() => setShowVoucherModal(false)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Popup chọn / lưu nhiều địa chỉ giao hàng (style giống Shopee) */}
      <Dialog open={addressModalOpen} onClose={() => setAddressModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Địa chỉ của tôi</DialogTitle>
        {addressModalMode === 'list' ? (
          <>
            <DialogContent>
              <div>
                {savedAddresses.length === 0 ? (
                  <div style={{ fontSize: 14, color: '#666' }}>
                    Bạn chưa có địa chỉ nào. Nhấn &quot;+ Thêm địa chỉ mới&quot; để tạo.
                  </div>
                ) : (
                  savedAddresses.map(addr => (
                    <div
                      key={addr.id}
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8
                      }}
                    >
                      <input
                        type="radio"
                        checked={addr.id === selectedAddressId}
                        onChange={() => {
                          applyAddressFromBook(addr);
                        }}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 600 }}>{addr.name}</span>
                          <span style={{ color: '#888' }}>|</span>
                          <span style={{ color: '#333' }}>{addr.phone}</span>
                          {addr.isDefault && (
                            <span style={{
                              marginLeft: 8,
                              fontSize: 11,
                              padding: '2px 6px',
                              borderRadius: 2,
                              border: '1px solid #ffb380',
                              color: '#ff6600'
                            }}>
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: '#666' }}>
                          {addr.fullAddress || addr.addressDetail}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#1677ff',
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => {
                          // bật chế độ sửa địa chỉ với dữ liệu sẵn có
                          setEditingAddressId(addr.id);
                          setCustomerName(addr.name || '');
                          setCustomerPhone(addr.phone || '');
                          setCustomerEmail(addr.email || '');
                          setAddressDetail(addr.addressDetail || '');
                          setSelectedProvince(addr.provinceId || null);
                          setSelectedDistrict(addr.districtId || null);
                          setSelectedWard(addr.wardCode || null);
                          setAddressModalMode('new');
                        }}
                      >
                        Cập nhật
                      </button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
            <DialogActions style={{ justifyContent: 'space-between' }}>
              <Button onClick={() => setAddressModalOpen(false)} color="inherit">
                Đóng
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // reset form rồi chuyển sang chế độ thêm mới
                  setEditingAddressId(null);
                  setCustomerName('');
                  setCustomerPhone('');
                  setCustomerEmail('');
                  setAddressDetail('');
                  setSelectedProvince(null);
                  setSelectedDistrict(null);
                  setSelectedWard(null);
                  setAddressModalMode('new');
                }}
              >
                + Thêm địa chỉ mới
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent>
              <h4 style={{ marginBottom: 16 }}>Địa chỉ mới</h4>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="gx-payment-form-group" style={{ flex: 1 }}>
                  <label>Họ và tên <span>*</span></label>
                  <input
                    className="gx-payment-input"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Họ và tên"
                  />
                </div>
                <div className="gx-payment-form-group" style={{ flex: 1 }}>
                  <label>Số điện thoại <span>*</span></label>
                  <input
                    className="gx-payment-input"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Số điện thoại"
                  />
                </div>
              </div>
              <div className="gx-payment-form-group">
                <label>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã <span>*</span></label>
                <AddressSelector
                  selectedProvince={selectedProvince}
                  selectedDistrict={selectedDistrict}
                  selectedWard={selectedWard}
                  onProvinceChange={handleProvinceChange}
                  onDistrictChange={handleDistrictChange}
                  onWardChange={handleWardChange}
                />
              </div>
              <div className="gx-payment-form-group">
                <label>Địa chỉ cụ thể <span>*</span></label>
                <input
                  className="gx-payment-input"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  placeholder="Số nhà, tên đường, tòa nhà..."
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setAddressModalMode('list');
                }}
                color="inherit"
              >
                Trở lại
              </Button>
              <Button
                onClick={() => {
                  if (!customerName || !customerPhone || !selectedProvince || !selectedDistrict || !selectedWard || !addressDetail) {
                    toast.warning('Vui lòng nhập đầy đủ thông tin địa chỉ!');
                    return;
                  }

                  const province = provinces.find(p => p.ProvinceID === selectedProvince);
                  const district = districts.find(d => d.DistrictID === selectedDistrict);
                  const ward = wards.find(w => w.WardCode === selectedWard);

                  const fullAddress = `${addressDetail}, ${ward?.WardName || ''}, ${district?.DistrictName || ''}, ${province?.ProvinceName || ''}`.replace(/, ,/g, ',');

                  if (editingAddressId) {
                    const next = savedAddresses.map(a =>
                      a.id === editingAddressId
                        ? {
                            ...a,
                            name: customerName,
                            phone: customerPhone,
                            email: customerEmail,
                            addressDetail,
                            fullAddress,
                            provinceId: selectedProvince,
                            districtId: selectedDistrict,
                            wardCode: selectedWard
                          }
                        : a
                    );
                    setSavedAddresses(next);
                    localStorage.setItem('savedAddresses', JSON.stringify(next));
                    const updated = next.find(a => a.id === editingAddressId);
                    applyAddressFromBook(updated);
                  } else {
                    const newAddr = {
                      id: Date.now(),
                      name: customerName,
                      phone: customerPhone,
                      email: customerEmail,
                      addressDetail,
                      fullAddress,
                      provinceId: selectedProvince,
                      districtId: selectedDistrict,
                      wardCode: selectedWard,
                      isDefault: savedAddresses.length === 0
                    };
                    const next = [...savedAddresses, newAddr];
                    setSavedAddresses(next);
                    localStorage.setItem('savedAddresses', JSON.stringify(next));
                    applyAddressFromBook(newAddr);
                  }

                  setAddressModalMode('list');
                  setAddressModalOpen(false);
                }}
                color="primary"
                variant="contained"
              >
                Hoàn thành
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ToastContainer />
    </div>
  );


};

export default Payment;