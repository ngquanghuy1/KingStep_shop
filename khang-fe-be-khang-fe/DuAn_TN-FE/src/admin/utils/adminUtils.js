/**
 * Utility functions cho admin panel
 */

/**
 * Lấy thông tin nhân viên đang đăng nhập từ localStorage
 * @returns {Object} Thông tin nhân viên hoặc null nếu không tìm thấy
 */
export const getCurrentAdminUser = () => {
  try {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    return adminUser.id ? adminUser : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin admin user:', error);
    return null;
  }
};

/**
 * Lấy ID nhân viên đang đăng nhập
 * @returns {number|null} ID nhân viên hoặc null nếu không tìm thấy
 */
export const getCurrentAdminId = () => {
  const adminUser = getCurrentAdminUser();
  return adminUser ? adminUser.id : null;
};

/**
 * Kiểm tra xem có nhân viên đang đăng nhập không
 * @returns {boolean} true nếu có nhân viên đăng nhập
 */
export const isAdminLoggedIn = () => {
  return getCurrentAdminUser() !== null;
};

/**
 * Lấy tên nhân viên đang đăng nhập
 * @returns {string} Tên nhân viên hoặc 'Admin' nếu không tìm thấy
 */
export const getCurrentAdminName = () => {
  const adminUser = getCurrentAdminUser();
  return adminUser ? adminUser.name : 'Admin';
};

/**
 * Validate thông tin nhân viên trước khi tạo đơn hàng
 * @returns {Object} {success: boolean, message: string, adminId: number|null}
 */
export const validateAdminForOrder = () => {
  const adminUser = getCurrentAdminUser();
  
  if (!adminUser) {
    return {
      success: false,
      message: 'Không tìm thấy thông tin nhân viên! Vui lòng đăng nhập lại.',
      adminId: null
    };
  }
  
  if (!adminUser.id) {
    return {
      success: false,
      message: 'ID nhân viên không hợp lệ! Vui lòng đăng nhập lại.',
      adminId: null
    };
  }
  
  return {
    success: true,
    message: 'Thông tin nhân viên hợp lệ',
    adminId: adminUser.id
  };
};

/**
 * Debug function để kiểm tra thông tin admin
 */
export const debugAdminInfo = () => {
  const adminUser = getCurrentAdminUser();
  console.log('=== DEBUG ADMIN INFO ===');
  console.log('Raw localStorage:', localStorage.getItem('adminUser'));
  console.log('Parsed adminUser:', adminUser);
  console.log('Admin ID:', adminUser ? adminUser.id : 'null');
  console.log('Admin Name:', adminUser ? adminUser.name : 'null');
  console.log('Admin Role:', adminUser ? adminUser.role : 'null');
  console.log('Is Logged In:', isAdminLoggedIn());
  console.log('========================');
  return adminUser;
};
