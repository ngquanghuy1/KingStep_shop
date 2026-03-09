const mockOrdersOnline = [
  {
    id: 1,
    maDon: 'HD77564',
    tenKhachHang: 'Nguyễn Thị Hồng',
    ngayTao: '12/22/2023 6:52:02 PM',
    soKhach: '0988688944',
    thanhTien: 3528000,
    loaiDon: 'Online',
    trangThai: 3, // 3: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao, 4: Đã hủy
    chiTiet: {
      lichSuThanhToan: [
        {
          stt: 1,
          maGiaoDich: '89468395',
          thanhToan: 'Khách thanh toán',
          soTien: 3528000,
          thoiGian: '12/22/2023 6:52:25 PM',
          hinhThuc: 'Chuyển khoản',
          ghiChu: '',
          nguoiXacNhan: '',
        },
      ],
      thongTinDonHang: {
        maHoaDon: 'HD77564',
        trangThai: 'Chờ Xác nhận',
        loai: 'Online',
        tenKhachHang: 'Nguyễn Thị Hồng',
        tenNguoiGiao: '',
        soNguoiNhan: '0988688944',
        soNguoiGiao: '',
        diaChi: '25 Nguyễn Thái Học, Q. Hoàn Kiếm',
        email: 'tn000666@gmail.com',
      },
      sanPham: [
        {
          stt: 1,
          ten: 'Giày bóng rổ Nam PEAK Basketball Aspirations E233231A',
          soLuong: 3,
          gia: 1470000,
          giaGoc: 1490000,
          tong: 4410000,
          anh: 'https://product.hstatic.net/200000722513/product/giay-bong-ro-nam-peak-basketball-aspirations-e233231a-1_2a1c6e7c6a7c4e3a8e7e1b6b5c6c6e7e_master.jpg',
        },
      ],
    },
  },
  // Thêm các đơn khác nếu muốn
];
export default mockOrdersOnline; 