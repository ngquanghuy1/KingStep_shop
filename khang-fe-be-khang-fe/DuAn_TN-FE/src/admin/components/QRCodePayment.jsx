import React, { useState } from 'react';
import {
  Box, Typography, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { getBankDisplayInfo } from '../config/bankConfig';

const QRCodePayment = ({ 
  orderTotal, 
  orderId, 
  onPaymentConfirmed, 
  onClose,
  open 
}) => {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, confirmed
  const [isConfirming, setIsConfirming] = useState(false);

  // Lấy thông tin ngân hàng từ config
  const bankInfo = getBankDisplayInfo(orderId, orderTotal);

  // Tạo QR Code data theo chuẩn VietQR
  const generateQRData = () => {
    // Format theo chuẩn QR Code cho ngân hàng Việt Nam
    const content = 'Thanh Toan Hoa Don Mua Hang';
    return `https://api.vietqr.io/image/${bankInfo.bankCode}/${bankInfo.accountNumber}/${orderTotal}/${encodeURIComponent(content)}`;
  };

  // Xác nhận thanh toán thủ công
  const confirmPaymentManually = async () => {
    setIsConfirming(true);
    
    try {
      // Giả lập xử lý xác nhận
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentStatus('confirmed');
      
      // Tự động gọi callback sau 1 giây
      setTimeout(() => {
        onPaymentConfirmed();
      }, 1000);
      
    } catch (error) {
      console.error('Lỗi khi xác nhận thanh toán:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <QrCodeIcon color="primary" />
          Thanh toán chuyển khoản
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Số tiền cần thanh toán: {orderTotal.toLocaleString()} đ
          </Typography>
          
          {paymentStatus === 'pending' && (
            <>
              {/* QR Code cố định */}
              <Box 
                sx={{ 
                  width: 250, 
                  height: 250, 
                  margin: '20px auto',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  overflow: 'hidden'
                }}
              >
                {/* Sử dụng ảnh QR Code cố định */}
                <img 
                  src="/qr.png" 
                  alt="QR Code thanh toán"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    padding: '10px'
                  }}
                  onError={(e) => {
                    // Nếu ảnh không load được, hiển thị placeholder
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Placeholder khi ảnh không load được */}
                <Box 
                  sx={{ 
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 80, color: '#ccc' }} />
                  <Typography variant="body2" color="textSecondary" align="center">
                    QR Code mẫu
                    <br />
                    (Cần thêm ảnh QR Code vào thư mục public)
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin chuyển khoản */}
              <Box textAlign="left" sx={{ mt: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                  Thông tin chuyển khoản:
                </Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Ngân hàng:</Typography>
                    <Typography variant="body2">{bankInfo.bankName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Số tài khoản:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{bankInfo.accountNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Tên tài khoản:</Typography>
                    <Typography variant="body2">{bankInfo.accountName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Số tiền:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{orderTotal.toLocaleString()} đ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Nội dung:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>Thanh Toan Hoa Don Mua Hang</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Hướng dẫn */}
              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Hướng dẫn thanh toán:
                </Typography>
                <Typography variant="body2" component="div">
                  1. Khách hàng mở ứng dụng ngân hàng
                  <br />
                  2. Chọn tính năng quét mã QR
                  <br />
                  3. Quét mã QR bên trên
                  <br />
                  4. Kiểm tra thông tin và xác nhận chuyển khoản
                  <br />
                  5. <strong>Nhân viên kiểm tra tài khoản đã nhận tiền chưa</strong>
                  <br />
                  6. <strong>Bấm "Xác nhận đã nhận tiền" khi tiền đã vào</strong>
                </Typography>
              </Alert>

              {/* Lưu ý quan trọng */}
              <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ⚠️ Lưu ý quan trọng:
                </Typography>
                <Typography variant="body2">
                  • Chỉ bấm "Xác nhận đã nhận tiền" khi đã kiểm tra tiền đã vào tài khoản
                  <br />
                  • Có thể kiểm tra qua ứng dụng ngân hàng hoặc gọi điện xác nhận
                  <br />
                  • Không xác nhận nếu chưa chắc chắn tiền đã vào
                </Typography>
              </Alert>
            </>
          )}

          {paymentStatus === 'confirmed' && (
            <Box textAlign="center" py={4}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                Thanh toán thành công!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Đang xử lý hóa đơn...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {paymentStatus === 'pending' && (
          <>
            <Button
              onClick={confirmPaymentManually}
              variant="contained"
              color="success"
              disabled={isConfirming}
              startIcon={isConfirming ? <CircularProgress size={20} /> : null}
            >
              {isConfirming ? 'Đang xử lý...' : 'Xác nhận đã nhận tiền'}
            </Button>
            <Button onClick={onClose} variant="outlined">
              Đóng
            </Button>
          </>
        )}
        
        {paymentStatus === 'confirmed' && (
          <Button onClick={onClose} variant="contained" color="success" disabled>
            Hoàn tất
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodePayment;
