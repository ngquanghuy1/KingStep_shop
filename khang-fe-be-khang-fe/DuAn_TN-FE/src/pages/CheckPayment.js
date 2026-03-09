import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getCustomerId } from "../utils/authUtils";
import config from "../config/config";

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

const CheckPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("info");
  const [title, setTitle] = useState("Đang xử lý thanh toán...");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Function xử lý cart item
  const processCartItem = (item, index) => {
    console.log(`🔄 === XỬ LÝ ITEM ${index + 1} ===`);
    console.log(`📦 Item gốc:`, item);
    console.log(`🔑 Keys của item:`, Object.keys(item));
    console.log(`🆔 idSanPhamChiTiet:`, item.idSanPhamChiTiet);
    console.log(`🆔 id:`, item.id);
    console.log(`💰 giaBan:`, item.giaBan);
    console.log(`💰 giaBanGiamGia:`, item.giaBanGiamGia);
    console.log(`💰 gia:`, item.gia);
    console.log(`📊 soLuong:`, item.soLuong);
    console.log(`📝 tenSanPham:`, item.tenSanPham);
    
    let processedItem = null;
    
    // ✅ Cấu trúc từ MUA NGAY
    if (item.id && item.tenSanPham && item.giaBan !== undefined) {
      console.log(`🛒 Item ${index + 1} từ MUA NGAY:`, 
        `hinhAnh=${item.hinhAnh}, giaBan=${item.giaBan}, giaBanGiamGia=${item.giaBanGiamGia}, soLuong=${item.soLuong}`);
      
      const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
      const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;
      
      console.log(`💰 Kết quả: hasDiscount=${hasDiscount}, finalPrice=${finalPrice}`);
      
      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet || item.id,  // ✅ Ưu tiên idSanPhamChiTiet
        soLuong: item.soLuong || 1,
        gia: finalPrice,
        thanhTien: finalPrice * (item.soLuong || 1),
        source: 'buy_now'
      };
      
      console.log(`✅ Tạo processedItem từ MUA NGAY:`, processedItem);
    }
    // ✅ Cấu trúc từ giỏ hàng
    else if (item.idSanPhamChiTiet && item.tenSanPham && item.giaBan !== undefined) {
      console.log(`🛒 Item ${index + 1} từ giỏ hàng:`, 
        `hinhAnh=${item.hinhAnh}, giaBan=${item.giaBan}, giaBanGiamGia=${item.giaBanGiamGia}, soLuong=${item.soLuong}`);
      
      const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
      const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;
      
      console.log(`💰 Kết quả: hasDiscount=${hasDiscount}, finalPrice=${finalPrice}`);
      
      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet,
        soLuong: item.soLuong || 1,
        gia: finalPrice,
        thanhTien: finalPrice * (item.soLuong || 1),
        source: 'cart'
      };
      
      console.log(`✅ Tạo processedItem từ giỏ hàng:`, processedItem);
    }
    // ✅ Cấu trúc từ backend
    else if (item.idSanPhamChiTiet && item.gia !== undefined) {
      console.log(`🛒 Item ${index + 1} từ backend:`, 
        `gia=${item.gia}, soLuong=${item.soLuong}`);
      
      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet,
        soLuong: item.soLuong || 1,
        gia: item.gia,
        thanhTien: item.gia * (item.soLuong || 1),
        source: 'backend'
      };
      
      console.log(`✅ Tạo processedItem từ backend:`, processedItem);
    }
    // ✅ Cấu trúc trực tiếp với giá
    else if (item.gia !== undefined && item.soLuong !== undefined) {
      console.log(`🛒 Item ${index + 1} với giá trực tiếp:`, 
        `gia=${item.gia}, soLuong=${item.soLuong}`);
      
      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet || item.id,  // ✅ Ưu tiên idSanPhamChiTiet
        soLuong: item.soLuong,
        gia: item.gia,
        thanhTien: item.gia * item.soLuong,
        source: 'direct_price'
      };
      
      console.log(`✅ Tạo processedItem từ giá trực tiếp:`, processedItem);
    }
    
    if (!processedItem) {
      console.error(`❌ === KHÔNG THỂ XỬ LÝ ITEM ${index + 1} ===`);
      console.error(`📦 Item gốc:`, item);
      console.error(`❌ Cấu trúc không hợp lệ:`, {
        hasId: !!item.id,
        hasIdSanPhamChiTiet: !!item.idSanPhamChiTiet,
        hasTenSanPham: !!item.tenSanPham,
        hasGiaBan: item.giaBan !== undefined,
        hasGia: item.gia !== undefined,
        hasSoLuong: item.soLuong !== undefined
      });
    } else {
      console.log(`✅ === HOÀN THÀNH XỬ LÝ ITEM ${index + 1} ===`);
      console.log(`📦 Kết quả cuối cùng:`, processedItem);
    }
    
    return processedItem;
  };

  // ✅ Function áp dụng voucher (đơn giản hóa sau khi sửa Backend)
  const applyVoucherToOrder = async (orderId, voucherId) => {
    if (!orderId || !voucherId) return false;
    
    try {
      console.log('🎫 === ÁP DỤNG VOUCHER (VNPAY) ===');
      console.log('📦 Order ID:', orderId);
      console.log('🎫 Voucher ID:', voucherId);
      
      console.log('🚀 Gọi API apply-voucher...');
      const response = await fetch(`http://localhost:8080/api/donhang/${orderId}/apply-voucher/${voucherId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Áp dụng voucher thành công:', updatedOrder);
        
        // ✅ Thông báo thành công (Backend đã tự động xử lý số lượng)
        toast.success('🎫 Voucher đã được áp dụng thành công!', {
          position: "top-center",
          autoClose: 3000,
        });
        
        return true;
      } else {
        const errorMessage = await response.text();
        console.error('❌ Không thể áp dụng voucher:', response.status, errorMessage);
        toast.error(`Không thể áp dụng voucher: ${errorMessage}`, {
          position: "top-center",
          autoClose: 5000,
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối khi áp dụng voucher:', error);
      toast.error('Lỗi kết nối khi áp dụng voucher', {
        position: "top-center",
        autoClose: 5000,
      });
      return false;
    }
  };

  // ✅ Function xử lý đơn hàng thành công
  const processSuccessfulOrder = async (orderInfo) => {
    if (isProcessing) {
      console.log('⚠️ Đơn hàng đang được xử lý, bỏ qua...');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('🔄 === XỬ LÝ ĐƠN HÀNG THÀNH CÔNG ===');
      console.log('📋 Thông tin đơn hàng:', orderInfo);
      
      // ✅ BƯỚC 1: Tạo đơn hàng mới
      console.log('📦 Tạo đơn hàng mới với trạng thái 0...');
      
      const customerId = getCustomerId();
      if (!customerId) {
        throw new Error('Không tìm thấy ID khách hàng');
      }

      // ✅ THÊM: Kiểm tra giới hạn đơn hàng trước khi tạo đơn mới
      console.log('🔍 Kiểm tra giới hạn đơn hàng cho khách hàng:', customerId);
      const orderLimitCheck = await checkCustomerOrderLimit(customerId);
      
      if (!orderLimitCheck.success) {
        throw new Error(orderLimitCheck.message);
      }
      
      if (!orderLimitCheck.canCreateOrder) {
        // ✅ Hiển thị thông báo lỗi đẹp giống Payment.js
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
          // Fallback nếu không có SweetAlert2
          const detailedMessage = `Đã đạt giới hạn đơn hàng! Bạn hiện có ${orderLimitCheck.currentOrderCount}/10 đơn hàng đang xử lý. Vui lòng chờ các đơn hàng hiện tại hoàn thành trước khi tạo đơn mới.`;
          throw new Error(detailedMessage);
        }
        return; // Dừng xử lý nếu đã hiển thị SweetAlert2
      }
      
      console.log('✅ Khách hàng có thể tạo đơn hàng mới:', orderLimitCheck.message);
      
      const orderData = {
        idkhachHang: customerId,
        tenNguoiNhan: orderInfo.tenNguoiNhan,
        soDienThoaiGiaoHang: orderInfo.soDienThoaiGiaoHang,
        emailGiaoHang: orderInfo.emailGiaoHang,
        diaChiGiaoHang: orderInfo.diaChiGiaoHang,
        loaiDonHang: 'online',
        tongTien: orderInfo.tongTien,
        phiVanChuyen: orderInfo.phiVanChuyen,
        trangThai: 1,
        ...(orderInfo.selectedVoucherId && { idgiamGia: orderInfo.selectedVoucherId })
      };

      console.log('🚀 Gửi dữ liệu tạo đơn hàng:', orderData);
      console.log('💰 Chi tiết tiền:');
      console.log('   - Tiền hàng (sau voucher):', orderInfo.tongTien);
      console.log('   - Phí vận chuyển:', orderInfo.phiVanChuyen);
      console.log('   - Tổng thanh toán (dự kiến):', orderInfo.tongTien + orderInfo.phiVanChuyen);
      if (orderInfo.selectedVoucherId) {
        console.log('   - Voucher ID:', orderInfo.selectedVoucherId);
      }

      const orderRes = await fetch('http://localhost:8080/api/donhang/create-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        throw new Error('Không thể tạo đơn hàng');
      }
      
      const createdOrder = await orderRes.json();
      const finalOrderId = createdOrder.id;
      console.log('✅ Đã tạo đơn hàng mới với ID:', finalOrderId, 'và trạng thái 0');
      
      // ✅ BƯỚC 2: Tạo đơn hàng chi tiết
      console.log('Bước 2: Tạo đơn hàng chi tiết...');
      console.log('📊 Số lượng sản phẩm trong giỏ hàng:', orderInfo.cart.length);
      console.log('📋 Chi tiết giỏ hàng:', orderInfo.cart);
      
      if (!Array.isArray(orderInfo.cart) || orderInfo.cart.length === 0) {
        throw new Error('Cart data không hợp lệ hoặc trống');
      }
      
      console.log('✅ Cart data hợp lệ, bắt đầu tạo chi tiết đơn hàng...');
      
      for (let i = 0; i < orderInfo.cart.length; i++) {
        const item = orderInfo.cart[i];
        
        // 🔍 DEBUG: Log chi tiết item gốc từ giỏ hàng
        console.log(`🔍 === DEBUG ITEM ${i + 1} ===`);
        console.log(`📦 Item gốc từ giỏ hàng:`, item);
        console.log(`🔑 Keys của item:`, Object.keys(item));
        console.log(`🆔 idSanPhamChiTiet gốc:`, item.idSanPhamChiTiet);
        console.log(`🆔 id gốc:`, item.id);
        console.log(`💰 Giá gốc:`, item.giaBan);
        console.log(`💰 Giá khuyến mãi:`, item.giaBanGiamGia);
        console.log(`📊 Số lượng:`, item.soLuong);
        
        const processedItem = processCartItem(item, i);
        
        if (!processedItem) {
          console.error(`❌ Không thể xử lý item ${i + 1}:`, item);
          throw new Error(`Không thể xử lý item ${i + 1} - cấu trúc không hợp lệ`);
        }
        
        // 🔍 DEBUG: Log chi tiết item sau khi xử lý
        console.log(`✅ === SAU KHI XỬ LÝ ITEM ${i + 1} ===`);
        console.log(`📦 Item đã xử lý:`, processedItem);
        console.log(`🆔 idSanPhamChiTiet sau xử lý:`, processedItem.idSanPhamChiTiet);
        console.log(`💰 Giá sau xử lý:`, processedItem.gia);
        console.log(`📊 Số lượng sau xử lý:`, processedItem.soLuong);
        console.log(`🏷️ Nguồn:`, processedItem.source);
        
        const chiTietData = {
          idDonHang: finalOrderId,
          idSanPhamChiTiet: processedItem.idSanPhamChiTiet,
          soLuong: processedItem.soLuong,
          gia: processedItem.gia,
          thanhTien: processedItem.thanhTien,
        };
        
        // 🔍 DEBUG: Log dữ liệu gửi lên API
        console.log(`📤 === DỮ LIỆU GỬI LÊN API ${i + 1} ===`);
        console.log(`📝 Chi tiết đơn hàng:`, chiTietData);
        console.log(`🆔 idSanPhamChiTiet gửi lên:`, chiTietData.idSanPhamChiTiet);
        console.log(`💰 Giá gửi lên:`, chiTietData.gia);
        console.log(`📊 Số lượng gửi lên:`, chiTietData.soLuong);
        console.log(`📊 Nguồn: ${processedItem.source}`);

        const chiTietRes = await fetch('http://localhost:8080/api/donhangchitiet/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiTietData)
        });

        if (!chiTietRes.ok) {
          const errorText = await chiTietRes.text();
          console.error(`❌ Lỗi khi tạo chi tiết sản phẩm ${i + 1}:`, errorText);
          throw new Error(`Lỗi khi tạo chi tiết sản phẩm ${i + 1}: ${errorText}`);
        }
        
        const chiTietResult = await chiTietRes.json();
        console.log(`✅ Đã tạo chi tiết đơn hàng ${i + 1} thành công:`, chiTietResult);
      }
      
      // ✅ BƯỚC 3: Cập nhật tổng tiền đơn hàng (chỉ khi KHÔNG có voucher)
      if (!orderInfo.selectedVoucherId) {
        console.log('Bước 3: Không có voucher - cập nhật tổng tiền đơn hàng...');
        
        try {
          const updateTotalRes = await fetch(`http://localhost:8080/api/don-hang/${finalOrderId}/cap-nhat-tong-tien`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (updateTotalRes.ok) {
            const updatedOrder = await updateTotalRes.json();
            console.log('✅ Đã cập nhật tổng tiền đơn hàng thành công:', updatedOrder);
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
      
      // ✅ BƯỚC 4: Áp dụng voucher nếu có (Backend tự động xử lý số lượng)
      if (orderInfo.selectedVoucherId) {
        console.log('🎫 === BƯỚC 4: ÁP DỤNG VOUCHER ===');
        console.log('🎫 Voucher ID:', orderInfo.selectedVoucherId);
        console.log('📦 Order ID:', finalOrderId);
        
        try {
          // ✅ SỬA: Sử dụng function áp dụng voucher (đơn giản hóa)
          const voucherApplied = await applyVoucherToOrder(finalOrderId, orderInfo.selectedVoucherId);
          
          if (voucherApplied) {
            console.log('✅ Voucher đã được áp dụng thành công!');
          } else {
            console.warn('⚠️ Không thể áp dụng voucher hoàn toàn, nhưng đơn hàng đã được tạo');
            toast.warning('⚠️ Voucher không thể được xử lý hoàn toàn, nhưng đơn hàng đã được tạo');
          }
        } catch (voucherError) {
          console.error('❌ Lỗi khi áp dụng voucher:', voucherError);
          toast.error('❌ Lỗi khi áp dụng voucher: ' + voucherError.message, {
            position: "top-center",
            autoClose: 5000,
          });
        }
      } else {
        console.log('Bước 4: Không có voucher để áp dụng');
      }
      
      // ✅ BƯỚC 5: Cập nhật trạng thái đơn hàng
      console.log('Bước 5: Cập nhật trạng thái đơn hàng...');
      
      try {
        const updateRes = await fetch(`http://localhost:8080/api/donhang/${finalOrderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trangThai: 1 }) // Cập nhật trạng thái thành 1 (đã thanh toán)
        });
        
        if (updateRes.ok) {
          console.log('✅ Cập nhật trạng thái đơn hàng thành công');
        } else {
          console.warn('⚠️ Không thể cập nhật trạng thái đơn hàng');
        }
      } catch (updateError) {
        console.warn('⚠️ Lỗi khi cập nhật trạng thái đơn hàng:', updateError);
      }
      
      // ✅ BƯỚC 6: Xử lý giỏ hàng
      console.log('Bước 6: Xử lý giỏ hàng...');
      
      if (orderInfo.cart && orderInfo.cart.length > 0) {
        const firstItem = orderInfo.cart[0];
        const source = processCartItem(firstItem, 0)?.source;
        
        console.log('📊 Nguồn sản phẩm đầu tiên:', source);
        console.log('🔍 Kiểm tra giỏ hàng:', orderInfo.cart);
        
        // ✅ SỬA: Luôn xóa giỏ hàng khi thanh toán thành công, bất kể source
        console.log('🗑️ Xóa giỏ hàng sau khi thanh toán thành công...');
        
        try {
          // ✅ GỌI API XÓA TẤT CẢ GIỎ HÀNG TRÊN BACKEND
          console.log('🔄 Gọi API xóa tất cả giỏ hàng...');
          const customerId = getCustomerId();
          console.log('👤 Customer ID:', customerId);
          
          if (customerId) {
            const clearCartRes = await fetch(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`), {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (clearCartRes.ok) {
              console.log('✅ Đã xóa tất cả giỏ hàng trên backend');
            } else {
              const errorText = await clearCartRes.text();
              console.warn('⚠️ Không thể xóa giỏ hàng trên backend:', errorText);
            }
          } else {
            console.warn('⚠️ Không tìm thấy customerId, bỏ qua xóa giỏ hàng backend');
          }
        } catch (clearCartError) {
          console.warn('⚠️ Lỗi khi xóa giỏ hàng backend:', clearCartError);
        }
        
        // ✅ Xóa giỏ hàng trên localStorage
        localStorage.removeItem('cart');
        console.log('✅ Đã xóa giỏ hàng trên localStorage');
        
        // ✅ Xóa giỏ hàng trên sessionStorage (nếu có)
        sessionStorage.removeItem('cart');
        console.log('✅ Đã xóa giỏ hàng trên sessionStorage');
        
        // ✅ Dispatch event để cập nhật UI
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
        console.log('✅ Đã dispatch event cartUpdated');
      } else {
        console.log('ℹ️ Không có giỏ hàng để xóa');
      }
      
      console.log('✅ Hoàn tất tạo đơn hàng!');
      
    } catch (error) {
      console.error('❌ Lỗi khi xử lý đơn hàng:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isProcessing) {
      console.log('⚠️ Đang xử lý, bỏ qua...');
      return;
    }

    const processPayment = async () => {
      setIsProcessing(true);
      
      try {
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpAmount = searchParams.get('vnp_Amount');
        
        console.log('🔄 === XỬ LÝ CALLBACK VNPAY TỪ CHECK-PAYMENT ===');
        console.log('📊 Response Code:', vnpResponseCode);
        console.log('📊 Transaction Ref:', vnpTxnRef);
        console.log('📊 Amount:', vnpAmount);
        console.log('📍 Full URL:', window.location.href);

        if (vnpResponseCode === '00') {
          console.log('✅ VNPAY thanh toán thành công!');
          setStatus("success");
          setTitle("Thanh toán thành công");
          
          try {
            const { data } = await axios.get(
              `http://localhost:8080/api/payment/vnpay-return?${searchParams.toString()}`
            );
            console.log('✅ Backend response:', data);
          } catch (backendError) {
            console.warn('⚠️ Không thể gọi backend, nhưng VNPAY đã thành công');
            toast.warning('⚠️ VNPAY thành công nhưng không thể xác nhận với backend');
          }

          const pendingOrderInfo = localStorage.getItem('pendingOrderInfo');
          if (pendingOrderInfo) {
            console.log('🔄 Phát hiện đơn hàng chờ, đang xử lý...');
            
            try {
              const orderInfo = JSON.parse(pendingOrderInfo);
              console.log('📋 Thông tin đơn hàng chờ:', orderInfo);
              
              toast.info('⚙️ Đang tạo đơn hàng...', {
                position: "top-center",
                autoClose: 2000,
              });
              
              await processSuccessfulOrder(orderInfo);
              
              localStorage.removeItem('pendingOrderInfo');
              
              toast.success('🎉 Thanh toán VNPAY thành công! Đơn hàng đã được tạo.', {
                position: "top-center",
                autoClose: 5000,
              });
              
              setTimeout(() => {
                navigate('/orders');
              }, 3000);
              
            } catch (error) {
              console.error('❌ Lỗi khi xử lý đơn hàng:', error);
              toast.error('❌ Lỗi khi xử lý đơn hàng: ' + error.message);
              
              setTimeout(() => {
                navigate('/payment');
              }, 3000);
            }
          } else {
            console.log('⚠️ Không có đơn hàng chờ');
            toast.info('✅ Thanh toán thành công! Chuyển về trang chủ...', {
              position: "top-center",
              autoClose: 2000,
            });
            
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
          
        } else if (vnpResponseCode) {
          console.log('❌ VNPAY thanh toán thất bại với code:', vnpResponseCode);
          setStatus("error");
          setTitle("Thanh toán thất bại");
          
          localStorage.removeItem('pendingOrderInfo');
          
          let errorMessage = 'Thanh toán VNPAY thất bại';
          switch (vnpResponseCode) {
            case '07':
              errorMessage = 'Giao dịch bị nghi ngờ gian lận';
              break;
            case '09':
              errorMessage = 'Giao dịch không thành công';
              break;
            case '10':
              errorMessage = 'Giao dịch bị hủy';
              break;
            case '11':
              errorMessage = 'Giao dịch bị từ chối';
              break;
            case '12':
              errorMessage = 'Giao dịch bị lỗi';
              break;
            case '13':
              errorMessage = 'Giao dịch bị từ chối';
              break;
            case '24':
              errorMessage = 'Khách hàng hủy giao dịch';
              break;
            default:
              errorMessage = `Thanh toán thất bại với mã lỗi: ${vnpResponseCode}`;
          }
          
          toast.error('❌ ' + errorMessage, {
            position: "top-center",
            autoClose: 5000,
          });
          
          setTimeout(() => {
            navigate('/payment');
          }, 3000);
          
        } else {
          console.log('⚠️ Không có response code từ VNPAY');
          setStatus("error");
          setTitle("Không thể xác nhận trạng thái");
          
          toast.warning('⚠️ Không thể xác nhận trạng thái thanh toán', {
            position: "top-center",
            autoClose: 5000,
          });
          
          setTimeout(() => {
            navigate('/payment');
          }, 3000);
        }
        
      } catch (error) {
        console.error('❌ Lỗi khi xử lý callback VNPAY:', error);
        setStatus("error");
        setTitle("Có lỗi xảy ra khi xác thực thanh toán");
        
        toast.error('❌ Lỗi khi xử lý thanh toán VNPAY', {
          position: "top-center",
          autoClose: 5000,
        });
        
        setTimeout(() => {
          navigate('/payment');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Đang xử lý thanh toán...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Result
        status={status}
        title={title}start
        extra={[
          <Button key="orders" type="primary" onClick={() => navigate("/orders")}>Xem đơn hàng</Button>,
          <Button key="home" onClick={() => navigate("/")}>Về trang chủ</Button>,
        ]}
      />
      <ToastContainer />
    </>
  );
};

export default CheckPayment; 