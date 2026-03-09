import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';
import { TagOutlined, DeleteOutlined, RollbackOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import Switch from "antd/lib/switch";
import '../styles/AdminPanel.css';
import useMauSacStore from './stores/mauSacStore';

const { Option } = Select;
const { Search } = Input;

export default function MauSacPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [mauSacs, setMauSacs] = useState([]);
  const [thungRac, setThungRac] = useState([]);
  const [showThungRac, setShowThungRac] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { mauSacData, addMauSac, updateMauSac, deleteMauSac } = useMauSacStore();

  const fetchAll = () => {
    fetch('http://localhost:8080/api/mau-sac/getAllFull')
      .then(response => response.json())
      .then(data => setMauSacs(data))
      .catch(error => console.error('Lỗi khi gọi API màu sắc:', error));
  };

  const fetchTrash = () => {
    fetch('http://localhost:8080/api/mau-sac/getThungRac')
      .then(response => response.json())
      .then(data => setThungRac(data))
      .catch(error => console.error('Lỗi khi gọi API thùng rác màu sắc:', error));
  };

  const handleSearch = (value) => {
    if (!value.trim()) {
      fetchAll();
      setSearchTerm('');
      return;
    }

    setIsSearching(true);
    setSearchTerm(value);

    fetch(`http://localhost:8080/api/mau-sac/search?name=${encodeURIComponent(value)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Lỗi tìm kiếm');
        }
        return response.json();
      })
      .then(data => {
        setMauSacs(data);
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
    if (showThungRac) {
      fetchTrash();
    } else {
      fetchAll();
    }
  }, [showThungRac]);

  const columns = [
    { 
      title: 'STT', 
      key: 'stt',
      render: (text, record, index) => index + 1 
    },
    { title: 'Tên Màu Sắc', dataIndex: 'tenMauSac', key: 'tenMauSac', sorter: (a, b) => a.tenMauSac.localeCompare(b.tenMauSac) },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      sorter: (a, b) => a.trangThai - b.trangThai,
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
          <Button style={{ background: '#e6f4ff', color: '#1677ff', border: 'none', borderRadius: 6, fontWeight: 500 }} onClick={() => handleEdit(record)}>Sửa</Button>
          {/* <Button style={{ background: '#fff1f0', color: '#ff4d4f', border: 'none', borderRadius: 6, fontWeight: 500 }} onClick={() => handleDelete(record.id)}>Xóa</Button> */}
        </Space>
      ),
    },
  ];

  const columnsThungRac = [
    { 
      title: 'STT', 
      key: 'stt',
      render: (text, record, index) => index + 1 
    },
    { title: 'Tên Màu Sắc', dataIndex: 'tenMauSac', key: 'tenMauSac', sorter: (a, b) => a.tenMauSac.localeCompare(b.tenMauSac) },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Button style={{ background: '#e6f4ff', color: '#1677ff', border: 'none', borderRadius: 6, fontWeight: 500 }} icon={<RollbackOutlined />} onClick={() => handleRestore(record.id)}>
          Khôi phục
        </Button>
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
      tenMauSac: item.tenMauSac
    });
    showModal();
  };

  const onFinish = (values) => {
    if (editingItem) {
      fetch(`http://localhost:8080/api/mau-sac/update/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          tenMauSac: values.tenMauSac,
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
            title: 'Sửa sản phẩm thành công',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            width: 250
          });;
          fetch('http://localhost:8080/api/mau-sac/getAllFullFull')
            .then(res => res.json())
            .then(data => setMauSacs(data));
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Sửa thất bại',
            text: error.message || 'Có lỗi xảy ra khi sửa màu sắc',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            width: 350
          });
          console.error(error);
        });
    } else {
      fetch('http://localhost:8080/api/mau-sac/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenMauSac: values.tenMauSac,
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
          fetch('http://localhost:8080/api/mau-sac/getAllFull')
            .then(res => res.json())
            .then(data => setMauSacs(data));
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Thêm thất bại',
            text: error.message || 'Có lỗi xảy ra khi thêm màu sắc',
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

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn chuyển màu sắc này vào thùng rác?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8080/api/mau-sac/del/${id}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error('Lỗi khi chuyển vào thùng rác!');
            Swal.fire({ icon: 'success', title: 'Đã chuyển vào thùng rác', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
            if (showThungRac) {
              fetch('http://localhost:8080/api/mau-sac/getThungRac')
                .then(response => response.json())
                .then(data => setThungRac(data));
            } else {
              fetch('http://localhost:8080/api/mau-sac/getAllFull')
                .then(response => response.json())
                .then(data => setMauSacs(data));
            }
          })
          .catch(() => Swal.fire({ icon: 'error', title: 'Xóa thất bại', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 }));
      }
    });
  };

  const handleRestore = (id) => {
    fetch(`http://localhost:8080/api/mau-sac/khoi-phuc/${id}`, { method: 'PUT' })
      .then(res => {
        Swal.fire({ icon: 'success', title: 'Khôi phục thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
        fetch('http://localhost:8080/api/mau-sac/getThungRac')
          .then(response => response.json())
          .then(data => setThungRac(data));
      })
      .catch(() => Swal.fire({ icon: 'error', title: 'Khôi phục thất bại', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 }));
  };

  // Thêm hàm xử lý đổi trạng thái
  const handleChangeTrangThai = async (item) => {
    const isActive = item.trangThai === 1;
    const result = await Swal.fire({
      title: isActive ? 'Bạn có chắc chắn muốn ngừng hoạt động màu sắc này?' : 'Bạn có chắc chắn muốn chuyển sang hoạt động?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    });
    if (!result.isConfirmed) return;
    try {
      if (isActive) {
        await fetch(`http://localhost:8080/api/mau-sac/del/${item.id}`, { method: 'DELETE' });
      } else {
        await fetch(`http://localhost:8080/api/mau-sac/khoi-phuc/${item.id}`, { method: 'PUT' });
      }
      fetch('http://localhost:8080/api/mau-sac/getAllFull')
        .then(res => res.json())
        .then(data => setMauSacs(data));
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="page-title" style={{ margin: 0, fontWeight: 700, color: '#1677ff' }}>Quản lý Màu Sắc</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 6, fontWeight: 500 }} onClick={handleAdd}>Thêm Màu Sắc Mới</Button>
        </div>
      </div>
      
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search
          placeholder="Tìm kiếm màu sắc theo tên..."
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
        dataSource={mauSacs} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        loading={isSearching}
      />

      <Modal
        title={<span style={{ fontWeight: 700, color: '#1677ff' }}>{editingItem ? "Sửa Màu Sắc" : "Thêm Màu Sắc"}</span>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        bodyStyle={{ borderRadius: 12, padding: 24 }}
        style={{ borderRadius: 12 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ trangThai: 1 }}
        >
          {editingItem && (
            <Form.Item name="id" label="ID">
              <Input disabled style={{ borderRadius: 6 }} />
            </Form.Item>
          )}
          <Form.Item
            name="tenMauSac"
            label="Tên Màu Sắc"
            rules={[{ required: true, message: 'Vui lòng nhập tên màu sắc!' }]}
          >
            <Input style={{ borderRadius: 6 }} placeholder="Nhập tên màu sắc" />
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select style={{ borderRadius: 6 }}>
              <Option value={1}>Đang hoạt động</Option>
              <Option value={0}>Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={handleCancel} style={{ borderRadius: 6 }}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 6, fontWeight: 500 }}>{editingItem ? 'Cập nhật' : 'Thêm mới'}</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 