import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber } from "antd";
import axios from "axios";
import moment from "moment";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import "../styles/AdminPanel.css";

const { Option } = Select;

const KhuyenMaiPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State cho tìm kiếm
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/khuyenmai");
      console.log('📥 Dữ liệu mới từ API:', res.data);
      setData(res.data);
      setFilteredData(res.data); // Khởi tạo filteredData
      console.log('✅ Dữ liệu đã được cập nhật vào state');
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      Swal.fire({
        icon: 'error',
        title: 'Không thể tải danh sách khuyến mãi',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    }
    setLoading(false);
  };

  // Hàm tìm kiếm khuyến mãi
  const handleSearch = (searchValue) => {
    setSearchText(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredData(data); // Nếu không có từ khóa, hiển thị tất cả
      return;
    }

    const filtered = data.filter(item => {
      const searchLower = searchValue.toLowerCase();
      const tenKhuyenMai = item.tenKhuyenMai?.toLowerCase() || '';
      const giaTri = item.giaTri?.toString() || '';
      
      return tenKhuyenMai.includes(searchLower) || giaTri.includes(searchLower);
    });
    
    setFilteredData(filtered);
  };

  // Hàm reset tìm kiếm
  const handleResetSearch = () => {
    setSearchText('');
    setFilteredData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ trangThai: 1 }); // Đặt lại trạng thái mặc định
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record.id);
    setIsModalVisible(true);
    
    // Chuyển đổi ngày từ string sang moment object
    const ngayBatDau = record.ngayBatDau ? moment(record.ngayBatDau) : null;
    const ngayKetThuc = record.ngayKetThuc ? moment(record.ngayKetThuc) : null;
    
    form.setFieldsValue({
      tenKhuyenMai: record.tenKhuyenMai,
      giaTri: record.giaTri,
      ngayBatDau: ngayBatDau,
      ngayKetThuc: ngayKetThuc,
      trangThai: record.trangThai
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Bắt buộc validate toàn bộ form
      const khuyenMaiData = {
        tenKhuyenMai: values.tenKhuyenMai,
        giaTri: values.giaTri,
        ngayBatDau: values.ngayBatDau.format('YYYY-MM-DDTHH:mm:ss'),
        ngayKetThuc: values.ngayKetThuc.format('YYYY-MM-DDTHH:mm:ss')
      };
      
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/khuyenmai/update/${editingId}`, khuyenMaiData);
        Swal.fire({ icon: 'success', title: 'Cập nhật khuyến mãi thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
      } else {
        const response = await axios.post("http://localhost:8080/api/khuyenmai/create", khuyenMaiData);
        console.log('✅ Khuyến mãi mới được tạo:', response.data);
        Swal.fire({ icon: 'success', title: 'Thêm khuyến mãi thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, width: 250 });
      }
      
      // Đóng modal trước
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingId(null);
      form.resetFields();
      
      // Đợi một chút để đảm bảo modal đã đóng
      setTimeout(async () => {
        try {
          console.log('🔄 Đang refresh dữ liệu...');
          await fetchData();
          console.log('✅ Dữ liệu đã được refresh');
          
          // Reset tìm kiếm sau khi có dữ liệu mới
          setSearchText('');
          // Không cần setFilteredData(data) vì fetchData đã làm rồi
          console.log('✅ Tìm kiếm đã được reset');
        } catch (error) {
          console.error('❌ Lỗi khi refresh dữ liệu:', error);
        }
      }, 100);
      
    } catch (error) {
      // Nếu validateFields lỗi thì không làm gì cả
      if (error && error.errorFields) return;
      console.error('❌ Lỗi khi submit:', error);
      Swal.fire({ icon: 'error', title: isEditMode ? 'Cập nhật khuyến mãi thất bại' : 'Thêm khuyến mãi thất bại', text: 'Vui lòng thử lại!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1800, width: 250 });
    }
  };

  // Hàm kiểm tra khuyến mãi có thể áp dụng không
  const canApplyPromotion = (record) => {
    // Kiểm tra thời gian trước
    const now = moment();
    const startDate = moment(record.ngayBatDau);
    const endDate = moment(record.ngayKetThuc);
    
    // Chỉ cho phép áp dụng khi thời gian hiện tại nằm trong khoảng [ngày bắt đầu, ngày kết thúc]
    return now.isBetween(startDate, endDate, null, '[]');
  };

  // Hàm lấy thông báo lý do không thể áp dụng
  const getDisabledReason = (record) => {
    const now = moment();
    const startDate = moment(record.ngayBatDau);
    const endDate = moment(record.ngayKetThuc);
    
    if (now.isBefore(startDate)) {
      const daysUntilStart = startDate.diff(now, 'days');
      return `Chưa bắt đầu - Còn ${daysUntilStart > 0 ? `${daysUntilStart} ngày` : 'vài giờ'} nữa`;
    }
    
    if (now.isAfter(endDate)) {
      const daysSinceEnd = now.diff(endDate, 'days');
      return `Đã hết hạn - ${daysSinceEnd > 0 ? `${daysSinceEnd} ngày trước` : 'vài giờ trước'}`;
    }
    
    return '';
  };

  const handleOpenApplyPage = (record) => {
    // Kiểm tra trước khi chuyển trang
    if (!canApplyPromotion(record)) {
      const reason = getDisabledReason(record);
      Swal.fire({
        icon: 'warning',
        title: 'Không thể áp dụng khuyến mãi!',
        text: reason,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1677ff'
      });
      return;
    }
    
    navigate(`/admin-panel/ap-dung-khuyen-mai/${record.id}`);
  };



  const columns = [
    { 
      title: 'STT', 
      key: 'stt',
      render: (text, record, index) => index + 1 
    },
    { title: 'Tên khuyến mãi', dataIndex: 'tenKhuyenMai', key: 'tenKhuyenMai' },
    { 
      title: 'Giá trị', 
      dataIndex: 'giaTri', 
      key: 'giaTri',
      render: (value) =>
        value !== undefined && value !== null
          ? value + '%'
          : '',
    },
    
    { title: 'Ngày bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau', render: (value) => {
      if (!value) return '';
      const date = moment(value);
      return date.isValid() ? date.format('DD/MM/YYYY HH:mm:ss') : String(value).slice(0, 10).split('-').reverse().join('/');
    } },
    { title: 'Ngày kết thúc', dataIndex: 'ngayKetThuc', key: 'ngayKetThuc', render: (value) => {
      if (!value) return '';
      const date = moment(value);
      return date.isValid() ? date.format('DD/MM/YYYY HH:mm:ss') : String(value).slice(0, 10).split('-').reverse().join('/');
    } },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trangThai', 
      key: 'trangThai',
      render: (value, record) => {
        const now = moment();
        const startDate = moment(record.ngayBatDau);
        const endDate = moment(record.ngayKetThuc);
        
        // Kiểm tra thời gian trước
        if (now.isBefore(startDate)) {
          return <span style={{ color: 'orange' }}>Chưa bắt đầu</span>;
        } else if (now.isAfter(endDate)) {
          return <span style={{ color: 'red' }}>Đã hết hạn</span>;
        } else {
          // Trong thời gian hoạt động
          if (value === 1) {
            return <span style={{ color: 'green' }}>Đã áp dụng sản phẩm</span>;
          } else {
            return <span style={{ color: 'blue' }}>Chưa áp dụng sản phẩm</span>;
          }
        }
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const canApply = canApplyPromotion(record);
        const disabledReason = getDisabledReason(record);
        
        return (
          <>
            <Button type="primary" size="small" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
              Sửa
            </Button>
            <Button 
              size="small" 
              onClick={() => handleOpenApplyPage(record)}
              disabled={!canApply}
              title={!canApply ? disabledReason : 'Áp dụng khuyến mãi cho sản phẩm'}
              style={{
                opacity: canApply ? 1 : 0.6,
                cursor: canApply ? 'pointer' : 'not-allowed'
              }}
            >
              Áp dụng cho sản phẩm
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Khuyến Mãi</h1>
        <Button type="primary" onClick={handleAdd}>Thêm Khuyến Mãi Mới</Button>
      </div>
      
      {/* Thanh tìm kiếm */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '12px', 
        margin: '24px 0 16px 0',
        border: '1px solid #e3e8ee'
      }}>
        <h4 style={{ color: '#1976d2', marginBottom: '16px', fontSize: '18px' }}>
          🔍 Tìm kiếm khuyến mãi
        </h4>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Ô tìm kiếm */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <input
              type="text"
              placeholder="Tìm kiếm tên khuyến mãi, giá trị..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>
          
          {/* Nút reset */}
          <button
            onClick={handleResetSearch}
            disabled={!searchText.trim()}
            style={{
              padding: '12px 20px',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              opacity: !searchText.trim() ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            🔄 Reset
          </button>
          
          {/* Thông tin kết quả */}
          <div style={{ 
            color: '#666', 
            fontSize: '14px',
            fontWeight: 500,
            padding: '8px 16px',
            background: '#e3f2fd',
            borderRadius: 6,
            border: '1px solid #2196f3'
          }}>
            📊 Hiển thị {filteredData.length}/{data.length} khuyến mãi
          </div>
        </div>
        
        {/* Hướng dẫn tìm kiếm */}
        <div style={{ 
          marginTop: '12px', 
          fontSize: '13px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          💡 Tìm kiếm theo: <strong>Tên khuyến mãi</strong> hoặc <strong>Giá trị (%)</strong>
        </div>
      </div>
      
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
      />
      
      <Modal
        title={isEditMode ? "Sửa Khuyến Mãi" : "Thêm Khuyến Mãi Mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            trangThai: 1
          }}
        >
          <Form.Item
            name="tenKhuyenMai"
            label="Tên khuyến mãi"
            rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
          >
            <Input placeholder="VD: Khuyến mãi 20/11" />
          </Form.Item>

          <Form.Item
            name="giaTri"
            label="Giá trị (%)"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="VD: 20"
              min={0}
              max={100}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            dependencies={['ngayKetThuc']}
            rules={[
              { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const ngayKetThuc = getFieldValue('ngayKetThuc');
                  if (!value || !ngayKetThuc) {
                    return Promise.resolve();
                  }
                  if (moment(value).isAfter(moment(ngayKetThuc))) {
                    return Promise.reject(new Error('Ngày bắt đầu không được vượt quá ngày kết thúc!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY HH:mm:ss" showTime />
          </Form.Item>

          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            dependencies={['ngayBatDau']}
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const ngayBatDau = getFieldValue('ngayBatDau');
                  if (!value || !ngayBatDau) {
                    return Promise.resolve();
                  }
                  if (moment(ngayBatDau).isAfter(moment(value))) {
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY HH:mm:ss" showTime />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
};

export default KhuyenMaiPage;