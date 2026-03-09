import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Card, CardHeader, CardContent, Chip, Box, MenuItem
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Swal from 'sweetalert2';
import InvoicePrint from './InvoicePrint';
import { validateAdminForOrder, debugAdminInfo } from './utils/adminUtils';
import QRCodePayment from './components/QRCodePayment';

const BanHangTaiQuayPage = () => {
  // State mẫu cho UI demo
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [voucher, setVoucher] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showProductTable, setShowProductTable] = useState(false);

  // State cho sản phẩm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho tìm kiếm
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // State cho hóa đơn
  const [orderId, setOrderId] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // State cho modal chọn số lượng khi thêm
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // State cho modal sửa số lượng
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // State cho danh sách hóa đơn chờ
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // State thu gọn/mở rộng bảng hóa đơn chờ
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(c => !c);

  // State thu gọn/mở rộng hóa đơn tạm
  const [collapsedCart, setCollapsedCart] = useState(false);
  const toggleCollapseCart = () => setCollapsedCart(c => !c);

  // State thu gọn/xổ danh sách sản phẩm
  const [showAllProducts, setShowAllProducts] = useState(false);
  const PRODUCTS_PER_ROW = 4;
  const ROWS_SHOWN = 2;
  const MAX_PRODUCTS_SHOWN = PRODUCTS_PER_ROW * ROWS_SHOWN;



  // State cho thông tin khách hàng và voucher
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');


  // State cho danh sách voucher và voucher đã chọn
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null); // Sử dụng null thay vì chuỗi rỗng

  // State cho danh sách khách hàng và khách hàng đã chọn
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // State cho modal thanh toán
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT');

  // Thêm state cho modal thanh toán chuyển khoản
  const [showQRPaymentModal, setShowQRPaymentModal] = useState(false);

  // Thêm state cho thông báo voucher
  const [voucherMessage, setVoucherMessage] = useState('');

  // State cho modal tạo khách hàng mới
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    tenKhachHang: '',
    email: '',
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    diaChi: ''
  });
  const [createCustomerLoading, setCreateCustomerLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Thêm state cho thông báo khách hàng
  const [customerMessage, setCustomerMessage] = useState('');

  // Thêm state cho in hóa đơn
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Thêm state ở đầu component nếu chưa có
  const [showProductModal, setShowProductModal] = useState(false);

  // Thêm state cho modal chọn khách hàng
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // State cho filter màu sắc và size
  const [filterColor, setFilterColor] = useState('');
  const [filterSize, setFilterSize] = useState('');

  // Hàm xử lý đường dẫn ảnh giống như SanPhamPage
  const getImageUrl = (img) => {
    if (!img) return '/logo192.png';
    // Nếu là mảng, lấy phần tử đầu
    if (Array.isArray(img)) img = img[0];
    // Nếu là chuỗi nhiều ảnh, lấy ảnh đầu
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];
    img = img.trim();
    if (!img) return '/logo192.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return 'http://localhost:8080' + img;
    
    // Sử dụng API endpoint thay vì static resource
    return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
  };

  // Thêm state cho tổng tiền và tổng tiền giảm giá từ BE
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState(0);

  // Load danh sách voucher khi mount
  useEffect(() => {
    fetch('http://localhost:8080/api/voucher')
      .then(res => res.json())
      .then(data => setVouchers(data || []));
  }, []);

  // Load danh sách khách hàng khi mount
  useEffect(() => {
    fetch('http://localhost:8080/api/khachhang')
      .then(res => res.json())
      .then(data => setCustomers(data || []));
  }, []);

  // Fetch sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll');
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
        const data = await res.json();
        // Sử dụng trường giaBanSauGiam từ backend
        const productsWithPromo = data.map((product) => ({
          ...product,
          giaBanGiamGia: product.giaBanSauGiam // Map từ giaBanSauGiam sang giaBanGiamGia để tương thích với code hiện tại
        }));
        console.log('Dữ liệu sản phẩm từ API:', productsWithPromo[0]);
        setProducts(Array.isArray(productsWithPromo) ? productsWithPromo : []);
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lấy lại danh sách sản phẩm trong hóa đơn từ BE
  const fetchCartFromBE = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`);
      if (!res.ok) throw new Error('Lỗi khi lấy chi tiết hóa đơn');
      const data = await res.json();
      // Join thêm tên sản phẩm, màu, size từ products
      const cartWithInfo = data.map(item => {
        const prod = products.find(p => p.id === item.idSanPhamChiTiet);
        return {
          ...item,
          tenSanPham: prod?.tenSanPham || '',
          mauSac: prod?.mauSac || '',
          kichThuoc: prod?.kichThuoc || '',
          giaBan: prod?.giaBan || item.gia, // Lấy giá gốc từ sản phẩm
          giaBanGiamGia: prod?.giaBanSauGiam || null, // Lấy giá khuyến mãi từ sản phẩm
          quantity: item.soLuong,
        };
      });
      setCart(cartWithInfo);
    } catch (err) {
      setCart([]);
    }
  };

  // Sau khi tạo hóa đơn, hoặc khi orderId thay đổi, load lại cart
  useEffect(() => {
    if (orderId) fetchCartFromBE(orderId);
    // eslint-disable-next-line
  }, [orderId, products]);

  // Hàm lấy lại danh sách sản phẩm từ BE
  const fetchProductsFromBE = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll');
      if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
      const data = await res.json();
      // Sử dụng trường giaBanSauGiam từ backend
      const productsWithPromo = data.map((product) => ({
        ...product,
        giaBanGiamGia: product.giaBanSauGiam // Map từ giaBanSauGiam sang giaBanGiamGia để tương thích với code hiện tại
      }));
      setProducts(Array.isArray(productsWithPromo) ? productsWithPromo : []);
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy lại danh sách khách hàng từ BE
  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/khachhang');
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách khách hàng');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
    }
  };

  // Hàm helper cập nhật tồn kho sản phẩm
  const updateProductStock = async (productId, quantityChange) => {
    try {
      const updateStockRes = await fetch(`http://localhost:8080/api/san-pham-chi-tiet/update-stock/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soLuongChange: quantityChange
        }),
      });
      
      if (!updateStockRes.ok) {
        console.warn(`Không thể cập nhật tồn kho cho sản phẩm ${productId}`);
        return false;
      }
      return true;
    } catch (stockError) {
      console.warn(`Lỗi khi cập nhật tồn kho cho sản phẩm ${productId}:`, stockError);
      return false;
    }
  };

  // Hàm thêm sản phẩm vào hóa đơn
  const handleAddToOrder = async () => {
    if (!orderId) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng chọn hoặc tạo hóa đơn trước!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        width: 250
      });
      return;
    }
    if (!selectedProduct) return;
    if (qty < 1 || qty > selectedProduct.soLuong) {
      setAddError('Số lượng không hợp lệ!');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const body = {
        idDonHang: orderId,
        idSanPhamChiTiet: selectedProduct.id,
        soLuong: qty,
        gia: selectedProduct.giaBanGiamGia || selectedProduct.giaBan, // Sử dụng giá khuyến mãi hoặc giá gốc
        thanhTien: (selectedProduct.giaBanGiamGia || selectedProduct.giaBan) * qty,
      };
      const res = await fetch('http://localhost:8080/api/donhangchitiet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Lỗi khi thêm sản phẩm vào hóa đơn');
      
      // Cập nhật số lượng tồn kho sản phẩm
      try {
        await updateProductStock(selectedProduct.id, -qty); // Giảm số lượng tồn kho
      } catch (stockError) {
        console.warn('Lỗi khi cập nhật tồn kho:', stockError);
      }
      
      setShowQtyModal(false);
      await fetchCartFromBE(orderId);
      await fetchProductsFromBE(); // Cập nhật lại danh sách sản phẩm với số lượng tồn kho mới
      Swal.fire({
        icon: 'success',
        title: 'Thêm sản phẩm thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (err) {
      setAddError(err.message || 'Lỗi không xác định');
    } finally {
      setAddLoading(false);
    }
  };

  // Hàm sửa số lượng sản phẩm trong hóa đơn tạm (có xác nhận)
  const handleShowEditModal = async (idx) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn sửa sản phẩm này không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      setEditIdx(idx);
      setEditQty(Number(cart[idx]?.quantity || 1));
      setEditError('');
      setShowEditModal(true);
      
    }
  };

  // Gọi API sửa số lượng
  const handleEditQty = async () => {
    const item = cart[editIdx];
    if (!item || editQty < 1) {
      setEditError('Số lượng không hợp lệ!');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      // Tính số lượng thay đổi
      const oldQuantity = item.quantity;
      const quantityChange = editQty - oldQuantity;
      
      // Cập nhật chi tiết đơn hàng
      const res = await fetch(`http://localhost:8080/api/donhangchitiet/update/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soLuong: editQty,
          thanhTien: (item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan ? item.giaBanGiamGia : item.giaBan) * editQty,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setEditError(errData.message || 'Lỗi khi cập nhật số lượng!');
        setEditLoading(false);
        return;
      }

      // Cập nhật số lượng tồn kho sản phẩm
      if (quantityChange !== 0) {
        try {
          await updateProductStock(item.idSanPhamChiTiet, -quantityChange); // Giảm số lượng đã thêm, tăng số lượng đã bớt
        } catch (stockError) {
          console.warn('Lỗi khi cập nhật tồn kho:', stockError);
        }
      }

      setShowEditModal(false);
      await fetchCartFromBE(orderId);
      await fetchProductsFromBE(); // Cập nhật lại danh sách sản phẩm với số lượng tồn kho mới
      Swal.fire({
        icon: 'success',
        title: 'Sửa sản phẩm thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (err) {
      setEditError('Lỗi khi cập nhật số lượng!');
    } finally {
      setEditLoading(false);
    }
  };

  // Hàm xóa sản phẩm khỏi hóa đơn tạm (có xác nhận)
  const handleRemoveFromCart = async (idx) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      if (!orderId || !cart[idx]) return;
      try {
        const itemToRemove = cart[idx];
        const quantityToRestore = itemToRemove.quantity; // Số lượng cần hoàn lại
        
        // Xóa chi tiết đơn hàng
        const res = await fetch(`http://localhost:8080/api/donhangchitiet/delete/${itemToRemove.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Lỗi khi xóa sản phẩm khỏi hóa đơn');
        
        // Hoàn lại số lượng tồn kho sản phẩm
        try {
          await updateProductStock(itemToRemove.idSanPhamChiTiet, quantityToRestore); // Tăng lại số lượng đã bị giảm
        } catch (stockError) {
          console.warn('Lỗi khi cập nhật tồn kho:', stockError);
        }
        
        await fetchCartFromBE(orderId);
        await fetchProductsFromBE(); // Cập nhật lại danh sách sản phẩm với số lượng tồn kho mới
        Swal.fire({
        icon: 'success',
        title: 'Xóa Sản Phẩm Thành Công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      } catch (err) {
        // Có thể hiện alert lỗi nếu muốn
        console.error('Lỗi khi xóa sản phẩm:', err);
      }
    }
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => {
    const giaBan = item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan ? item.giaBanGiamGia : item.giaBan;
    return sum + giaBan * item.quantity;
  }, 0);
  const totalHang = cart.reduce((sum, item) => {
    const giaBan = item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan ? item.giaBanGiamGia : item.giaBan;
    return sum + giaBan * item.quantity;
  }, 0);
  const totalGiamGia = cart.reduce((sum, item) => {
    if (item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan) {
      return sum + (item.giaBan - item.giaBanGiamGia) * item.quantity;
    }
    return sum;
  }, 0);
  const totalThanhToan = totalHang - totalGiamGia;

  // Lấy giá trị duy nhất cho màu sắc và size
  const colorOptions = [...new Set(products.map(p => p.mauSac).filter(Boolean))];
  const sizeOptions = [...new Set(products.map(p => p.kichThuoc).filter(Boolean))];

  // Lọc sản phẩm theo filter
  const filteredProducts = products.filter(p =>
    (!filterColor || p.mauSac === filterColor) &&
    (!filterSize || p.kichThuoc === filterSize) &&
    p.tenSanPham.toLowerCase().includes(search.toLowerCase())
  );

  // Hàm mở modal chọn số lượng khi bấm Thêm vào hóa đơn
  const handleShowQtyModal = (product) => {
    console.log('Chọn sản phẩm:', product);
    setSelectedProduct(product);
    setQty(1);
    setAddError('');
    setShowQtyModal(true);
  };

  // Hàm tạo hóa đơn mới (có xác nhận)
  const handleCreateOrder = async () => {
    if (orders.length >= 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Chỉ được tạo tối đa 5 hóa đơn chờ!',
        text: 'Vui lòng hoàn thành hoặc hủy bớt hóa đơn trước khi tạo mới.',
        confirmButtonText: 'OK',
        width: 350
      });
      return;
    }
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn tạo hóa đơn mới không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33',
      width: 300,
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
    if (!result.isConfirmed) return;
    setOrderLoading(true);
    setOrderError('');
    try {
      // Debug: Kiểm tra thông tin admin
      debugAdminInfo();
      
      // Validate thông tin nhân viên
      const adminValidation = validateAdminForOrder();
      if (!adminValidation.success) {
        throw new Error(adminValidation.message);
      }
      const idNhanVien = adminValidation.adminId;

      const now = new Date();
      const orderData = { 
        idnhanVien: idNhanVien, // Thêm ID nhân viên (khớp với DTO backend)
        loaiDonHang: 'Bán hàng tại quầy', 
        trangThai: 0, 
        ngayTao: now.toISOString().slice(0, 10), // Format: YYYY-MM-DD cho LocalDate
        ngayMua: null // Để null, sẽ set khi thanh toán
      };
      
      // Debug: Log order data
      console.log('Creating order with data:', orderData);
      console.log('Admin ID:', idNhanVien);
      
      const res = await fetch('http://localhost:8080/api/donhang/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Lỗi khi tạo hóa đơn');
      const data = await res.json();
      setOrderId(data.id);
      await fetchOrders();
    } catch (err) {
      setOrderError(err.message || 'Lỗi không xác định');
    } finally {
      setOrderLoading(false);
    }
  };

  // Lấy danh sách hóa đơn chờ (tạm thời lấy tất cả đơn hàng)
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await fetch('http://localhost:8080/api/donhang/chuahoanthanh');
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách hóa đơn');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.message || 'Lỗi không xác định');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Khi chọn hóa đơn chờ để thao tác tiếp
  const handleSelectOrder = (order) => {
    setOrderId(order.id);
  };

  useEffect(() => {
    console.log('products:', products);
    console.log('filteredProducts:', filteredProducts);
    console.log('loading:', loading, 'error:', error);
  }, [products, filteredProducts, loading, error]);

  // Hàm thêm khách hàng và tạo hóa đơn mới
  const addCustomerAndCreateOrder = async (e) => {
    if (e) e.stopPropagation();
    // Nếu tất cả các trường đều rỗng => khách lẻ
    if (!customerName && !customerEmail && !customerPhone) {
      // Tạo hóa đơn không có idKhachHang (khách lẻ)
      handleCreateOrder();
      return;
    }
    // Validate số điện thoại không trùng
    if (customerPhone && customers.some(c => c.soDienThoai === customerPhone)) {
      Swal.fire({
        icon: 'error',
        title: 'Số điện thoại đã tồn tại!',
        text: 'Vui lòng nhập số điện thoại khác.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        width: 300
      });
      return;
    }
    // Nếu đã nhập thông tin khách hàng (ít nhất 1 trường)
    const customerBody = {
      tenKhachHang: customerName,
      email: customerEmail,
      ngaySinh: "",
      gioiTinh: "",
      diaChi: "",
      soDienThoai: customerPhone,
      trangThai: "",
      maThongBao: null,
      thoiGianThongBao: null
    };
    try {
      const res = await fetch('http://localhost:8080/api/khachhang/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerBody)
      });
      if (!res.ok) throw new Error('Lỗi khi thêm khách hàng!');
      const customer = await res.json();
      const customerId = customer.id;
      // Tạo hóa đơn với idKhachHang
      setOrderLoading(true);
      setOrderError('');
      
      // Debug: Kiểm tra thông tin admin
      debugAdminInfo();
      
      // Validate thông tin nhân viên
      const adminValidation = validateAdminForOrder();
      if (!adminValidation.success) {
        throw new Error(adminValidation.message);
      }
      const idNhanVien = adminValidation.adminId;
      
      const now = new Date();
      const orderData = { 
        idKhachHang: customerId, 
        idnhanVien: idNhanVien, // Thêm ID nhân viên (khớp với DTO backend)
        loaiDonHang: 'Bán hàng tại quầy', 
        trangThai: 0,
        ngayTao: now.toISOString().slice(0, 10), // Format: YYYY-MM-DD cho LocalDate
        ngayMua: null // Để null, sẽ set khi thanh toán
      };
      
      // Debug: Log order data
      console.log('Creating order with customer data:', orderData);
      console.log('Admin ID:', idNhanVien);
      console.log('Customer ID:', customerId);
      
      const resOrder = await fetch('http://localhost:8080/api/donhang/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!resOrder.ok) throw new Error('Lỗi khi tạo hóa đơn!');
      const order = await resOrder.json();
      setOrderId(order.id);
      await fetchOrders();
    } catch (err) {
      setOrderError(err.message || 'Lỗi không xác định');
    } finally {
      setOrderLoading(false);
    }
  };

  // Reset form thông tin khách hàng và voucher khi chọn hóa đơn khác hoặc tạo mới
  useEffect(() => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedVoucherId(null); // Reset về null thay vì chuỗi rỗng
  }, [orderId]);

  // Hàm mở modal thanh toán
  const handleOpenPaymentModal = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể thanh toán khi hóa đơn chưa có sản phẩm!',
        showConfirmButton: false,
        timer: 1800,
        width: 350
      });
      return;
    }
    setPaymentAmount("");
    setPaymentMethod('TIEN_MAT');
    setShowPaymentModal(true);
  };

  // Hàm xác nhận thanh toán (gọi API cập nhật tổng tiền và trạng thái)
  const handleConfirmPayment = async () => {
    if (!orderId) return;
    try {
      const payload = {
        tongTien: orderTotal, // Sử dụng orderTotal thay vì total để bao gồm giảm giá voucher
        idgiamGia: selectedVoucherId, // Thêm thông tin voucher để BE không reset
        idkhachHang: selectedCustomerId || null,
        tenKhachHang: !selectedCustomerId && customerName ? customerName : null,
        email: !selectedCustomerId && customerEmail ? customerEmail : null,
        soDienThoai: !selectedCustomerId && customerPhone ? customerPhone : null
      };
      const res = await fetch(`http://localhost:8080/api/xacnhanthanhtoan/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Lỗi khi xác nhận thanh toán');
      setShowPaymentModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Thanh toán thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      await fetchOrders();
      // Lấy lại dữ liệu đơn hàng và chi tiết đơn hàng từ API
      const [orderRes, chiTietRes, spctRes] = await Promise.all([
        fetch(`http://localhost:8080/api/donhang/${orderId}`),
        fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`),
        fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll')
      ]);
      const orderData = await orderRes.json();
      const chiTietData = await chiTietRes.json();
      const spctData = await spctRes.json();
      
      // Thêm thông tin khách hàng vào orderData
      const khachHang = customers.find(c => c.id === Number(orderData.idkhachHang));
      const orderDataWithCustomer = {
        ...orderData,
        customerName: khachHang ? khachHang.tenKhachHang : null
      };
      
      setOrderInfo(orderDataWithCustomer);
      setChiTietList(chiTietData);
      setSpctList(spctData);
      setShowInvoice(true);
      // RESET trạng thái hóa đơn tạm
      resetAllStates();
    } catch (err) {
      setOrderError(err.message || 'Lỗi không xác định');
    } finally {
      setOrderLoading(false);
    }
  };

  // Hàm xử lý khi chọn phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'CHUYEN_KHOAN') {
      // Nếu chọn chuyển khoản, đóng modal thanh toán tiền mặt và mở modal QR Code
      setShowPaymentModal(false);
      setShowQRPaymentModal(true);
    }
  };

  // Hàm xử lý khi xác nhận thanh toán chuyển khoản
  const handleQRPaymentConfirmed = async () => {
    if (!orderId) return;
    try {
      const payload = {
        tongTien: orderTotal,
        idgiamGia: selectedVoucherId, // Thêm thông tin voucher để BE không reset
        idkhachHang: selectedCustomerId || null,
        tenKhachHang: !selectedCustomerId && customerName ? customerName : null,
        email: !selectedCustomerId && customerEmail ? customerEmail : null,
        soDienThoai: !selectedCustomerId && customerPhone ? customerPhone : null
      };
      const res = await fetch(`http://localhost:8080/api/xacnhanthanhtoan/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Lỗi khi xác nhận thanh toán');
      setShowQRPaymentModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Thanh toán chuyển khoản thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
      await fetchOrders();
      // Lấy lại dữ liệu đơn hàng và chi tiết đơn hàng từ API
      const [orderRes, chiTietRes, spctRes] = await Promise.all([
        fetch(`http://localhost:8080/api/donhang/${orderId}`),
        fetch(`http://localhost:8080/api/donhangchitiet/don-hang/${orderId}`),
        fetch('http://localhost:8080/api/san-pham-chi-tiet/getAll')
      ]);
      const orderData = await orderRes.json();
      const chiTietData = await chiTietRes.json();
      const spctData = await spctRes.json();
      
      // Thêm thông tin khách hàng vào orderData
      const khachHang = customers.find(c => c.id === Number(orderData.idkhachHang));
      const orderDataWithCustomer = {
        ...orderData,
        customerName: khachHang ? khachHang.tenKhachHang : null
      };
      
      setOrderInfo(orderDataWithCustomer);
      setChiTietList(chiTietData);
      setSpctList(spctData);
      setShowInvoice(true);
      // RESET trạng thái hóa đơn tạm
      resetAllStates();
    } catch (err) {
      setOrderError(err.message || 'Lỗi không xác định');
    } finally {
      setOrderLoading(false);
    }
  };

  // Khi orderId thay đổi, fetch lại thông tin đơn hàng để set lại selectedVoucherId và selectedCustomerId
  useEffect(() => {
    if (!orderId) return;
    fetchOrderInfo(orderId);
  }, [orderId, cart, customers]);

  // Thay thế hàm chọn voucher
  const handleVoucherChange = async (e) => {
    const voucherId = e.target.value;
    setSelectedVoucherId(voucherId || null); // Xử lý nhất quán với null
    setVoucherMessage('');

    if (!orderId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/update-voucher/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idgiamGia: voucherId ? Number(voucherId) : null })
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật voucher cho hóa đơn');
      setVoucherMessage(voucherId ? 'Áp dụng voucher thành công!' : 'Đã bỏ chọn voucher!');
      // Fetch lại thông tin hóa đơn để cập nhật tổng tiền và giảm giá
      await fetchOrderInfo(orderId);
    } catch (err) {
      setVoucherMessage(err.message || 'Lỗi khi áp dụng voucher!');
    }
  };

  // Hàm xử lý khi chọn khách hàng
  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    setCustomerMessage('');

    // Cập nhật thông tin form
    const kh = customers.find(c => c.id === Number(customerId));
    if (kh) {
      setCustomerName(kh.tenKhachHang || '');
      setCustomerEmail(kh.email || '');
      setCustomerPhone(kh.soDienThoai || '');
    } else {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
    }

    if (!orderId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/update-khachhang/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idkhachHang: customerId ? Number(customerId) : null })
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật khách hàng cho hóa đơn');
      setCustomerMessage(customerId ? 'Chọn khách hàng thành công!' : 'Đã chuyển về khách lẻ!');
      await fetchOrders();
    } catch (err) {
      setCustomerMessage(err.message || 'Lỗi khi cập nhật khách hàng!');
    }
  };

  // Hàm validation form
  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra tên khách hàng
    if (!newCustomerForm.tenKhachHang.trim()) {
      errors.tenKhachHang = 'Vui lòng nhập họ và tên';
    } else if (newCustomerForm.tenKhachHang.trim().length < 2) {
      errors.tenKhachHang = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    // Kiểm tra số điện thoại
    if (!newCustomerForm.soDienThoai.trim()) {
      errors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(newCustomerForm.soDienThoai.trim())) {
      errors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    // Kiểm tra email
    if (!newCustomerForm.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomerForm.email.trim())) {
      errors.email = 'Email không đúng định dạng';
    }
    
    // Kiểm tra địa chỉ
    if (!newCustomerForm.diaChi.trim()) {
      errors.diaChi = 'Vui lòng nhập địa chỉ';
    } else if (newCustomerForm.diaChi.trim().length < 5) {
      errors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Hàm kiểm tra form có hợp lệ không
  const isFormValid = () => {
    return (
      newCustomerForm.tenKhachHang.trim().length >= 2 &&
      newCustomerForm.soDienThoai.trim().length >= 10 &&
      /^[0-9]{10,11}$/.test(newCustomerForm.soDienThoai.trim()) &&
      newCustomerForm.email.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomerForm.email.trim()) &&
      newCustomerForm.diaChi.trim().length >= 5
    );
  };

  // Hàm xử lý tạo khách hàng mới
  const handleCreateCustomer = async () => {
    // Kiểm tra form có hợp lệ không
    if (!isFormValid()) {
      // Nếu không hợp lệ, hiển thị tất cả lỗi
      validateForm();
      return;
    }

    setCreateCustomerLoading(true);
    try {
      // Map giá trị đúng với backend
      const dataSend = {
        tenKhachHang: newCustomerForm.tenKhachHang,
        email: newCustomerForm.email,
        soDienThoai: newCustomerForm.soDienThoai,
        ngaySinh: newCustomerForm.ngaySinh ? new Date(newCustomerForm.ngaySinh).toISOString() : null,
        gioiTinh: newCustomerForm.gioiTinh === 'Nam' ? true : false,
        diaChi: newCustomerForm.diaChi,
        trangThai: true,
        maThongBao: null,
        thoiGianThongBao: null,
      };

      const res = await fetch('http://localhost:8080/api/khachhang/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSend),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || 'Thêm khách hàng thất bại');
      }

      const newCustomer = await res.json();
      
      // Hiển thị thông báo thành công
      Swal.fire({
        icon: 'success',
        title: 'Thêm khách hàng thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });

      // Cập nhật danh sách khách hàng
      await fetchCustomers();

      // Tự động chọn khách hàng mới tạo
      if (orderId) {
        try {
          const updateRes = await fetch(`http://localhost:8080/api/update-khachhang/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idkhachHang: newCustomer.id })
          });
          if (updateRes.ok) {
            setSelectedCustomerId(newCustomer.id);
            setCustomerName(newCustomer.tenKhachHang || '');
            setCustomerEmail(newCustomer.email || '');
            setCustomerPhone(newCustomer.soDienThoai || '');
            setCustomerMessage('Đã tạo và chọn khách hàng mới!');
            await fetchOrders();
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật khách hàng cho hóa đơn:', err);
        }
      }

      // Reset form và đóng modal
      setNewCustomerForm({
        tenKhachHang: '',
        email: '',
        soDienThoai: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        diaChi: ''
      });
      setFormErrors({});
      setShowCreateCustomerModal(false);

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Thêm khách hàng thất bại',
        text: err.message || 'Dữ liệu khách hàng đang bị trùng hoặc thiếu',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        width: 250
      });
    } finally {
      setCreateCustomerLoading(false);
    }
  };

  // Tự động ẩn thông báo voucher sau 2.5 giây
  useEffect(() => {
    if (voucherMessage) {
      const timer = setTimeout(() => setVoucherMessage(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [voucherMessage]);

  // Tự động ẩn thông báo khách hàng sau 2.5 giây
  useEffect(() => {
    if (customerMessage) {
      const timer = setTimeout(() => setCustomerMessage(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [customerMessage]);

  // Tự động validate form khi dữ liệu thay đổi
  useEffect(() => {
    // Chỉ validate khi có đủ dữ liệu để kiểm tra
    if (newCustomerForm.tenKhachHang.trim() || newCustomerForm.soDienThoai.trim() || newCustomerForm.email.trim() || newCustomerForm.diaChi.trim()) {
      const errors = {};
      
      // Kiểm tra tên khách hàng
      if (newCustomerForm.tenKhachHang.trim() && newCustomerForm.tenKhachHang.trim().length < 2) {
        errors.tenKhachHang = 'Họ và tên phải có ít nhất 2 ký tự';
      }
      
      // Kiểm tra số điện thoại
      if (newCustomerForm.soDienThoai.trim() && !/^[0-9]{10,11}$/.test(newCustomerForm.soDienThoai.trim())) {
        errors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
      }
      
      // Kiểm tra email
      if (newCustomerForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomerForm.email.trim())) {
        errors.email = 'Email không đúng định dạng';
      }
      
      // Kiểm tra địa chỉ
      if (newCustomerForm.diaChi.trim() && newCustomerForm.diaChi.trim().length < 5) {
        errors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
      }
      
      setFormErrors(errors);
    }
  }, [newCustomerForm.tenKhachHang, newCustomerForm.soDienThoai, newCustomerForm.email, newCustomerForm.diaChi]);

  // Hàm fetch lại thông tin hóa đơn từ BE
  const fetchOrderInfo = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/donhang/${orderId}`);
      if (!res.ok) throw new Error('Lỗi khi lấy thông tin hóa đơn');
      const data = await res.json();
      setOrderTotal(data.tongTien || 0);
      setOrderDiscount(data.tongTienGiamGia || 0);
      setSelectedVoucherId(data.idgiamGia || null); // Xử lý nhất quán với null
      setSelectedCustomerId(data.idkhachHang || '');
      // Lấy thông tin khách hàng từ danh sách customers
      const kh = customers.find(c => c.id === Number(data.idkhachHang));
      if (kh) {
        setCustomerName(kh.tenKhachHang || '');
        setCustomerEmail(kh.email || '');
        setCustomerPhone(kh.soDienThoai || '');
      } else {
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
      }
      
      // Cập nhật orderInfo với thông tin khách hàng
      const orderDataWithCustomer = {
        ...data,
        customerName: kh ? kh.tenKhachHang : null
      };
      setOrderInfo(orderDataWithCustomer);
    } catch (err) {
      setOrderTotal(0);
      setOrderDiscount(0);
    }
  };

  // Gọi lại fetchOrderInfo khi orderId hoặc cart thay đổi
  useEffect(() => {
    if (orderId) fetchOrderInfo(orderId);
    // eslint-disable-next-line
  }, [orderId, cart]);

  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Hàm lấy danh sách voucher đủ điều kiện khi mở modal
  const fetchAvailableVouchers = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/voucher/available?orderId=${orderId}`);
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách voucher');
      const data = await res.json();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      setVouchers([]);
    }
  };

  // Khi mở modal chọn voucher thì fetch lại danh sách voucher đủ điều kiện
  useEffect(() => {
    if (showVoucherModal) {
      fetchAvailableVouchers();
    }
    // eslint-disable-next-line
  }, [showVoucherModal, orderId]);

  // Thêm state lưu chi tiết đơn hàng và sản phẩm chi tiết
  const [orderInfo, setOrderInfo] = useState(null); // dữ liệu đơn hàng từ API
  const [chiTietList, setChiTietList] = useState([]); // chi tiết đơn hàng
  const [spctList, setSpctList] = useState([]); // sản phẩm chi tiết

  // Hàm helper reset tất cả state về giá trị ban đầu
  const resetAllStates = () => {
    // Reset các state chính
    setOrderId(null);
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedVoucherId(null); // Reset về null thay vì chuỗi rỗng
    setSelectedCustomerId('');
    setOrderTotal(0);
    setOrderDiscount(0);
    setPaymentAmount("");
    
    // Reset các modal
    setShowProductModal(false);
    setShowCustomerModal(false);
    setShowVoucherModal(false);
    setShowPaymentModal(false);
    setShowQRPaymentModal(false);
    setShowQtyModal(false);
    setShowEditModal(false);
    
    // Reset các thông báo
    setVoucherMessage('');
    setCustomerMessage('');
    
    // Reset các form input
    setSearch('');
    setFilterColor('');
    setFilterSize('');
    
    // Reset các state loading
    setOrderLoading(false);
    setAddLoading(false);
    setEditLoading(false);
    
    // Reset các state form
    setQty(1);
    setEditQty(1);
    setEditIdx(null);
    setSelectedProduct(null);
    
    // Reset các state error
    setError('');
    setAddError('');
    setEditError('');
    setOrderError('');
    
    // Reset các state UI
    setCollapsed(false);
    setCollapsedCart(false);
    setShowAllProducts(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
      {/* Nút chọn sản phẩm và dãy tab hóa đơn trên cùng */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        
        <div className="bhtq-order-tabs" style={{ flex: 1 }}>
          {ordersLoading ? (
            <span style={{ color: '#1976d2', fontWeight: 500 }}>Đang tải...</span>
          ) : ordersError ? (
            <span style={{ color: 'red', fontWeight: 500 }}>{ordersError}</span>
          ) : orders.length === 0 ? (
            <span style={{ color: '#888', fontStyle: 'italic', fontSize: 15 }}>Chưa có hóa đơn chờ nào</span>
          ) : (
            orders.map(order => (
              <button
                key={order.id}
                className={`bhtq-order-tab${orderId === order.id ? ' active' : ''}`}
                onClick={() => handleSelectOrder(order)}
                type="button"
              >
                {`HD${order.id}`}
              </button>
            ))
          )}
        </div>
        {/* Nút hủy hóa đơn */}
        {orderId && (
          <Button
            variant="contained"
            color="error"
            sx={{ fontWeight: 600, borderRadius: 2, padding: '6px 18px', fontSize: 15, minWidth: 120, ml: 2 }}
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Bạn có chắc chắn muốn hủy hóa đơn này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#aaa',
                width: 350
              });
              if (!result.isConfirmed) return;
              try {
                // Hoàn lại voucher trước khi hủy hóa đơn (nếu có áp dụng voucher)
                if (selectedVoucherId) {
                  try {
                    console.log('🔄 Hoàn lại voucher:', selectedVoucherId);
                    const voucherRes = await fetch(`http://localhost:8080/api/update-voucher/${orderId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ idgiamGia: null }) // Bỏ voucher để hoàn lại số lượng
                    });
                    if (!voucherRes.ok) {
                      console.warn('⚠️ Không thể hoàn lại voucher, nhưng vẫn tiếp tục hủy hóa đơn');
                    } else {
                      console.log('✅ Đã hoàn lại voucher thành công');
                    }
                  } catch (voucherError) {
                    console.warn('⚠️ Lỗi khi hoàn lại voucher:', voucherError);
                  }
                }
                
                // Hoàn lại tất cả số lượng tồn kho trước khi hủy hóa đơn
                if (cart.length > 0) {
                  for (const item of cart) {
                    try {
                      await updateProductStock(item.idSanPhamChiTiet, item.quantity); // Tăng lại số lượng đã bị giảm
                    } catch (stockError) {
                      console.warn(`Lỗi khi hoàn lại tồn kho cho sản phẩm ${item.idSanPhamChiTiet}:`, stockError);
                    }
                  }
                }
                
                // Hủy hóa đơn
                const res = await fetch(`http://localhost:8080/api/donhang/delete/${orderId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Lỗi khi hủy hóa đơn!');
                Swal.fire({
                  icon: 'success',
                  title: 'Đã hủy hóa đơn!',
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 1500,
                  width: 250
                });
                
                // Reset đầy đủ trạng thái hóa đơn
                resetAllStates();
                
                await fetchOrders();
                await fetchProductsFromBE(); // Cập nhật lại tồn kho sản phẩm sau khi hủy hóa đơn
              } catch (err) {
                Swal.fire({
                  icon: 'error',
                  title: err.message || 'Hủy hóa đơn thất bại!',
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 1800,
                  width: 250
                });
              }
            }}
            disabled={!orderId}
          >
            Hủy hóa đơn
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 600, borderRadius: 2, padding: '6px 18px', fontSize: 15, minWidth: 120 }}
          onClick={handleCreateOrder}
        >
          + Tạo hóa đơn
        </Button>
      </div>
      {/* GIỎ HÀNG */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2 }}>
  <Typography variant="h6" className="bhtq-cart-header">
    GIỎ HÀNG
  </Typography>
  <Button
    variant="contained"
    color="primary"
    sx={{
      fontWeight: 600,
      borderRadius: 2,
      padding: '6px 18px',
      fontSize: 15,
      minWidth: 160,
    }}
    onClick={() => setShowProductModal(true)}
  >
    Chọn sản phẩm
  </Button>
</Box>

        

        <CardContent
          sx={{
            pt: 1,
            pb: 2,
            px: 2,
            maxHeight: 600, // vẫn giữ nếu muốn cuộn khi dài
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, mt: 1 }}>
              <Table size="small" className="bhtq-cart-table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID SPCT</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Màu</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>SL</TableCell>
                    <TableCell>Thành tiền</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ color: '#888' }}>Chưa có sản phẩm nào</TableCell></TableRow>
                  ) : (
                    cart.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#666' }}>
                            {item.idSanPhamChiTiet}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.tenSanPham}</TableCell>
                        <TableCell>{item.mauSac}</TableCell>
                        <TableCell>{item.kichThuoc}</TableCell>
                        <TableCell>
                          {item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan ? (
                            <div>
                              <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                                {item.giaBan?.toLocaleString()} đ
                              </div>
                              <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                {item.giaBanGiamGia?.toLocaleString()} đ
                              </div>
                            </div>
                          ) : (
                            <div>{item.giaBan?.toLocaleString()} đ</div>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.giaBanGiamGia && item.giaBanGiamGia < item.giaBan ? (
                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {(item.giaBanGiamGia * item.quantity).toLocaleString()} đ
                            </div>
                          ) : (
                            <div>{(item.giaBan * item.quantity).toLocaleString()} đ</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" color="primary" size="small" className="bhtq-cart-action-btn" onClick={() => handleShowEditModal(idx)}>Sửa</Button>
                          <Button variant="contained" color="error" size="small" className="bhtq-cart-action-btn" onClick={() => handleRemoveFromCart(idx)}>Xóa</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </CardContent>
      </Card>
      {/* THÔNG TIN KHÁCH HÀNG */}
      {orderId && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0001', margin: '18px 0 0 0', padding: 16 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 8 }}>
            <div className="bhtq-cart-header">Thông tin khách hàng</div>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowCreateCustomerModal(true)}
              sx={{
                minWidth: 40,
                width: 40,
                height: 32,
                borderRadius: '50%',
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              <PersonAddIcon fontSize="small" />
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowCustomerModal(true)}
              disabled={!orderId}
              className="bhtq-customer-select"
              sx={{
                minWidth: 120,
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 2,
                padding: '8px 18px',
                textTransform: 'none',
                height: 40
              }}
            >
              Chọn khách hàng
            </Button>
            <TextField
  label="Tên khách hàng"
  value={customerName}
  onChange={e => setCustomerName(e.target.value)}
  size="small"
  variant="outlined"
  sx={{
    minWidth: 140,
    background: '#fff',
    borderRadius: 1.5,
    '& .MuiOutlinedInput-root': {
      fontSize: 14,
      borderRadius: 1.5,
      background: '#fff',
      paddingY: '4px',
      '& fieldset': {
        borderWidth: '1px',
        borderColor: '#90caf9',
      },
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
    },
    '& .MuiInputLabel-root': {
      fontSize: 13,
    },
  }}
  disabled={!orderId}
/>

<TextField
  label="Email"
  value={customerEmail}
  onChange={e => setCustomerEmail(e.target.value)}
  size="small"
  variant="outlined"
  sx={{
    minWidth: 140,
    background: '#fff',
    borderRadius: 1.5,
    '& .MuiOutlinedInput-root': {
      fontSize: 14,
      borderRadius: 1.5,
      background: '#fff',
      paddingY: '4px',
      '& fieldset': {
        borderWidth: '1px',
        borderColor: '#90caf9',
      },
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
    },
    '& .MuiInputLabel-root': {
      fontSize: 13,
    },
  }}
  disabled={!orderId}
/>

<TextField
  label="Số điện thoại"
  value={customerPhone}
  onChange={e => setCustomerPhone(e.target.value)}
  size="small"
  variant="outlined"
  sx={{
    minWidth: 120,
    background: '#fff',
    borderRadius: 1.5,
    '& .MuiOutlinedInput-root': {
      fontSize: 14,
      borderRadius: 1.5,
      background: '#fff',
      paddingY: '4px',
      '& fieldset': {
        borderWidth: '1px',
        borderColor: '#90caf9',
      },
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
    },
    '& .MuiInputLabel-root': {
      fontSize: 13,
    },
  }}
  disabled={!orderId}
/>

            {customerMessage && (
              <span className={`bhtq-customer-message ${customerMessage.includes('thành công') ? 'success' : 'error'}`}>{customerMessage}</span>
            )}
          </Box>
        </div>
      )}
      {/* VOUCHER */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0001', margin: '18px 0 0 0', padding: 16 }}>
        <div className="bhtq-cart-header" style={{ marginBottom: 8 }}>Voucher</div>
        <div className="bhtq-customer-row" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowVoucherModal(true)}
            disabled={!orderId}
          >
            Chọn voucher
          </Button>
          {selectedVoucherId && (
            <span style={{ marginLeft: 12, color: '#1976d2', fontWeight: 500 }}>
              Đã chọn: {vouchers.find(v => v.id === Number(selectedVoucherId))?.tenVoucher}
            </span>
          )}
          {voucherMessage && (
            <span className={`bhtq-customer-message ${voucherMessage.includes('thành công') ? 'success' : 'error'}`}>{voucherMessage}</span>
          )}
        </div>
      </div>
      {/* MODAL CHỌN VOUCHER */}
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
                    v.isAvailable === false
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
                    {v.loaiVoucher?.toLowerCase().includes('%') ? `${v.giaTri}%` : v.giaTri?.toLocaleString() + ' đ'}
                  </TableCell>
                  <TableCell>{v.donToiThieu?.toLocaleString() || 0} đ</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={async () => {
                        setShowVoucherModal(false);
                        setSelectedVoucherId(v.id);
                        // Gọi API áp dụng voucher như hiện tại
                        if (orderId) {
                          try {
                            const res = await fetch(`http://localhost:8080/api/update-voucher/${orderId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ idgiamGia: v.id })
                            });
                            if (!res.ok) throw new Error('Lỗi khi áp dụng voucher');
                            setVoucherMessage('Áp dụng voucher thành công!');
                            await fetchOrderInfo(orderId);
                          } catch (err) {
                            setVoucherMessage(err.message || 'Lỗi khi áp dụng voucher!');
                          }
                        }
                      }}
                      disabled={!orderId || v.isAvailable === false}
                    >
                      Chọn
                    </Button>
                    {v.isAvailable === false && (
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
            onClick={async () => {
              setShowVoucherModal(false);
              setSelectedVoucherId(null); // Sử dụng null thay vì chuỗi rỗng
              if (orderId) {
                try {
                  const res = await fetch(`http://localhost:8080/api/update-voucher/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idgiamGia: null })
                  });
                  if (!res.ok) throw new Error('Lỗi khi bỏ voucher');
                  setVoucherMessage('Đã bỏ voucher!');
                  await fetchOrderInfo(orderId);
                } catch (err) {
                  setVoucherMessage(err.message || 'Lỗi khi bỏ voucher!');
                }
              }
            }}
            color="error"
            variant="outlined"
            disabled={!orderId}
          >
            Bỏ voucher
          </Button>
          <Button onClick={() => setShowVoucherModal(false)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
      {/* TỔNG TIỀN & THANH TOÁN */}
      <div
  style={{
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    marginTop: 24,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #eee',
  }}
>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 16 }}>
  <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 2 }}>
    Tổng tiền chưa giảm: <span style={{ color: '#222' }}>{totalHang.toLocaleString()} đ</span>
  </div>
  {orderDiscount > 0 && (
    <div style={{ color: '#388e3c', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
      Giảm giá: -{orderDiscount.toLocaleString()} đ
    </div>
  )}
  <div
    className="bhtq-cart-total"
    style={{ fontSize: 22, fontWeight: 'bold', color: '#2c3e50' }}
  >
    Tổng tiền: <span style={{ color: '#e74c3c' }}>{orderTotal.toLocaleString()} đ</span>
  </div>
</div>

  <button
    className="bhtq-cart-pay-btn"
    onClick={handleOpenPaymentModal}
    disabled={!orderId}
    style={{
      fontSize: 18,
      padding: '12px 32px',
      backgroundColor: orderId ? '#1976d2' : '#ccc',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      cursor: orderId ? 'pointer' : 'not-allowed',
      transition: 'background 0.3s ease',
    }}
  >
    Thanh toán
  </button>
</div>

      {/* Modal chọn sản phẩm */}
      <Dialog
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ style: { position: 'relative', overflow: 'visible' } }}
      >
        <DialogTitle>
          Chọn sản phẩm
        </DialogTitle>
        <DialogContent>
          {/* Bộ lọc màu sắc và size */}
          <Box display="flex" gap={2} mb={2}>
            <TextField select label="Màu sắc" value={filterColor} onChange={e => setFilterColor(e.target.value)} size="small" sx={{ minWidth: 120 }}>
              <MenuItem value="">Tất cả</MenuItem>
              {colorOptions.map(color => <MenuItem key={color} value={color}>{color}</MenuItem>)}
            </TextField>
            <TextField select label="Size" value={filterSize} onChange={e => setFilterSize(e.target.value)} size="small" sx={{ minWidth: 100 }}>
              <MenuItem value="">Tất cả</MenuItem>
              {sizeOptions.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
            </TextField>
          </Box>
          {/* Thanh tìm kiếm sản phẩm */}
          <div style={{ marginBottom: 16 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Danh sách sản phẩm */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID SPCT</TableCell>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Màu</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Tồn kho</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#666' }}>
                        {product.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={getImageUrl(product.images)}
                        alt={product.tenSanPham}
                        variant="rounded"
                        sx={{ width: 100, height: 80 }}
                      />
                    </TableCell>
                    <TableCell>{product.tenSanPham}</TableCell>
                    <TableCell>{product.mauSac}</TableCell>
                    <TableCell>{product.kichThuoc}</TableCell>
                    <TableCell>{product.soLuong}</TableCell>
                    <TableCell>
                      {product.giaBanGiamGia && product.giaBanGiamGia < product.giaBan ? (
                        <div>
                          <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                            {product.giaBan?.toLocaleString()} đ
                          </div>
                          <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            {product.giaBanGiamGia?.toLocaleString()} đ
                          </div>
                        </div>
                      ) : (
                        <div>{product.giaBan?.toLocaleString()} đ</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleShowQtyModal(product)}
                        disabled={product.soLuong <= 0}
                      >
                        {product.soLuong > 0 ? 'Thêm' : 'Hết hàng'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductModal(false)} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal chọn số lượng khi thêm sản phẩm */}
      <Dialog open={showQtyModal} onClose={() => setShowQtyModal(false)}>
        
            <DialogTitle>
              Chọn số lượng cho <span style={{ color: '#1976d2' }}>{selectedProduct?.tenSanPham}</span>
            </DialogTitle>
            <DialogContent>
              <TextField
  type="number"
  label="Số lượng"
  variant="outlined"
  fullWidth
  value={Number(qty)}
  onChange={e => setQty(Number(e.target.value))}
  inputProps={{ min: 1, max: selectedProduct?.soLuong }}
  sx={{
    mt: 2,
    '& .MuiInputBase-input': {
      margin: '10px',      
    },
  }}
  disabled={!orderId}
/>


              {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddToOrder} variant="contained" color="primary" disabled={qty < 1 || qty > selectedProduct?.soLuong}>
                Xác nhận
              </Button>
              <Button onClick={() => setShowQtyModal(false)} variant="outlined" color="primary">
                Hủy
              </Button>
            </DialogActions>
         </Dialog> 
      {/* Modal sửa số lượng sản phẩm trong hóa đơn tạm */}
      <Dialog open={showEditModal && editIdx !== null && cart[editIdx]} onClose={() => setShowEditModal(false)}>
        <DialogTitle>
          Sửa số lượng cho <span style={{ color: '#1976d2' }}>{cart[editIdx]?.tenSanPham}</span>
        </DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            label="Số lượng"
            fullWidth
            value={Number(editQty)}
            onChange={e => setEditQty(Number(e.target.value))}
            inputProps={{ min: 1 }}
            sx={{ mt: 2 }}
            disabled={!orderId}
          />
          {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditQty} variant="contained" color="primary" disabled={editQty < 1}>
            Xác nhận
          </Button>
          <Button onClick={() => setShowEditModal(false)} variant="outlined" color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal thanh toán */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <DialogTitle>Thanh toán tiền mặt</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 8, width: '100%' }}>
            <b>Số tiền cần thanh toán:</b> <span style={{ color: '#1976d2', fontSize: 18, fontWeight: 700 }}>{orderTotal.toLocaleString()} đ</span>
          </div>
          <TextField
            type="number"
            label="Số tiền khách đưa"
            variant="outlined"
            fullWidth
            value={paymentAmount}
            onChange={e => {
              const val = e.target.value;
              // Cho phép rỗng hoặc số >= 0, không cho nhập ký tự không phải số
              if (val === "" || (/^\d+$/.test(val) && Number(val) >= 0)) {
                setPaymentAmount(val);
              }
            }}
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
            disabled={!orderId}
          />
          <div style={{ marginBottom: 8, width: '100%' }}>
            <b>Phương thức thanh toán:</b>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <Button
                variant={paymentMethod === 'TIEN_MAT' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handlePaymentMethodChange('TIEN_MAT')}
              >Tiền mặt</Button>
              <Button
                variant={paymentMethod === 'CHUYEN_KHOAN' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handlePaymentMethodChange('CHUYEN_KHOAN')}
              >Chuyển khoản</Button>
            </div>
          </div>
          <div style={{ marginBottom: 8, width: '100%' }}>
            {Number(paymentAmount) < orderTotal ? (
              <Alert severity="warning">Khách thanh toán thiếu: {(orderTotal - Number(paymentAmount)).toLocaleString()} đ</Alert>
            ) : (
              <Alert severity="success">Tiền thừa trả khách: {(Number(paymentAmount) - orderTotal).toLocaleString()} đ</Alert>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            color="success"
            disabled={Number(paymentAmount) < orderTotal}
          >
            Thanh toán&In hđ
          </Button>
          <Button
            onClick={() => setShowPaymentModal(false)}
            variant="outlined"
            color="primary"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thanh toán chuyển khoản với QR Code */}
      <QRCodePayment
        open={showQRPaymentModal}
        onClose={() => setShowQRPaymentModal(false)}
        orderTotal={orderTotal}
        orderId={orderId}
        onPaymentConfirmed={handleQRPaymentConfirmed}
      />

      {/* Thêm Snackbar/Alert cho thông báo */}
      <Snackbar open={!!voucherMessage} autoHideDuration={2500} onClose={() => setVoucherMessage('')}>
        <Alert onClose={() => setVoucherMessage('')} severity={voucherMessage.includes('thành công') ? 'success' : 'error'}>
          {voucherMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={!!customerMessage} autoHideDuration={2500} onClose={() => setCustomerMessage('')}>
        <Alert onClose={() => setCustomerMessage('')} severity={customerMessage.includes('thành công') ? 'success' : 'error'}>
          {customerMessage}
        </Alert>
      </Snackbar>
      {showInvoice && orderInfo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 16px #0002' }}>
            <InvoicePrint order={orderInfo} chiTietList={chiTietList} spctList={spctList} onClose={() => setShowInvoice(false)} />
          </div>
        </div>
      )}
      {/* Modal chọn khách hàng */}
      <Dialog
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chọn khách hàng</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm khách hàng theo tên, SĐT..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>Chọn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.filter(c =>
                c.tenKhachHang?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.soDienThoai?.includes(customerSearch) ||
                c.email?.toLowerCase().includes(customerSearch.toLowerCase())
              ).map((c) => (
                <TableRow key={c.id} selected={selectedCustomerId === c.id}>
                  <TableCell>{c.tenKhachHang}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.soDienThoai}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={async () => {
                        setSelectedCustomerId(c.id);
                        setCustomerName(c.tenKhachHang || "");
                        setCustomerEmail(c.email || "");
                        setCustomerPhone(c.soDienThoai || "");
                        setShowCustomerModal(false);
                        // Gọi API cập nhật khách hàng cho hóa đơn
                        if (orderId) {
                          try {
                            const res = await fetch(`http://localhost:8080/api/update-khachhang/${orderId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ idkhachHang: c.id })
                            });
                            if (!res.ok) throw new Error('Lỗi khi cập nhật khách hàng cho hóa đơn');
                            setCustomerMessage("Chọn khách hàng thành công!");
                            await fetchOrders();
                          } catch (err) {
                            setCustomerMessage(err.message || 'Lỗi khi cập nhật khách hàng!');
                          }
                        }
                      }}
                    >
                      Chọn
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', padding: '16px 24px' }}>
          <Button
            onClick={async () => {
              setShowCustomerModal(false);
              setSelectedCustomerId('');
              setCustomerName('');
              setCustomerEmail('');
              setCustomerPhone('');
              if (orderId) {
                try {
                  const res = await fetch(`http://localhost:8080/api/update-khachhang/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idkhachHang: null })
                  });
                  if (!res.ok) throw new Error('Lỗi khi bỏ chọn khách hàng');
                  setCustomerMessage('Đã chuyển về khách lẻ!');
                  await fetchOrders();
                } catch (err) {
                  setCustomerMessage(err.message || 'Lỗi khi bỏ chọn khách hàng!');
                }
              }
            }}
            color="error"
            variant="outlined"
            disabled={!orderId}
            sx={{ 
              minWidth: 100,
              fontWeight: 500,
              textTransform: 'none',
              borderColor: '#d32f2f',
              color: '#d32f2f',
              '&:hover': {
                borderColor: '#c62828',
                backgroundColor: '#ffebee'
              }
            }}
          >
            Bỏ chọn
          </Button>
          <Button 
            onClick={() => setShowCustomerModal(false)}
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: 80,
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal tạo khách hàng mới */}
      <Dialog
        open={showCreateCustomerModal}
        onClose={() => {
          setShowCreateCustomerModal(false);
          setNewCustomerForm({
            tenKhachHang: '',
            email: '',
            soDienThoai: '',
            ngaySinh: '',
            gioiTinh: 'Nam',
            diaChi: ''
          });
          setFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo khách hàng mới</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Họ và tên *"
              value={newCustomerForm.tenKhachHang}
              onChange={(e) => {
                setNewCustomerForm(prev => ({ ...prev, tenKhachHang: e.target.value }));
                // Xóa lỗi nếu có
                if (formErrors.tenKhachHang) {
                  setFormErrors(prev => ({ ...prev, tenKhachHang: '' }));
                }
                // Validate real-time
                if (e.target.value.trim().length >= 2) {
                  setFormErrors(prev => ({ ...prev, tenKhachHang: '' }));
                }
              }}
              error={!!formErrors.tenKhachHang}
              helperText={formErrors.tenKhachHang}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Số điện thoại *"
              value={newCustomerForm.soDienThoai}
              onChange={(e) => {
                setNewCustomerForm(prev => ({ ...prev, soDienThoai: e.target.value }));
                // Xóa lỗi nếu có
                if (formErrors.soDienThoai) {
                  setFormErrors(prev => ({ ...prev, soDienThoai: '' }));
                }
                // Validate real-time
                if (/^[0-9]{10,11}$/.test(e.target.value.trim())) {
                  setFormErrors(prev => ({ ...prev, soDienThoai: '' }));
                }
              }}
              error={!!formErrors.soDienThoai}
              helperText={formErrors.soDienThoai}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={newCustomerForm.email}
              onChange={(e) => {
                setNewCustomerForm(prev => ({ ...prev, email: e.target.value }));
                // Xóa lỗi nếu có
                if (formErrors.email) {
                  setFormErrors(prev => ({ ...prev, email: '' }));
                }
                // Validate real-time
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                  setFormErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Địa chỉ *"
              value={newCustomerForm.diaChi}
              onChange={(e) => {
                setNewCustomerForm(prev => ({ ...prev, diaChi: e.target.value }));
                // Xóa lỗi nếu có
                if (formErrors.diaChi) {
                  setFormErrors(prev => ({ ...prev, diaChi: '' }));
                }
                // Validate real-time
                if (e.target.value.trim().length >= 5) {
                  setFormErrors(prev => ({ ...prev, diaChi: '' }));
                }
              }}
              error={!!formErrors.diaChi}
              helperText={formErrors.diaChi}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Ngày sinh"
              type="date"
              value={newCustomerForm.ngaySinh}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, ngaySinh: e.target.value }))}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Giới tính"
              value={newCustomerForm.gioiTinh}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, gioiTinh: e.target.value }))}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', padding: '16px 24px' }}>
          <Button
            onClick={() => {
              setShowCreateCustomerModal(false);
              setNewCustomerForm({
                tenKhachHang: '',
                email: '',
                soDienThoai: '',
                ngaySinh: '',
                gioiTinh: 'Nam',
                diaChi: ''
              });
              setFormErrors({});
            }}
            variant="outlined"
            color="primary"
            sx={{ 
              minWidth: 80,
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            color="primary"
            disabled={createCustomerLoading || !isFormValid()}
            sx={{ 
              minWidth: 100,
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            {createCustomerLoading ? 'Đang tạo...' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default BanHangTaiQuayPage;