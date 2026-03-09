import { useState, useCallback } from 'react';
import { message } from 'antd';
import config from '../config/config';

const useShippingFee = () => {
  const [shippingFee, setShippingFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateShippingFee = useCallback(async ({
    toDistrict,
    toWardCode,
    weight,
    fromDistrict = null,
    useShop = true
  }) => {
    if (!toDistrict || !toWardCode || !weight) {
      const errorMsg = 'Vui lòng cung cấp đầy đủ thông tin: quận/huyện, phường/xã và cân nặng';
      setError(errorMsg);
      message.error(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = useShop ? 'api/ghn/calculate-fee-shop' : 'api/ghn/calculate-fee';
      const params = new URLSearchParams({
        toDistrict,
        toWardCode,
        weight
      });

      if (!useShop && fromDistrict) {
        params.append('fromDistrict', fromDistrict);
      }

      const response = await fetch(`${config.getApiUrl(endpoint)}?${params}`, {
        method: 'POST'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const textBody = await response.text();
        const data = textBody && contentType.includes('application/json') ? JSON.parse(textBody) : (textBody ? { raw: textBody } : {});
        setShippingFee(data);
        setError(null);
        message.success('Tính phí vận chuyển thành công!');
        return data;
      } else {
        const contentType = response.headers.get('content-type') || '';
        const errorText = await response.text();
        let errorMessage = 'Không thể tính phí vận chuyển';
        if (errorText) {
          if (contentType.includes('application/json')) {
            try {
              const errJson = JSON.parse(errorText);
              errorMessage = errJson.message || errorMessage;
            } catch {
              errorMessage = errorText;
            }
          } else {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Lỗi tính phí vận chuyển:', error);
      setError(error.message);
      message.error(`Lỗi: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetShippingFee = useCallback(() => {
    setShippingFee(null);
    setError(null);
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }, []);

  const formatDeliveryTime = useCallback((timeString) => {
    if (!timeString) return 'Chưa xác định';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return timeString;
    }
  }, []);

  const getShippingFeeBreakdown = useCallback(() => {
    if (!shippingFee) return null;

    return {
      total: shippingFee.total_fee,
      service: shippingFee.service_fee,
      insurance: shippingFee.insurance_fee,
      deliveryTime: shippingFee.expected_delivery_time,
      formattedTotal: formatCurrency(shippingFee.total_fee),
      formattedService: formatCurrency(shippingFee.service_fee),
      formattedInsurance: formatCurrency(shippingFee.insurance_fee),
      formattedDeliveryTime: formatDeliveryTime(shippingFee.expected_delivery_time)
    };
  }, [shippingFee, formatCurrency, formatDeliveryTime]);

  return {
    // State
    shippingFee,
    loading,
    error,
    
    // Actions
    calculateShippingFee,
    resetShippingFee,
    
    // Utilities
    formatCurrency,
    formatDeliveryTime,
    getShippingFeeBreakdown,
    
    // Computed values
    hasShippingFee: !!shippingFee,
    totalFee: shippingFee?.total_fee || 0,
    serviceFee: shippingFee?.service_fee || 0,
    insuranceFee: shippingFee?.insurance_fee || 0,
    deliveryTime: shippingFee?.expected_delivery_time || null
  };
};

export default useShippingFee; 