# 🏪 Hướng dẫn cấu hình địa chỉ shop GHN

## 📍 Địa chỉ shop của bạn
**66C Ngõ 87, Láng Hạ, Ba Đình, Hà Nội**

## 🔧 Cấu hình đã thực hiện

### 1. Frontend (Payment.js)
Đã cập nhật từ `fromDistrict: 1450` thành `fromDistrict: 1442`:
- ✅ `handleAddressChange()` function
- ✅ `parseAndSelectAddress()` function

### 2. Backend (GhnController.java)
Đã cập nhật tất cả test endpoints:
- ✅ `/test-calculate-fee` - Test tính phí ship
- ✅ `/test-calculate-fee-alt` - Test tính phí ship nội thành
- ✅ `/test-available-services` - Test dịch vụ khả dụng
- ✅ `/test-available-services-hanoi` - Test dịch vụ nội thành

## 📊 Mã địa chỉ GHN

| Thông tin | Giá trị | Mô tả |
|-----------|---------|-------|
| **ProvinceID** | 201 | Hà Nội |
| **DistrictID** | 1484 | Ba Đình |
| **WardCode** | 1A0106 | Liễu Giai (Láng Hạ) |

## 🧪 Test cấu hình

### 1. Test tính phí ship từ shop đến TP.HCM
```bash
curl -X GET "http://localhost:8080/api/ghn/test-calculate-fee"
```

### 2. Test tính phí ship nội thành Hà Nội
```bash
curl -X GET "http://localhost:8080/api/ghn/test-calculate-fee-alt"
```

### 3. Test dịch vụ khả dụng
```bash
curl -X GET "http://localhost:8080/api/ghn/test-available-services"
```

## 🎯 Kết quả mong đợi

Sau khi cấu hình, hệ thống sẽ:
1. ✅ Tính phí ship chính xác từ Ba Đình, Hà Nội
2. ✅ Hiển thị phí ship trong tổng tiền thanh toán
3. ✅ Tự động điền địa chỉ khi khách hàng đã đăng ký
4. ✅ Tính phí ship theo cân nặng thực tế của đơn hàng

## 🔍 Kiểm tra hoạt động

1. **Khởi động backend**: `mvn spring-boot:run`
2. **Khởi động frontend**: `npm start`
3. **Vào trang thanh toán** và chọn địa chỉ giao hàng
4. **Kiểm tra phí ship** được tính tự động

## 📝 Lưu ý quan trọng

- Địa chỉ shop: **66C Ngõ 87, Láng Hạ, Ba Đình, Hà Nội**
- Mã district: **1484** (Ba Đình)
- Mã ward: **1A0106** (Liễu Giai - Láng Hạ)
- Tất cả tính toán phí ship sẽ dựa trên địa chỉ này
- Phí ship sẽ chính xác hơn vì sử dụng địa chỉ thực tế thay vì địa chỉ mặc định

## 🚀 Bước tiếp theo

1. Test tính phí ship với các địa chỉ khác nhau
2. Kiểm tra tính chính xác của phí ship
3. Theo dõi log để đảm bảo không có lỗi
4. Cập nhật thông tin shop trong admin panel nếu cần 