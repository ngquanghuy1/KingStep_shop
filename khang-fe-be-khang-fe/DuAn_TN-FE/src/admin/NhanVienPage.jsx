import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, message, Popconfirm, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, IdcardOutlined, KeyOutlined, CalendarOutlined, QuestionCircleOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const { Option } = Select;
const { Search } = Input;

export default function NhanVienPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  const [nhanViens, setNhanViens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchNhanViens();
  }, []);

  const fetchNhanViens = () => {
    fetch('http://localhost:8080/api/nhanvien')
      .then(response => response.json())
      .then(data => setNhanViens(data))
      .catch(error => console.error('Lỗi khi gọi API nhân viên:', error));
  };

  const handleSearch = (value) => {
    if (!value.trim()) {
      fetchNhanViens();
      setSearchTerm('');
      return;
    }

    setIsSearching(true);
    setSearchTerm(value);

    fetch(`http://localhost:8080/api/nhanvien/search?keyword=${encodeURIComponent(value)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Lỗi tìm kiếm');
        }
        return response.json();
      })
      .then(data => {
        setNhanViens(data);
        setIsSearching(false);
      })
      .catch(error => {
        console.error('Lỗi khi tìm kiếm:', error);
        message.error('Có lỗi xảy ra khi tìm kiếm');
        setIsSearching(false);
      });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchNhanViens();
  };

  const handleExportExcel = () => {
    // Tạo link tạm thời để download
    const link = document.createElement('a');
    link.href = 'http://localhost:8080/api/nhanvien/export';
    link.download = 'nhanvien.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đang tải file Excel...');
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa nhân viên này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8080/api/nhanvien/delete/${id}`, { method: 'DELETE' })
          .then(res => { if (!res.ok) throw new Error(); })
          .then(() => {
            Swal.fire({ icon: 'success', title: 'Xóa thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
            if (searchTerm) {
              // Nếu đang tìm kiếm, refresh kết quả tìm kiếm
              handleSearch(searchTerm);
            } else {
              // Nếu không tìm kiếm, refresh toàn bộ danh sách
              fetchNhanViens();
            }
          })
          .catch(() => {
            Swal.fire({ icon: 'error', title: 'Xóa thất bại', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
          });
      }
    });
  };



  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên NV', dataIndex: 'tenNhanVien', key: 'tenNhanVien' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    { 
      title: 'Ngày Sinh', 
      dataIndex: 'ngaySinh', 
      key: 'ngaySinh',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : ''
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gioiTinh',
      key: 'gioiTinh',
      render: value => value ? 'Nam' : 'Nữ'
    },
    { title: 'Địa Chỉ', dataIndex: 'diaChi', key: 'diaChi' },
    {
      title: 'Vai Trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: value => value ? 'Quản lý' : 'Nhân viên'
    },
    { title: 'CCCD', dataIndex: 'cccd', key: 'cccd', render: value => value || '-' },
    {
      title: 'Mật Khẩu',
      dataIndex: 'matKhau',
      key: 'matKhau',
      render: value => (
        <span style={{ 
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#666'
        }}>
          {value || '-'}
        </span>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: value => (
        <span style={{ 
          color: value ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {value ? 'Đang hoạt động' : 'Tạm ngưng'}
        </span>
      )
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa thông tin">
            <Button type="primary" size="small" onClick={() => handleEdit(record)}>
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Xóa nhân viên">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              {/* <Button type="danger" size="small">Xóa</Button> */}
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEmployee(null);
    form.resetFields();
  };



  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    showModal();
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...employee,
      ngaySinh: employee.ngaySinh ? moment(employee.ngaySinh) : null,
      gioiTinh: employee.gioiTinh === true || employee.gioiTinh === 1 ? 'Nam' : 'Nữ',
      vaiTro: employee.vaiTro ? 'Quản lý' : 'Nhân viên',
      trangThai: !!employee.trangThai,
      cccd: employee.cccd || '',
      matKhau: employee.matKhau || '', // Thêm mật khẩu vào form sửa
    });
    showModal();
  };

  const onFinish = (values) => {
    const dataSend = {
      ...values,
      tenNhanVien: values.tenNhanVien,
      email: values.email,
      soDienThoai: values.soDienThoai,
      ngaySinh: values.ngaySinh ? values.ngaySinh.format('YYYY-MM-DD') : null,
      gioiTinh: values.gioiTinh === 'Nam',
      diaChi: values.diaChi,
      vaiTro: values.vaiTro === 'Quản lý',
      cccd: values.cccd,
      trangThai: values.trangThai,
      matKhau: values.matKhau,
    };
    
    if (editingEmployee) {
      fetch(`http://localhost:8080/api/nhanvien/update/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataSend, id: editingEmployee.id }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Cập nhật thất bại');
            });
          }
          return response.json();
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Cập nhật nhân viên thành công!',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            width: 300
          });
          if (searchTerm) {
            // Nếu đang tìm kiếm, refresh kết quả tìm kiếm
            handleSearch(searchTerm);
          } else {
            // Nếu không tìm kiếm, refresh toàn bộ danh sách
            fetchNhanViens();
          }
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: error.message || 'Cập nhật nhân viên thất bại!',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            width: 350
          });
          console.error(error);
        });
    } else {
      fetch('http://localhost:8080/api/nhanvien/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSend),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Thêm mới thất bại');
            });
          }
          return response.json();
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Thêm nhân viên thành công!',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            width: 300
          });
          if (searchTerm) {
            // Nếu đang tìm kiếm, refresh kết quả tìm kiếm
            handleSearch(searchTerm);
          } else {
            // Nếu không tìm kiếm, refresh toàn bộ danh sách
            fetchNhanViens();
          }
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: error.message || 'Thêm nhân viên thất bại!',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            width: 350
          });
          console.error(error);
        });
    }
    handleCancel();
  };

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Nhân Viên</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={handleAdd} icon={<UserOutlined />}>
            Thêm Nhân Viên Mới
          </Button>
          <Button 
            type="default" 
            onClick={handleExportExcel}
            icon={<DownloadOutlined />}
          >
            Xuất Excel
          </Button>
        </div>
      </div>
      
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          prefix={<SearchOutlined />}
          style={{ width: 400 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onPressEnter={() => handleSearch(searchTerm)}
          onSearch={() => handleSearch(searchTerm)}
          enterButton
          loading={isSearching}
        />
        {searchTerm && (
          <Button type="link" onClick={handleClearSearch}>
            Xóa tìm kiếm
          </Button>
        )}
      </div>

      <Table 
        dataSource={nhanViens} 
        columns={columns} 
        rowKey="id" 
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
        }}
        scroll={{ x: 1200 }}
        loading={isSearching}
      />

      {/* Modal thêm/sửa nhân viên */}
      <Modal
        title={editingEmployee ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gioiTinh: 'Nam', vaiTro: 'Nhân viên', trangThai: true }}
        >
          {editingEmployee && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="tenNhanVien"
            label="Tên Nhân Viên"
            rules={[{ required: true, message: 'Vui lòng nhập Tên Nhân Viên!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên Nhân Viên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Vui lòng nhập Email hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="soDienThoai"
            label="Số Điện Thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập Số Điện Thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số Điện Thoại" />
          </Form.Item>
          <Form.Item
            name="ngaySinh"
            label="Ngày Sinh"
            rules={[
              { required: true, message: 'Vui lòng chọn Ngày Sinh!' }
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item
            name="gioiTinh"
            label="Giới Tính"
            rules={[{ required: true, message: 'Vui lòng chọn Giới Tính!' }]}
          >
            <Select placeholder="Chọn Giới Tính">
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="diaChi"
            label="Địa Chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập Địa Chỉ!' }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Địa Chỉ" />
          </Form.Item>
          <Form.Item
            name="vaiTro"
            label="Vai Trò"
            rules={[{ required: true, message: 'Vui lòng chọn Vai Trò!' }]}
          >
            <Select placeholder="Chọn Vai Trò">
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Nhân viên">Nhân viên</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="cccd"
            label="CCCD"
          >
            <Input prefix={<IdcardOutlined />} placeholder="CCCD" />
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn Trạng Thái!' }]}
          >
            <Select placeholder="Chọn Trạng Thái">
              <Option value={true}>Đang hoạt động</Option>
              <Option value={false}>Tạm ngưng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="matKhau"
            label="Mật Khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập Mật Khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<KeyOutlined />} placeholder="Mật Khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEmployee ? "Cập Nhật" : "Thêm Mới"}
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