// File cấu hình cho API endpoints và OAuth settings
const config = {
  // Sử dụng URL tương đối khi có proxy trong development
  API_BASE_URL: process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8080'),
  
  // Các cấu hình khác
  APP_NAME: 'Shoe Store',
  VERSION: '1.0.0',
  
  // Cấu hình cho development
  IS_DEV: process.env.NODE_ENV === 'development',
  
  // API Endpoints
  ENDPOINTS: {
    LOGIN: '/api/auth/dang-nhap',
    REGISTER: '/api/auth/register',
    PRODUCTS: '/api/san-pham',
    PRODUCT_DETAIL: '/api/san-pham-chi-tiet',
    CART: '/api/gio-hang',
    CART_ITEMS: '/api/gio-hang-chi-tiet',
    ORDERS: '/api/don-hang',
    USERS: '/api/nguoi-dung',
    ADMIN: {
      LOGIN: '/api/auth/dang-nhap',  // Sử dụng cùng endpoint với login thường
      DASHBOARD: '/api/admin/dashboard',
      PRODUCTS: '/api/admin/san-pham',
      ORDERS: '/api/admin/don-hang',
      USERS: '/api/admin/nguoi-dung'
    }
  },
  
  // Helper function để tạo URL API
  getApiUrl: (endpoint) => {
    const baseUrl = config.API_BASE_URL;
    // Đảm bảo endpoint bắt đầu bằng /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
};

export default config;