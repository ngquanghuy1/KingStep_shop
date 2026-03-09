import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, message, InputNumber, Popconfirm, Row, Col, Card } from 'antd';
import { TagOutlined, FileTextOutlined, CalendarOutlined, PoundOutlined, NumberOutlined, AlignLeftOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import Swal from 'sweetalert2';
import '../styles/AdminPanel.css'; // Import the CSS file
import ProductManagementPage from './ProductManagementPage'; // Đảm bảo import này vẫn ở đó

const { Option } = Select;
const { Search } = Input;

export default function VoucherPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [selectedVoucherType, setSelectedVoucherType] = useState('Giảm giá %');
  
  // ✅ THÊM: State cho tìm kiếm và lọc
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucherTypes, setVoucherTypes] = useState([]);

  // ✅ THÊM: Fetch danh sách voucher
  useEffect(() => {
    fetchVouchers();
  }, []);

  // ✅ THÊM: Khởi tạo filteredVouchers khi vouchers thay đổi
  useEffect(() => {
    if (vouchers.length > 0) {
      console.log('🔄 Khởi tạo filteredVouchers với', vouchers.length, 'voucher');
      setFilteredVouchers(vouchers);
    }
  }, [vouchers]);

  // ✅ THÊM: Filter voucher khi có thay đổi tìm kiếm (real-time)
  useEffect(() => {
    if (vouchers.length > 0 && (searchText || selectedType)) {
      console.log('🔍 Có thay đổi tìm kiếm, gọi filterVouchers...');
      filterVouchers();
    }
  }, [searchText, selectedType]);

  // ✅ SỬA: Debounce filter local thay vì gọi API
  useEffect(() => {
    if (searchText || selectedType) {
      const timer = setTimeout(() => {
        console.log('⏰ Debounce filter sau 300ms...');
        filterVouchers();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchText, selectedType]);

  // ✅ SỬA: Sử dụng danh sách loại cố định thay vì gọi API
  useEffect(() => {
    setVoucherTypes(['Giảm giá %', 'Giảm giá số tiền']);
  }, []);

  // ✅ THÊM: Function fetch vouchers
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Đang gọi API voucher...');
      const response = await fetch('http://localhost:8080/api/voucher');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API trả về data:', data);
        console.log('📊 Số lượng voucher:', data.length);
        setVouchers(data);
        setFilteredVouchers(data); // ✅ Đảm bảo filteredVouchers có data
      } else {
        console.error('❌ API response không ok:', response.status, response.statusText);
        message.error('API trả về lỗi: ' + response.status);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gọi API voucher:', error);
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  // ✅ THÊM: Function filter vouchers
  const filterVouchers = () => {
    console.log('🔍 Bắt đầu filter vouchers...');
    console.log('📊 Vouchers gốc:', vouchers.length);
    console.log('🔎 Search text:', searchText);
    console.log('🏷️ Selected type:', selectedType);
    
    // ✅ Nếu không có filter, hiển thị tất cả voucher
    if (!searchText && !selectedType) {
      console.log('✅ Không có filter, hiển thị tất cả voucher');
      setFilteredVouchers(vouchers);
      return;
    }
    
    let filtered = [...vouchers];

    // Lọc theo text tìm kiếm (tên hoặc mã voucher)
    if (searchText) {
      filtered = filtered.filter(voucher => 
        voucher.tenVoucher?.toLowerCase().includes(searchText.toLowerCase()) ||
        voucher.maVoucher?.toLowerCase().includes(searchText.toLowerCase())
      );
      console.log('🔍 Sau khi filter text:', filtered.length);
    }

    // Lọc theo loại voucher
    if (selectedType) {
      filtered = filtered.filter(voucher => voucher.loaiVoucher === selectedType);
      console.log('🏷️ Sau khi filter type:', filtered.length);
    }

    console.log('✅ Kết quả filter:', filtered.length, 'voucher');
    setFilteredVouchers(filtered);
  };

  // ✅ THÊM: Function reset filter
  const resetFilters = () => {
    console.log('🔄 Reset filters...');
    setSearchText('');
    setSelectedType('');
    // ✅ Đảm bảo hiển thị lại tất cả voucher khi reset
    setTimeout(() => {
      setFilteredVouchers(vouchers);
      console.log('✅ Đã reset, hiển thị', vouchers.length, 'voucher');
    }, 0);
  };

  // ✅ SỬA: Function search với filter local thay vì gọi API
  const handleSearch = () => {
    // Sử dụng filter local thay vì gọi API
    filterVouchers();
    if (searchText || selectedType) {
      message.success(`Đã lọc ${filteredVouchers.length} voucher`);
    }
  };

  const columns = [
    { 
      title: 'STT', 
      key: 'stt',
      render: (text, record, index) => index + 1 
    },
    { title: 'Mã Voucher', dataIndex: 'maVoucher', key: 'maVoucher' },
    { title: 'Tên Voucher', dataIndex: 'tenVoucher', key: 'tenVoucher' },
    { title: 'Loại Voucher', dataIndex: 'loaiVoucher', key: 'loaiVoucher' },
    { title: 'Mô Tả', dataIndex: 'moTa', key: 'moTa' },
    { title: 'Số Lượng', dataIndex: 'soLuong', key: 'soLuong' },
    { title: 'Giá Trị', dataIndex: 'giaTri', key: 'giaTri' },
    { title: 'Đơn Tối Thiểu', dataIndex: 'donToiThieu', key: 'donToiThieu' },
    { title: 'Ngày Bắt Đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau', render: (value) => value ? moment(value).format('DD/MM/YYYY') : '' },
    { title: 'Ngày Kết Thúc', dataIndex: 'ngayKetThuc', key: 'ngayKetThuc', render: (value) => value ? moment(value).format('DD/MM/YYYY') : '' },
    { title: 'Trạng Thái', dataIndex: 'trangThai', key: 'trangThai', render: (value) => value === 1 ? <span style={{ color: "green" }}>Đang hoạt động</span> : <span style={{ color: "red" }}>Hết Hạn</span> },
    
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>Sửa</Button>
          {/* <Button type="danger" onClick={() =>handleDeleteVoucher(record.id)}>Xóa</Button> */}
          
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingVoucher(null);
    setSelectedVoucherType('Giảm giá %');
    form.resetFields();
    showModal();
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setSelectedVoucherType(voucher.loaiVoucher || 'Giảm giá %');
    form.setFieldsValue({
      ...voucher,
      ngayBatDau: voucher.ngayBatDau ? moment(voucher.ngayBatDau) : null,
      ngayKetThuc: voucher.ngayKetThuc ? moment(voucher.ngayKetThuc) : null,
      ngayTao: voucher.ngayTao ? moment(voucher.ngayTao) : null,
    });
    showModal();
  };

  const onFinish = (values) => {
    // ✅ SỬA: Bỏ validation ở FE vì đã có ở BE
    // Đảm bảo đúng định dạng dữ liệu gửi lên
    const dataSend = {
      ...values,
      soLuong: Number(values.soLuong),
      giaTri: Number(values.giaTri),
      donToiThieu: Number(values.donToiThieu),
      ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format('YYYY-MM-DDTHH:mm:ss') : null,
      ngayKetThuc: values.ngayKetThuc ? values.ngayKetThuc.format('YYYY-MM-DDTHH:mm:ss') : null,
      trangThai: editingVoucher ? Number(values.trangThai) : undefined, // Chỉ gửi trạng thái khi sửa
    };
    if (editingVoucher) {
      // Sửa
      fetch(`http://localhost:8080/api/voucher/update/${editingVoucher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataSend, id: editingVoucher.id }),
      })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Cập nhật thất bại');
          }
          return response.json();
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            width: 250
          });
          fetchVouchers(); // ✅ SỬA: Sử dụng function đã tạo
        })
        .catch(error => {
          // ✅ SỬA: Hiển thị lỗi từ BE
          let errorMessage = 'Vui lòng thử lại!';
          if (error.message) {
            errorMessage = error.message;
          } else if (error.response) {
            // Nếu có response từ server
            errorMessage = error.response.data || error.response.statusText;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại',
            text: errorMessage,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            width: 400
          });
          console.error(error);
        });
    } else {
      // Thêm mới
      fetch('http://localhost:8080/api/voucher/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSend),
      })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Thêm mới thất bại');
          }
          return response.json();
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'Thêm thành công',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            width: 250
          });
          fetchVouchers(); // ✅ SỬA: Sử dụng function đã tạo
        })
        .catch(error => {
          // ✅ SỬA: Hiển thị lỗi từ BE
          let errorMessage = 'Vui lòng thử lại!';
          if (error.message) {
            errorMessage = error.message;
          } else if (error.response) {
            // Nếu có response từ server
            errorMessage = error.response.data || error.response.statusText;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Thêm thất bại',
            text: errorMessage,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            width: 400
          });
          console.error(error);
        });
    }
    handleCancel();
  };

  const handleDeleteVoucher = (id) => {
  Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa vĩnh viễn voucher này không?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Có',
    cancelButtonText: 'Không',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8080/api/voucher/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Có lỗi xảy ra!');
          }
          return response.text();
        })
        .then(msg => {
          Swal.fire({
            icon: 'success',
            title: 'Xóa voucher thành công!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            width: 250
          });
          // Reload lại danh sách voucher
          fetchVouchers(); // ✅ SỬA: Sử dụng function đã tạo
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Xóa voucher thất bại',
            text: error.message || 'Vui lòng thử lại!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            width: 300
          });
        });
    }
  });
};

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Voucher</h1>
        <Button type="primary" onClick={handleAdd}>Thêm Voucher Mới</Button>
      </div>
      <Card className="search-filter-card mb-3">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc mã voucher..."
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              loading={loading}
              allowClear
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Lọc theo loại"
              style={{ width: '100%' }}
              value={selectedType}
              onChange={(value) => setSelectedType(value)}
              loading={loading}
              suffixIcon={<FilterOutlined />}
              allowClear
            >
              <Option value="">Tất cả loại</Option>
              {voucherTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              type="default" 
              onClick={resetFilters} 
              loading={loading} 
              icon={<ReloadOutlined />}
              style={{ width: '100%' }}
            >
              Đặt lại lọc
            </Button>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <span className="text-muted">
              Hiển thị {filteredVouchers.length} / {vouchers.length} voucher
              {searchText || selectedType ? ` (đã lọc)` : ''}
            </span>
          </Col>
        </Row>
      </Card>
      <Table 
        dataSource={filteredVouchers} 
        columns={columns} 
        rowKey="id" 
        pagination={false} 
        loading={loading}
      />

      <Modal
        title={editingVoucher ? "Sửa Voucher" : "Thêm Voucher"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Ẩn footer mặc định của Modal
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ loaiVoucher: 'Giảm giá %' }}
        >
          {editingVoucher && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="maVoucher"
            label="Mã Voucher"
            rules={[{ required: true, message: 'Vui lòng nhập Mã Voucher!' }]}
          >
            <Input prefix={<TagOutlined />} placeholder="Mã Voucher" />
          </Form.Item>
          <Form.Item
            name="tenVoucher"
            label="Tên Voucher"
            rules={[{ required: true, message: 'Vui lòng nhập Tên Voucher!' }]}
          >
            <Input prefix={<TagOutlined />} placeholder="Tên Voucher" />
          </Form.Item>
          <Form.Item
            name="loaiVoucher"
            label="Loại Voucher"
            rules={[{ required: true, message: 'Vui lòng chọn Loại Voucher!' }]}
          >
            <Select 
              prefix={<TagOutlined />} 
              placeholder="Chọn Loại Voucher"
              onChange={(value) => setSelectedVoucherType(value)}
            >
              <Option value="Giảm giá số tiền">Giảm giá số tiền</Option>
              <Option value="Giảm giá %">Giảm giá %</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="moTa"
            label="Mô Tả"
          >
            <Input.TextArea prefix={<AlignLeftOutlined />} placeholder="Mô Tả Voucher" />
          </Form.Item>
          <Form.Item
            name="soLuong"
            label="Số Lượng"
            rules={[{ required: true, message: 'Vui lòng nhập Số Lượng!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} prefix={<NumberOutlined />} placeholder="Số Lượng" />
          </Form.Item>
          <Form.Item
            name="giaTri"
            label="Giá Trị"
            rules={[
              { required: true, message: 'Vui lòng nhập Giá Trị!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const loaiVoucher = getFieldValue('loaiVoucher');
                  const donToiThieu = getFieldValue('donToiThieu');
                  
                  if (!value) return Promise.resolve();
                  
                  if (loaiVoucher === 'Giảm giá số tiền') {
                    if (donToiThieu && value > donToiThieu) {
                      return Promise.reject(new Error('Giá trị không được lớn hơn đơn tối thiểu!'));
                    }
                  } else if (loaiVoucher === 'Giảm giá %') {
                    if (value <= 0 || value > 100) {
                      return Promise.reject(new Error('Giá trị % phải từ 1-100!'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber 
              min={0} 
              max={selectedVoucherType === 'Giảm giá %' ? 100 : undefined}
              style={{ width: '100%' }} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              parser={value => value.replace(/\s?|(,*)/g, '')} 
              prefix={<PoundOutlined />} 
              placeholder={selectedVoucherType === 'Giảm giá %' ? 'Nhập % (1-100)' : 'Nhập số tiền'} 
            />
          </Form.Item>
          <Form.Item
            name="ngayBatDau"
            label="Ngày Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn Ngày Bắt Đầu!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" prefix={<CalendarOutlined />} />
          </Form.Item>
                    <Form.Item
            name="ngayKetThuc"
            label="Ngày Kết Thúc"
            rules={[{ required: true, message: 'Vui lòng chọn Ngày Kết Thúc!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" prefix={<CalendarOutlined />} />
          </Form.Item>
          
         
          
          <Form.Item
            name="donToiThieu"
            label="Đơn Tối Thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập Đơn Tối Thiểu!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Đơn Tối Thiểu"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingVoucher ? "Cập Nhật" : "Thêm Mới"}
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 