import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';
import { TagOutlined, SearchOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import Switch from "antd/lib/switch";
import '../styles/AdminPanel.css';

const { Option } = Select;
const { Search } = Input;

export default function ThuongHieuPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [thuongHieus, setThuongHieus] = useState([]);
  // Thêm state cho modal thùng rác và danh sách thương hiệu ngừng hoạt động
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [trashThuongHieus, setTrashThuongHieus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchAll = () => {
    fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
      .then(response => response.json())
      .then(data => setThuongHieus(data))
      .catch(error => console.error('Lỗi khi gọi API thương hiệu:', error));
  };

  const fetchTrashThuongHieus = () => {
    fetch('http://localhost:8080/api/thuong-hieu/getThungRac')
      .then(res => res.json())
      .then(data => setTrashThuongHieus(data));
  };

  const handleSearch = (value) => {
    if (!value.trim()) {
      fetchAll();
      setSearchTerm('');
      return;
    }

    setIsSearching(true);
    setSearchTerm(value);

    fetch(`http://localhost:8080/api/thuong-hieu/search?name=${encodeURIComponent(value)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Lỗi tìm kiếm');
        }
        return response.json();
      })
      .then(data => {
        setThuongHieus(data);
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
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const columns = [
    { 
      title: 'STT', 
      key: 'stt',
      render: (text, record, index) => index + 1 
    },
    { title: 'Tên Thương Hiệu', dataIndex: 'tenThuongHieu', key: 'tenThuongHieu' },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (value, record) => (
        <Switch
          checked={value === 1}
          checkedChildren=""
          unCheckedChildren=""
          style={{ backgroundColor: value === 1 ? '#43a047' : '#e53935' }}
          onChange={() => handleChangeTrangThai(record)}
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="danger" onClick={() => handleDelete(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    showModal();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      tenThuongHieu: item.tenThuongHieu
    });
    showModal();
  };

  const onFinish = (values) => {
    if (editingItem) {
      // Cập nhật
      fetch(`http://localhost:8080/api/thuong-hieu/update/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          tenThuongHieu: values.tenThuongHieu,
          trangThai: Number(values.trangThai)
        }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(errorMessage => {
              throw new Error(errorMessage);
            });
          }
          return response.json();
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'Sửa thành công',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            width: 250
          });
          fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
            .then(res => res.json())
            .then(data => setThuongHieus(data));
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Sửa thất bại',
            text: error.message || 'Có lỗi xảy ra khi sửa thương hiệu',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            width: 350
          });
          console.error(error);
        });
    } else {
      // Thêm mới
      fetch('http://localhost:8080/api/thuong-hieu/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenThuongHieu: values.tenThuongHieu,
          trangThai: Number(values.trangThai)
        }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(errorMessage => {
              throw new Error(errorMessage);
            });
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
          fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
            .then(res => res.json())
            .then(data => setThuongHieus(data));
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Thêm thất bại',
            text: error.message || 'Có lỗi xảy ra khi thêm thương hiệu',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            width: 350
          });
          console.error(error);
        });
    }
    handleCancel();
  };

  // Sửa lại hàm handleDelete để dùng DELETE và hiển thị modal xác nhận bằng Swal
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa thương hiệu này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8080/api/thuong-hieu/del/${id}`, {
          method: 'DELETE',
        })
          .then(res => {
            if (!res.ok) throw new Error('Lỗi khi chuyển trạng thái!');
            return res.json();
          })
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Xóa thành công',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              width: 250
            });
            fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
              .then(res => res.json())
              .then(data => setThuongHieus(data));
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Xóa thất bại',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              width: 250
            });
          });
      }
    });
  };

  // Thêm hàm handleRestore
  const handleRestore = (id) => {
    fetch(`http://localhost:8080/api/thuong-hieu/khoi-phuc/${id}`, {
      method: 'PUT',
    })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi khôi phục!');
        return; // Không gọi res.json() nữa
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Khôi phục thành công',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          width: 250
        });
        fetchTrashThuongHieus();
        fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
          .then(res => res.json())
          .then(data => setThuongHieus(data));
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Khôi phục thất bại',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          width: 250
        });
      });
  };

  // Thêm hàm xử lý đổi trạng thái
  const handleChangeTrangThai = async (item) => {
    const isActive = item.trangThai === 1;
    const result = await Swal.fire({
      title: isActive ? 'Bạn có chắc chắn muốn ngừng hoạt động thương hiệu này?' : 'Bạn có chắc chắn muốn chuyển sang hoạt động?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    });
    if (!result.isConfirmed) return;
    try {
      if (isActive) {
        await fetch(`http://localhost:8080/api/thuong-hieu/del/${item.id}`, { method: 'DELETE' });
      } else {
        await fetch(`http://localhost:8080/api/thuong-hieu/khoi-phuc/${item.id}`, { method: 'PUT' });
      }
      fetch('http://localhost:8080/api/thuong-hieu/getAllFull')
        .then(res => res.json())
        .then(data => setThuongHieus(data));
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật trạng thái thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
    }
  };

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý Thương Hiệu</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" onClick={handleAdd}>Thêm Thương Hiệu Mới</Button>
          
        </div>
      </div>
      
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search
          placeholder="Tìm kiếm thương hiệu theo tên..."
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
        dataSource={thuongHieus} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        loading={isSearching}
      />

      <Modal
        title={editingItem ? "Sửa Thương Hiệu" : "Thêm Thương Hiệu"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ trangThai: 1 }}
        >
          {editingItem && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="tenThuongHieu"
            label="Tên Thương Hiệu"
            rules={[{ required: true, message: 'Vui lòng nhập Tên Thương Hiệu!' }]}
          >
            <Input prefix={<TagOutlined />} placeholder="Tên Thương Hiệu" />
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn Trạng Thái!' }]}
          >
            <Select placeholder="Chọn Trạng Thái">
              <Option value={1}>Đang hoạt động</Option>
              <Option value={0}>Không hoạt động</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingItem ? "Cập Nhật" : "Thêm Mới"}
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Thêm modal hiển thị danh sách thương hiệu ngừng hoạt động */}
      
    </div>
  );
} 