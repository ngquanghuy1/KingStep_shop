import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import { getUserInfo, getCustomerId, isLoggedIn } from "../utils/authUtils";
import config from "../config/config";
import { parseGHNResponse, logGHNResponse } from "../utils/ghnUtils";
import moment from "moment";
import Swal from 'sweetalert2';

const { Option } = Select;

const { Title, Text } = Typography;

const UserProfileCard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // States for address selects
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  // Load info from localStorage and API (if logged in)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const localUser = getUserInfo();

        // Prefill from local first
        const initialValues = {
          name: localUser?.ten || "",
          email: localUser?.email || "",
          phone: localUser?.soDienThoai || "",
          address: localUser?.diaChi || "",
          ngaySinh: localUser?.ngaySinh ? moment(localUser.ngaySinh) : null,
          gioiTinh: localUser?.gioiTinh || null,
        };
        form.setFieldsValue(initialValues);

        // Then try API to fetch more accurate info if logged in
        if (isLoggedIn()) {
          const customerId = getCustomerId();
          if (customerId) {
            try {
              const res = await fetch(
                config.getApiUrl(`api/khachhang/${customerId}`)
              );
              if (res.ok) {
                const data = await res.json();

                const diaChiParts = (initialValues.address || data.diaChi || "")
                  .split(",")
                  .map((p) => p.trim());

                const addressDetail = diaChiParts[0] || "";
                const wardCode = diaChiParts[1] || "";
                const districtId = diaChiParts[2] || "";
                const provinceId = diaChiParts[3] || "";

                form.setFieldsValue({
                  name: initialValues.name || data.ten || data.hoTen || "",
                  email: initialValues.email || data.email || "",
                  phone:
                    initialValues.phone || data.soDienThoai || data.sdt || "",
                  address: addressDetail,
                  wardCode,
                  districtId,
                  provinceId,
                  ngaySinh: data.ngaySinh ? moment(data.ngaySinh) : null,
                  gioiTinh: data.gioiTinh === true ? 'Nam' : data.gioiTinh === false ? 'Nữ' : null,
                });

                if (provinceId) setSelectedProvince(Number(provinceId));
                if (districtId) setSelectedDistrict(Number(districtId));
                if (wardCode) setSelectedWard(wardCode);
              }
            } catch (e) {
              // ignore API errors, keep local values
            }
          }
        }
        setInitialLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [form]);

  const handleProvinceChange = (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
  };

  const handleDistrictChange = (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
  };

  const handleWardChange = (wardId) => {
    setSelectedWard(wardId);
  };

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setAddressLoading(true);
      try {
        const response = await fetch(config.getApiUrl("api/ghn/provinces"));
        if (response.ok) {
          const responseData = await response.json();
          const data = parseGHNResponse(responseData);
          if (data) {
            setProvinces(data);
          }
        }
      } catch (error) {
        console.error("Lỗi fetch tỉnh/thành:", error);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setDistrictLoading(true);
        setDistricts([]);
        setWards([]);
        try {
          const response = await fetch(
            config.getApiUrl(`api/ghn/districts/${selectedProvince}`)
          );
          if (response.ok) {
            const responseData = await response.json();
            const data = parseGHNResponse(responseData);
            if (data) {
              setDistricts(data);
            }
          }
        } catch (error) {
          console.error("Lỗi fetch quận/huyện:", error);
        } finally {
          setDistrictLoading(false);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        setWardLoading(true);
        setWards([]);
        try {
          const response = await fetch(
            config.getApiUrl(`api/ghn/wards/${selectedDistrict}`)
          );
          if (response.ok) {
            const responseData = await response.json();
            const data = parseGHNResponse(responseData);
            if (data) {
              setWards(data);
            }
          }
        } catch (error) {
          console.error("Lỗi fetch phường/xã:", error);
        } finally {
          setWardLoading(false);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict]);

  

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Build full address from components
      let fullAddress = values.address;
      if (selectedProvince && selectedDistrict && selectedWard) {
        // You can enhance this by getting the actual names from the selects
        fullAddress = `${values.address}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
      }

      // Merge with existing 'user' object in localStorage
      const existing = getUserInfo() || {};
      const updated = {
        ...existing,
        ten: values.name || existing.ten,
        email: values.email || existing.email,
        soDienThoai: values.phone || existing.soDienThoai,
        diaChi: fullAddress || existing.diaChi,
        ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null,
        gioiTinh: values.gioiTinh === 'Nam' ? true : values.gioiTinh === 'Nữ' ? false : null,
        profileUpdatedAt: new Date().toISOString(),
      };
      localStorage.setItem("user", JSON.stringify(updated));

      // Also try to update backend if logged in
      if (isLoggedIn()) {
        const customerId = getCustomerId();
        if (customerId) {
          try {
            const body = {
              id: Number(customerId),
              tenKhachHang: values.name,        // ✅ SỬA: Match với backend
              ten: values.name,                 // ✅ GIỮ: Để tương thích
              hoTen: values.name,               // ✅ GIỮ: Để tương thích
              email: values.email || null,
              soDienThoai: values.phone,        // ✅ GIỮ: Để tương thích
              sdt: values.phone,                // ✅ GIỮ: Để tương thích
              diaChi: fullAddress,
              ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null,
              gioiTinh: values.gioiTinh === 'Nam' ? true : values.gioiTinh === 'Nữ' ? false : null,
              trangThai: true,                  // ✅ THÊM: Đảm bảo trạng thái
            };
            
            // ✅ THÊM: Log để debug
            console.log('🔄 Đang cập nhật thông tin khách hàng...');
            console.log('📤 Dữ liệu gửi lên backend:', body);
            console.log('📍 API URL:', config.getApiUrl(`api/khachhang/update/${customerId}`));
            const res = await fetch(
              config.getApiUrl(`api/khachhang/update/${customerId}`),
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }
            );
            if (res.ok) {
              const responseData = await res.json();
              console.log('✅ Cập nhật thành công, response:', responseData);
              // ✅ SỬA: Thay thế message.success bằng Swal
              Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã cập nhật thông tin cá nhân thành công!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                width: 350
              });
              return;
            } else {
              const errorText = await res.text();
              console.error('❌ Cập nhật thất bại:', res.status, errorText);
              // ✅ SỬA: Thay thế message.warning bằng Swal
              Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo',
                text: 'Đã lưu tại máy, nhưng cập nhật hệ thống thất bại.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                width: 400
              });
            }
          } catch (e) {
            // ✅ SỬA: Thay thế message.warning bằng Swal
            Swal.fire({
              icon: 'warning',
              title: 'Cảnh báo',
              text: 'Đã lưu tại máy, nhưng cập nhật hệ thống thất bại.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 4000,
              width: 400
            });
          }
        } else {
          // ✅ SỬA: Thay thế message.success bằng Swal
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đã lưu thông tin cá nhân!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            width: 350
          });
        }
      } else {
        // ✅ SỬA: Thay thế message.success bằng Swal
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã lưu thông tin cá nhân trên máy!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          width: 350
        });
      }
    } catch (err) {
      // validation error
      // ✅ THÊM: Thông báo lỗi validation bằng Swal
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng kiểm tra lại thông tin nhập vào.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        width: 350
      });
    }
  };


  return (
    <Card style={{ margin: "16px 0" }} loading={loading && !initialLoaded}>
      <Title level={3} style={{ marginBottom: 8 }}>
        Thông tin cá nhân
      </Title>
      <Text style={{ display: "block", marginBottom: 16 }}>
        Cập nhật họ tên, điện thoại, email và địa chỉ để tự động điền khi thanh
        toán.
      </Text>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email", message: "Email không hợp lệ" }]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="ngaySinh"
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD" 
            placeholder="Chọn ngày sinh (không bắt buộc)"
          />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          name="gioiTinh"
        >
          <Select placeholder="Chọn giới tính (không bắt buộc)">
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tỉnh/Thành phố">
          <Select
            placeholder="Chọn tỉnh/thành phố"
            value={selectedProvince}
            onChange={handleProvinceChange}
            loading={addressLoading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {Array.isArray(provinces) &&
              provinces.map((province) => (
                <Option key={province.ProvinceID} value={province.ProvinceID}>
                  {province.ProvinceName}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Quận/Huyện">
          <Select
            placeholder="Chọn quận/huyện"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            loading={districtLoading}
            disabled={!selectedProvince}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {Array.isArray(districts) &&
              districts.map((district) => (
                <Option key={district.DistrictID} value={district.DistrictID}>
                  {district.DistrictName}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Phường/Xã">
          <Select
            placeholder="Chọn phường/xã"
            value={selectedWard}
            onChange={handleWardChange}
            loading={wardLoading}
            disabled={!selectedDistrict}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {Array.isArray(wards) &&
              wards.map((ward) => (
                <Option key={ward.WardCode} value={ward.WardCode}>
                  {ward.WardName}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
        </Form.Item>

        <Button type="primary" onClick={handleSave} disabled={loading}>
          Lưu thông tin
        </Button>
      </Form>
    </Card>
  );
};

export default UserProfileCard;
