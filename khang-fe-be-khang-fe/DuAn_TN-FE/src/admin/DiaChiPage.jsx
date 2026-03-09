import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';
import { HomeOutlined, TagOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import '../styles/AdminPanel.css';

const { Option } = Select;

export default function DiaChiPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Dữ liệu giả định cho địa chỉ
  const [data, setData] = useState([
    {
      ID: '1',
      MaDiaChi: 'DC001',
      TenKhachHang: 'Nguyễn Văn C',
      Sdt: '0901234567',
      Tinh: 'TP. Hồ Chí Minh',
      Quan: 'Quận 1',
      Phuong: 'Bến Nghé',
      DiaChiCuThe: '123 Đường Lê Lợi',
      TrangThai: 'Đang hoạt động',
    },
    {
      ID: '2',
      MaDiaChi: 'DC002',
      TenKhachHang: 'Lê Thị D',
      Sdt: '0908765432',
      Tinh: 'Hà Nội',
      Quan: 'Quận Ba Đình',
      Phuong: 'Trúc Bạch',
      DiaChiCuThe: '456 Đường Phan Đình Phùng',
      TrangThai: 'Không hoạt động',
    },
  ]);

  const columns = [
    { title: 'Mã Địa Chỉ', dataIndex: 'MaDiaChi', key: 'MaDiaChi' },
    { title: 'Tên Khách Hàng', dataIndex: 'TenKhachHang', key: 'TenKhachHang' },
    { title: 'SĐT', dataIndex: 'Sdt', key: 'Sdt' },
    { title: 'Tỉnh/Thành phố', dataIndex: 'Tinh', key: 'Tinh' },
    { title: 'Quận/Huyện', dataIndex: 'Quan', key: 'Quan' },
    { title: 'Phường/Xã', dataIndex: 'Phuong', key: 'Phuong' },
    { title: 'Địa Chỉ Cụ Thể', dataIndex: 'DiaChiCuThe', key: 'DiaChiCuThe' },
    { title: 'Trạng Thái', dataIndex: 'TrangThai', key: 'TrangThai' },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa địa chỉ này?"
            onConfirm={() => message.info(`Bạn đã click Xóa địa chỉ ${record.MaDiaChi}`)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="danger">Xóa</Button>
          </Popconfirm>
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
    });
    showModal();
  };

  const onFinish = (values) => {
    if (editingItem) {
      message.success('Cập nhật địa chỉ thành công (chỉ giao diện)!');
    } else {
      message.success('Thêm địa chỉ thành công (chỉ giao diện)!');
    }
    handleCancel();
  };

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Địa Chỉ</h1>
        <Button type="primary" onClick={handleAdd}>Thêm Địa Chỉ Mới</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="ID" pagination={false} />

      <Modal
        title={editingItem ? "Sửa Địa Chỉ" : "Thêm Địa Chỉ"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ TrangThai: 'Đang hoạt động' }}
        >
          <Form.Item
            name="MaDiaChi"
            label="Mã Địa Chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập Mã Địa Chỉ!' }]}
          >
            <Input prefix={<TagOutlined />} placeholder="Mã Địa Chỉ" />
          </Form.Item>
          <Form.Item
            name="TenKhachHang"
            label="Tên Khách Hàng"
            rules={[{ required: true, message: 'Vui lòng nhập Tên Khách Hàng!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên Khách Hàng" />
          </Form.Item>
          <Form.Item
            name="Sdt"
            label="Số Điện Thoại"
            rules={[{ required: true, message: 'Vui lòng nhập Số Điện Thoại!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Số Điện Thoại" />
          </Form.Item>
          <Form.Item
            name="Tinh"
            label="Tỉnh/Thành phố"
            rules={[{ required: true, message: 'Vui lòng nhập Tỉnh/Thành phố!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Tỉnh/Thành phố" />
          </Form.Item>
          <Form.Item
            name="Quan"
            label="Quận/Huyện"
            rules={[{ required: true, message: 'Vui lòng nhập Quận/Huyện!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Quận/Huyện" />
          </Form.Item>
          <Form.Item
            name="Phuong"
            label="Phường/Xã"
            rules={[{ required: true, message: 'Vui lòng nhập Phường/Xã!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Phường/Xã" />
          </Form.Item>
          <Form.Item
            name="DiaChiCuThe"
            label="Địa Chỉ Cụ Thể"
            rules={[{ required: true, message: 'Vui lòng nhập Địa Chỉ Cụ Thể!' }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Địa Chỉ Cụ Thể" />
          </Form.Item>
          <Form.Item
            name="TrangThai"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn Trạng Thái!' }]}
          >
            <Select placeholder="Chọn Trạng Thái">
              <Option value="Đang hoạt động">Đang hoạt động</Option>
              <Option value="Không hoạt động">Không hoạt động</Option>
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
    </div>
  );
} 