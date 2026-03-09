// ✅ UTILITY FUNCTIONS ĐỂ QUẢN LÝ THÔNG TIN ĐĂNG NHẬP

/**
 * Lấy ID khách hàng từ localStorage
 * @returns {string|null} ID khách hàng hoặc null nếu chưa đăng nhập
 */
export const getCustomerId = () => {
  return localStorage.getItem('customerId') || localStorage.getItem('userId') || null;
};

/**
 * Lấy tên khách hàng từ localStorage
 * @returns {string|null} Tên khách hàng hoặc null nếu chưa đăng nhập
 */
export const getCustomerName = () => {
  return localStorage.getItem('customerName') || null;
};

/**
 * Kiểm tra xem user có đăng nhập không
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Kiểm tra vai trò của user
 * @returns {string|null} 'KHACH', 'NHANVIEN' hoặc null
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole') || null;
};

/**
 * Kiểm tra xem user có phải là khách hàng không
 * @returns {boolean} true nếu là khách hàng
 */
export const isCustomer = () => {
  return getUserRole() === 'KHACH';
};

/**
 * Kiểm tra xem user có phải là nhân viên không
 * @returns {boolean} true nếu là nhân viên
 */
export const isEmployee = () => {
  return getUserRole() === 'NHANVIEN';
};

/**
 * Lấy thông tin user đầy đủ
 * @returns {object|null} Thông tin user hoặc null
 */
export const getUserInfo = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

/**
 * Đăng xuất user - xóa tất cả thông tin đăng nhập và reload trang
 */
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('customerId');
  localStorage.removeItem('customerName');
  localStorage.removeItem('userId');
  localStorage.removeItem('employeeId');
  localStorage.removeItem('employeeName');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  
  // Tự động reload trang để cập nhật trạng thái
  window.location.reload();
};

/**
 * Lưu thông tin đăng nhập vào localStorage
 * @param {object} userData - Thông tin user từ server
 */
export const saveLoginInfo = (userData) => {
  const { id, ten, vaiTro } = userData;
  
  // Lưu thông tin chung
  localStorage.setItem('user', JSON.stringify({
    id,
    ten,
    vaiTro,
    isLoggedIn: true,
    loginTime: new Date().toISOString()
  }));
  
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userRole', vaiTro);
  
  // Lưu thông tin theo vai trò
  if (vaiTro === 'KHACH') {
    localStorage.setItem('customerId', id);
    localStorage.setItem('customerName', ten);
    localStorage.setItem('userId', id); // Tương thích với code cũ
  } else if (vaiTro === 'NHANVIEN') {
    localStorage.setItem('employeeId', id);
    localStorage.setItem('employeeName', ten);
  }
};
