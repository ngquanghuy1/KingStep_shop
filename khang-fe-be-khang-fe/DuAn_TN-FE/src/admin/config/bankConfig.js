// Cấu hình thông tin ngân hàng cho thanh toán chuyển khoản
export const bankConfig = {
  // Thông tin tài khoản ngân hàng
  accountInfo: {
    bankName: 'MB - Ngân hàng TMCP Quân đội',
    accountNumber: '08913122005',
    accountName: 'BUI DINH ANH TAI',
    bankCode: 'MB', // Mã ngân hàng theo chuẩn VietQR
    branchCode: '001' // Mã chi nhánh
  },

  // Cấu hình QR Code
  qrConfig: {
    // Sử dụng VietQR API để tạo QR Code
    vietQRBaseUrl: 'https://api.vietqr.io/image',
    // Hoặc sử dụng thư viện QR Code local
    useLocalQR: false,
    qrSize: 250, // Kích thước QR Code (px)
    qrErrorCorrection: 'M' // Mức độ sửa lỗi: L, M, Q, H
  },

  // Cấu hình nội dung chuyển khoản
  transferContent: {
    prefix: 'Thanh Toan Hoa Don Mua Hang', // Tiền tố cho nội dung
    includeOrderId: true, // Có bao gồm mã hóa đơn không
    includeAmount: false, // Có bao gồm số tiền trong nội dung không
    maxLength: 50 // Độ dài tối đa của nội dung
  },

  // Cấu hình kiểm tra thanh toán
  paymentCheck: {
    // API endpoint để kiểm tra trạng thái thanh toán
    checkStatusUrl: '/api/payment/check-status',
    // Thời gian giữa các lần kiểm tra (ms)
    checkInterval: 5000,
    // Số lần kiểm tra tối đa
    maxCheckAttempts: 12, // 1 phút
    // Thời gian timeout cho mỗi lần kiểm tra (ms)
    checkTimeout: 10000
  },

  // Cấu hình giao diện
  ui: {
    showBankInfo: true,        // Hiển thị thông tin ngân hàng
    showInstructions: true,     // Hiển thị hướng dẫn
    showCheckButton: true,      // Hiển thị nút kiểm tra
    showManualConfirm: true,    // Hiển thị nút xác nhận thủ công
    checkingMessage: 'Đang kiểm tra thanh toán...',
    successMessage: 'Thanh toán thành công!'
  }
};

// Hàm lấy thông tin hiển thị ngân hàng
export const getBankDisplayInfo = (orderId, amount) => {
  const { accountInfo, transferContent } = bankConfig;
  
  // Tạo nội dung chuyển khoản
  let content = transferContent.prefix;
  if (transferContent.includeOrderId && orderId) {
    content += orderId;
  }
  if (transferContent.includeAmount && amount) {
    content += ` ${amount.toLocaleString()}`;
  }
  
  // Giới hạn độ dài nội dung
  if (content.length > transferContent.maxLength) {
    content = content.substring(0, transferContent.maxLength);
  }

  return {
    bankName: accountInfo.bankName,
    accountNumber: accountInfo.accountNumber,
    accountName: accountInfo.accountName,
    bankCode: accountInfo.bankCode,
    branchCode: accountInfo.branchCode,
    amount: amount || 0,
    content: content
  };
};

// Hàm tạo URL VietQR
export const generateVietQRUrl = (orderId, amount) => {
  const { accountInfo } = bankConfig;
  const content = `Thanh toan HD${orderId}`;
  
  return `${bankConfig.qrConfig.vietQRBaseUrl}/${accountInfo.bankCode}/${accountInfo.accountNumber}/${amount}/${encodeURIComponent(content)}`;
};

// Hàm tạo nội dung chuyển khoản
export const generateTransferContent = (orderId, amount) => {
  const { transferContent } = bankConfig;
  let content = transferContent.prefix;
  
  if (transferContent.includeOrderId && orderId) {
    content += orderId;
  }
  if (transferContent.includeAmount && amount) {
    content += ` ${amount.toLocaleString()}`;
  }
  
  // Giới hạn độ dài
  if (content.length > transferContent.maxLength) {
    content = content.substring(0, transferContent.maxLength);
  }
  
  return content;
};
