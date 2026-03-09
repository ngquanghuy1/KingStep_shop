import React, { useState, useEffect } from 'react';
import { Select, Spin, message } from 'antd';
import config from '../config/config';
import { parseGHNResponse, logGHNResponse } from '../utils/ghnUtils';

const { Option } = Select;

const AddressSelector = ({ 
  onProvinceChange, 
  onDistrictChange, 
  onWardChange,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  showWard = true 
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(config.getApiUrl('api/ghn/provinces'));
        if (response.ok) {
          const responseData = await response.json();
          logGHNResponse('provinces', responseData);
          
          // Sử dụng utility function để parse response
          const data = parseGHNResponse(responseData);
          
          if (data) {
            setProvinces(data);
            console.log('✅ Danh sách tỉnh/thành từ GHN API:', data.length);
          } else {
            console.error('❌ Không thể parse provinces data');
            setProvinces([]);
            setError('Dữ liệu tỉnh/thành không đúng định dạng');
            message.error('Dữ liệu tỉnh/thành không đúng định dạng');
          }
        } else {
          console.error('❌ Lỗi fetch tỉnh/thành:', response.status);
          setProvinces([]);
          setError('Không thể tải danh sách tỉnh/thành phố');
          message.error('Không thể tải danh sách tỉnh/thành phố');
        }
      } catch (error) {
        console.error('❌ Lỗi fetch tỉnh/thành:', error);
        setProvinces([]);
        setError('Lỗi kết nối khi tải danh sách tỉnh/thành phố');
        message.error('Không thể tải danh sách tỉnh/thành phố');
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setDistrictLoading(true);
        setDistricts([]);
        setWards([]);
        try {
          const response = await fetch(config.getApiUrl(`api/ghn/districts/${selectedProvince}`));
                  if (response.ok) {
          const responseData = await response.json();
          logGHNResponse('districts', responseData);
          
          // Sử dụng utility function để parse response
          const data = parseGHNResponse(responseData);
          
          if (data) {
            setDistricts(data);
            console.log('✅ Danh sách quận/huyện từ GHN API:', data.length);
          } else {
            console.error('❌ Không thể parse districts data');
            setDistricts([]);
            message.error('Dữ liệu quận/huyện không đúng định dạng');
          }
        } else {
          console.error('❌ Lỗi fetch quận/huyện:', response.status);
          setDistricts([]);
          message.error('Không thể tải danh sách quận/huyện');
        }
        } catch (error) {
          console.error('❌ Lỗi fetch quận/huyện:', error);
          setDistricts([]);
          message.error('Không thể tải danh sách quận/huyện');
        } finally {
          setDistrictLoading(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setWardLoading(true);
        setWards([]);
        try {
          const response = await fetch(config.getApiUrl(`api/ghn/wards/${selectedDistrict}`));
                  if (response.ok) {
          const responseData = await response.json();
          logGHNResponse('wards', responseData);
          
          // Sử dụng utility function để parse response
          const data = parseGHNResponse(responseData);
          
          if (data) {
            setWards(data);
            console.log('✅ Danh sách phường/xã từ GHN API:', data.length);
          } else {
            console.error('❌ Không thể parse wards data');
            setWards([]);
            message.error('Dữ liệu phường/xã không đúng định dạng');
          }
        } else {
          console.error('❌ Lỗi fetch phường/xã:', response.status);
          setWards([]);
          message.error('Không thể tải danh sách phường/xã');
        }
        } catch (error) {
          console.error('❌ Lỗi fetch phường/xã:', error);
          setWards([]);
          message.error('Không thể tải danh sách phường/xã');
        } finally {
          setWardLoading(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict]);

  const handleProvinceChange = (value) => {
    onProvinceChange?.(value);
  };

  const handleDistrictChange = (value) => {
    onDistrictChange?.(value);
  };

  const handleWardChange = (value) => {
    onWardChange?.(value);
  };

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div style={{ 
        padding: '16px', 
        border: '1px solid #ff4d4f', 
        borderRadius: '6px', 
        backgroundColor: '#fff2f0',
        color: '#ff4d4f'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Lỗi tải dữ liệu địa chỉ</div>
        <div>{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '8px',
            padding: '4px 12px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {/* Tỉnh/Thành phố */}
      <Select
        placeholder="Chọn tỉnh/thành phố"
        style={{ flex: 1, minWidth: 150 }}
        value={selectedProvince}
        onChange={handleProvinceChange}
        loading={loading}
        showSearch
        getPopupContainer={triggerNode => triggerNode.parentNode}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {Array.isArray(provinces) && provinces.map((province) => (
          <Option key={province.ProvinceID} value={province.ProvinceID}>
            {province.ProvinceName}
          </Option>
        ))}
      </Select>

      {/* Quận/Huyện */}
      <Select
        placeholder="Chọn quận/huyện"
        style={{ flex: 1, minWidth: 150 }}
        value={selectedDistrict}
        onChange={handleDistrictChange}
        loading={districtLoading}
        disabled={!selectedProvince}
        showSearch
        getPopupContainer={triggerNode => triggerNode.parentNode}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {Array.isArray(districts) && districts.map((district) => (
          <Option key={district.DistrictID} value={district.DistrictID}>
            {district.DistrictName}
          </Option>
        ))}
      </Select>

      {/* Phường/Xã */}
      {showWard && (
        <Select
          placeholder="Chọn phường/xã"
          style={{ flex: 1, minWidth: 150 }}
          value={selectedWard}
          onChange={handleWardChange}
          loading={wardLoading}
          disabled={!selectedDistrict}
          showSearch
          getPopupContainer={triggerNode => triggerNode.parentNode}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {Array.isArray(wards) && wards.map((ward) => (
            <Option key={ward.WardCode} value={ward.WardCode}>
              {ward.WardName}
            </Option>
          ))}
        </Select>
      )}
    </div>
  );
};

export default AddressSelector; 