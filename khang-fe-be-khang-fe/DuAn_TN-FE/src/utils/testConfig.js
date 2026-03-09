import config from '../config/config';

// Test function để kiểm tra config
export const testConfig = () => {
  console.log('=== TEST CONFIG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('API_BASE_URL:', config.API_BASE_URL);
  console.log('IS_DEV:', config.IS_DEV);
  
  // Test các endpoint
  const testEndpoints = [
    'api/san-pham-chi-tiet/1',
    'api/mau-sac/getAll',
    'api/kich-thuoc/getAll',
    'api/gio-hang-chi-tiet/them'
  ];
  
  testEndpoints.forEach(endpoint => {
    const url = config.getApiUrl(endpoint);
    console.log(`${endpoint} -> ${url}`);
  });
  
  console.log('=== END TEST ===');
};

// Export để có thể gọi từ console
window.testConfig = testConfig; 