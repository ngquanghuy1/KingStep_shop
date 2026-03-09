/**
 * Utility functions để xử lý GHN API response
 */

/**
 * Xử lý response từ GHN API
 * @param {Object} responseData - Response data từ API
 * @returns {Array|null} - Array data hoặc null nếu lỗi
 */
export const parseGHNResponse = (responseData) => {
  console.log('🔍 Parsing GHN response:', responseData);
  
  if (!responseData) {
    console.error('❌ Response data is null/undefined');
    return null;
  }
  
  // Nếu responseData là array trực tiếp
  if (Array.isArray(responseData)) {
    console.log('✅ Response is direct array');
    return responseData;
  }
  
  // Nếu responseData có cấu trúc {code, data, message}
  if (responseData.data && Array.isArray(responseData.data)) {
    console.log('✅ Response has data field with array');
    return responseData.data;
  }
  
  // Nếu responseData có cấu trúc khác
  if (responseData.data) {
    console.log('⚠️ Response has data field but not array:', typeof responseData.data);
    return null;
  }
  
  console.error('❌ Unknown response format:', responseData);
  return null;
};

/**
 * Kiểm tra response có thành công không
 * @param {Object} responseData - Response data từ API
 * @returns {boolean} - True nếu thành công
 */
export const isGHNResponseSuccess = (responseData) => {
  if (!responseData) return false;
  
  // Nếu là array trực tiếp
  if (Array.isArray(responseData)) return true;
  
  // Nếu có cấu trúc {code, data, message}
  if (responseData.code === 200 && responseData.data) return true;
  
  return false;
};

/**
 * Lấy error message từ response
 * @param {Object} responseData - Response data từ API
 * @returns {string} - Error message
 */
export const getGHNErrorMessage = (responseData) => {
  if (!responseData) return 'Response data is null';
  
  if (responseData.message) {
    return responseData.message;
  }
  
  if (responseData.error) {
    return responseData.error;
  }
  
  return 'Unknown error';
};

/**
 * Log response details để debug
 * @param {string} endpoint - API endpoint
 * @param {Object} responseData - Response data
 */
export const logGHNResponse = (endpoint, responseData) => {
  console.log(`📊 GHN API Response for ${endpoint}:`);
  console.log('  Raw data:', responseData);
  console.log('  Type:', typeof responseData);
  console.log('  Is Array:', Array.isArray(responseData));
  
  if (responseData && typeof responseData === 'object') {
    console.log('  Keys:', Object.keys(responseData));
    if (responseData.data) {
      console.log('  Data type:', typeof responseData.data);
      console.log('  Data is array:', Array.isArray(responseData.data));
    }
  }
}; 