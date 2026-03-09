import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag } from 'antd';
import { EyeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import config from '../../config/config';

const EmployeePasswordManager = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();

  // Fetch danh sách nhân viên
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/nhanvien`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        message.error('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Có lỗi xảy ra khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Tạo mật khẩu cho nhân viên
  const createPassword = async (values) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.ADMIN_CREATE_PASSWORD}/${selectedEmployee.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matKhau: values.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message);
        setModalVisible(false);
        form.resetFields();
        setSelectedEmployee(null);
      } else {
        message.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating password:', error);
      message.error('Có lỗi xảy ra khi tạo mật khẩu');
    }
  };

  // Mở modal tạo mật khẩu
  const showCreatePasswordModal = (employee) => {
    setSelectedEmployee(employee);
    setModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedEmployee(null);
  };

  // Columns cho table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'tenNhanVien',
      key: 'tenNhanVien',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: (vaiTro) => (
        <Tag color="blue">
          Admin
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (trangThai) => (
        <Tag color={trangThai ? 'green' : 'red'}>
          {trangThai ? 'Đang hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={() => showCreatePasswordModal(record)}
            disabled={!record.trangThai}
          >
            Tạo mật khẩu
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2>Quản Lý Mật Khẩu Nhân Viên</h2>
        <p>Quản lý tài khoản đăng nhập cho nhân viên hệ thống</p>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
        }}
      />

      {/* Modal tạo mật khẩu */}
      <Modal
        title={`Tạo mật khẩu cho ${selectedEmployee?.tenNhanVien}`}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createPassword}
        >
          <Form.Item
            label="Email nhân viên"
          >
            <Input
              value={selectedEmployee?.email}
              disabled
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              { max: 20, message: 'Mật khẩu không được quá 20 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
                Tạo mật khẩu
              </Button>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeePasswordManager; 