import React, { useState, useEffect, useMemo } from 'react';
import { Card, Statistic, Row, Col, Typography, Space, Divider, Select, Table, Spin, Alert, Button, Progress, DatePicker } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, RiseOutlined, FallOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import SimpleChart from './components/SimpleChart';

const { Title, Text } = Typography;
const { Option } = Select;


function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Bỏ state selectedBestSellerChannel
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  


  // State cho dữ liệu thống kê
  const [statistics, setStatistics] = useState({
    // A. Tổng quan
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalProductsSold: 0,
    ordersCompleted: 0,
    // B. Theo kênh
    onlineRevenue: 0,
    offlineRevenue: 0,
    productsSoldOnline: 0,
    productsSoldOffline: 0,
    // C. Nâng cao
    revenueShare: { onlineRevenue: 0, offlineRevenue: 0, onlinePercent: 0, offlinePercent: 0 },
    bestSellers: []
  });

  const [monthlyGrowthPct, setMonthlyGrowthPct] = useState(0);

  // State cho dữ liệu biểu đồ doanh thu
  const [revenueChartData, setRevenueChartData] = useState([]);



  // Fetch dữ liệu biểu đồ số đơn hàng theo ngày
  const fetchOrderChartData = async () => {
    try {
      const data = [];
      
      // ✅ SỬA: Xử lý đúng múi giờ Việt Nam (UTC+7)
      const formatDateToVietnamTime = (date) => {
        // Tạo ngày mới với múi giờ Việt Nam
        const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        return vietnamDate.toISOString().split('T')[0];
      };
      
      // ✅ THÊM: Cách xử lý múi giờ chính xác hơn
      const formatDateToLocalTime = (date) => {
        // Lấy ngày theo múi giờ local (Việt Nam)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        
        // ✅ DEBUG: Log để kiểm tra múi giờ
        console.log('🔍 === DEBUG MÚI GIỜ ===');
        console.log('📅 Date gốc:', date);
        console.log('🌍 Local date:', localDate);
        console.log('🔍 === END DEBUG ===');
        
        return localDate;
      };
      
      // Nếu có date range, sử dụng date range
      if (startDate && endDate) {
        // Sử dụng date range
        const start = startDate.toDate();
        const end = endDate.toDate();
        
        // Tạo array các ngày từ start đến end
        const currentDate = new Date(start);
        while (currentDate <= end) {
          // ✅ SỬA: Sử dụng múi giờ local chính xác hơn
          const localDate = formatDateToLocalTime(currentDate);
          const response = await axios.get(`http://localhost:8080/api/thong-ke/orders-by-date?date=${localDate}`);
          data.push({
            label: currentDate.toLocaleDateString('vi-VN'),
            value: response.data || 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Nếu không có date range, sử dụng tháng và năm đã chọn
        const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth, 0);
        
        const currentDate = new Date(startOfMonth);
        while (currentDate <= endOfMonth) {
          // ✅ SỬA: Sử dụng múi giờ local chính xác hơn
          const localDate = formatDateToLocalTime(currentDate);
          const response = await axios.get(`http://localhost:8080/api/thong-ke/orders-by-date?date=${localDate}`);
          data.push({
            label: currentDate.toLocaleDateString('vi-VN'),
            value: response.data || 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      setRevenueChartData(data);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu biểu đồ số đơn hàng:', err);
      // Fallback về dữ liệu trống nếu có lỗi
      setRevenueChartData([]);
    }
  };

  // Fetch dữ liệu thống kê
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const month = selectedMonth;
      const year = selectedYear;
      
      const [
        todayRevenueResponse,
        monthlyRevenueResponse,
        productsSoldResponse,
        ordersCompletedResponse,
        prevMonthRevenueResponse,
        revenueOnlineResponse,
        revenueOfflineResponse,
        productsOnlineResponse,
        productsOfflineResponse,
        revenueShareResponse,
        bestSellersResponse
      ] = await Promise.all([
        axios.get('http://localhost:8080/api/thong-ke/today-revenue'),
        axios.get(`http://localhost:8080/api/thong-ke/revenue?month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/products-sold?month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/orders-completed?month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/revenue?month=${month === 1 ? 12 : month - 1}&year=${month === 1 ? year - 1 : year}`),
        axios.get(`http://localhost:8080/api/thong-ke/revenue-by-channel?channel=ONLINE&month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/revenue-by-channel?channel=OFFLINE&month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/products-sold-by-channel?channel=ONLINE&month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/products-sold-by-channel?channel=OFFLINE&month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/revenue-share?month=${month}&year=${year}`),
        axios.get(`http://localhost:8080/api/thong-ke/best-sellers?type=month`) // Luôn gọi với type=month
      ]);

      // Xử lý response data - có thể backend trả về format khác
      const parseResponseData = (data) => {
        if (typeof data === 'number') return data;
        if (typeof data === 'string') {
          // Nếu response là string như "1 0.0", lấy phần số cuối
          const parts = data.split(' ');
          return parseFloat(parts[parts.length - 1]) || 0;
        }
        if (Array.isArray(data) && data.length > 0) {
          return parseFloat(data[data.length - 1]) || 0;
        }
        return 0;
      };

      setStatistics({
        // A. Tổng quan
        todayRevenue: parseResponseData(todayRevenueResponse.data),
        monthlyRevenue: parseResponseData(monthlyRevenueResponse.data),
        totalProductsSold: parseResponseData(productsSoldResponse.data),
        ordersCompleted: parseResponseData(ordersCompletedResponse.data),
        // B. Theo kênh
        onlineRevenue: parseResponseData(revenueOnlineResponse.data),
        offlineRevenue: parseResponseData(revenueOfflineResponse.data),
        productsSoldOnline: parseResponseData(productsOnlineResponse.data),
        productsSoldOffline: parseResponseData(productsOfflineResponse.data),
        // C. Nâng cao
        revenueShare: typeof revenueShareResponse.data === 'object' && revenueShareResponse.data !== null
          ? revenueShareResponse.data
          : { onlineRevenue: 0, offlineRevenue: 0, onlinePercent: 0, offlinePercent: 0 },
        bestSellers: Array.isArray(bestSellersResponse.data) ? bestSellersResponse.data : []
      });

      const prev = parseResponseData(prevMonthRevenueResponse.data);
      const curr = parseResponseData(monthlyRevenueResponse.data);
      const growth = prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
      setMonthlyGrowthPct(growth);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount và khi period thay đổi
  useEffect(() => {
    fetchStatistics();
    fetchOrderChartData();
  }, [selectedYear, selectedMonth]);

  // Fetch dữ liệu biểu đồ ngay khi component load
  useEffect(() => {
    fetchOrderChartData();
  }, []);

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };



  // Bỏ hàm handleBestSellerChannelChange

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleViewChart = () => {
    if (startDate && endDate) {
      fetchOrderChartData();
    }
  };


  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý đường dẫn ảnh giống như SanPhamPage
  const getImageUrl = (img) => {
    if (!img) return '/logo.png';
    // Nếu là mảng, lấy phần tử đầu
    if (Array.isArray(img)) img = img[0];
    // Nếu là chuỗi nhiều ảnh, lấy ảnh đầu
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];
    img = img.trim();
    if (!img) return '/logo.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return 'http://localhost:8080' + img;
    
    // Sử dụng API endpoint thay vì static resource
    return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
  };

  // Cột cho bảng sản phẩm bán chạy
  const bestSellersColumns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Ảnh Sản Phẩm',
      key: 'image',
      render: (_, record) => (
        <img
          src={getImageUrl(record.images || record.imanges)} // Hỗ trợ cả 2 field
          alt={record.productName || "Không có ảnh"}
          style={{
            width: 60,
            height: 60,
            borderRadius: 6,
            objectFit: "cover",
            display: "block",
            margin: "auto",
            background: "#f6f8fa"
          }}
          onError={(e) => {
            console.error(`Product image failed to load: ${record.images || record.imanges}`);
            e.target.src = "/logo.png";
          }}
        />
      ),
      width: 80,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>,
      ellipsis: true,
    },
    {
      title: 'Thương Hiệu',
      dataIndex: 'brandName',
      key: 'brandName',
      ellipsis: true,
    },
    {
      title: 'Số Lượng Đã Bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (value) => (
        <Text type="success" strong>
          {(value || 0).toLocaleString('vi-VN')}
        </Text>
      ),
      sorter: (a, b) => a.totalSold - b.totalSold,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Tỷ Lệ',
      key: 'percentage',
      render: (_, record, index) => {
        const total = statistics.bestSellers.reduce((sum, item) => sum + (item.totalSold || 0), 0);
        const percentage = total > 0 ? (((record.totalSold || 0) / total) * 100).toFixed(1) : 0;
        return (
          <Text type="secondary">
            {percentage}%
          </Text>
        );
      },
    },
  ];

  // Helper hiển thị đổi so với tháng trước
  const MonthlyChange = () => (
    <span style={{ fontSize: 12 }}>
      {monthlyGrowthPct >= 0 ? '▲' : '▼'} {Math.abs(monthlyGrowthPct).toFixed(1)}% so với tháng trước
    </span>
  );

  if (loading) {
    return (
      <div className="admin-content-page" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Đang tải dữ liệu thống kê...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <Title className="page-title" level={2}>
          <RiseOutlined style={{ marginRight: '8px' }} />
          Thống Kê Tổng Quan
        </Title>
        <Space>
          <Select 
            style={{ width: 100 }} 
            onChange={handleYearChange}
            value={selectedYear}
          >
            <Option value={2025}>2025</Option>
            <Option value={2024}>2024</Option>
            <Option value={2023}>2023</Option>
            <Option value={2022}>2022</Option>
          </Select>
          <Select 
            style={{ width: 100 }} 
            onChange={handleMonthChange}
            value={selectedMonth}
          >
            <Option value={1}>T1</Option>
            <Option value={2}>T2</Option>
            <Option value={3}>T3</Option>
            <Option value={4}>T4</Option>
            <Option value={5}>T5</Option>
            <Option value={6}>T6</Option>
            <Option value={7}>T7</Option>
            <Option value={8}>T8</Option>
            <Option value={9}>T9</Option>
            <Option value={10}>T10</Option>
            <Option value={11}>T11</Option>
            <Option value={12}>T12</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchStatistics();
              fetchOrderChartData();
            }}
            loading={loading}
          >
            Làm Mới
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable size="small">
            <Statistic
              title={`Doanh thu tháng ${selectedMonth}/${selectedYear}`}
              value={statistics.monthlyRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
            <div style={{ marginTop: 6 }}>
              <Typography.Text type={monthlyGrowthPct >= 0 ? 'success' : 'danger'}>
                <MonthlyChange />
              </Typography.Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh thu hôm nay"
              value={statistics.todayRevenue}
              precision={0}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable size="small">
            <Statistic
              title={`Sản phẩm đã bán (tháng ${selectedMonth})`}
              value={statistics.totalProductsSold}
              precision={0}
              valueStyle={{ color: '#eb2f96', fontSize: '24px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable size="small">
            <Statistic
              title="Đơn Hoàn Thành"
              value={statistics.ordersCompleted}
              precision={0}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Thống Kê Chi Tiết</Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card size="small"
            title={
              <Space>
                <RiseOutlined />
                <span>Biểu Đồ Thống Kê</span>
              </Space>
            }
            hoverable
          >
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <DatePicker 
                  placeholder="Từ ngày"
                  format="DD/MM/YYYY"
                  style={{ width: 150 }}
                  onChange={handleStartDateChange}
                />
                <DatePicker 
                  placeholder="Đến ngày"
                  format="DD/MM/YYYY"
                  style={{ width: 150 }}
                  onChange={handleEndDateChange}
                />
                <Button type="primary" size="small" onClick={handleViewChart}>
                  Xem
                </Button>
              </Space>

            </div>
            <SimpleChart 
              data={revenueChartData} 
              title="Số Đơn Hàng Theo Ngày"
              type="bar"
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Sản Phẩm Bán Chạy Nhất</Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card size="small"
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Sản Phẩm Bán Chạy Nhất (Theo Tháng)</span>
              </Space>
            }
            hoverable
          >
            {statistics.bestSellers.length > 0 ? (
              <div>
                <Table
                  dataSource={statistics.bestSellers}
                  columns={bestSellersColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  scroll={{ y: 260 }}
                  style={{ marginBottom: '16px' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Chưa có dữ liệu sản phẩm bán chạy</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Thống Kê Theo Kênh</Title>
      </Divider>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh Thu ONLINE"
              value={statistics.onlineRevenue}
              precision={0}
              valueStyle={{ color: '#08979c', fontSize: '20px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh Thu OFFLINE"
              value={statistics.offlineRevenue}
              precision={0}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="SP bán ra ONLINE"
              value={statistics.productsSoldOnline}
              precision={0}
              valueStyle={{ color: '#0958d9', fontSize: '20px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="SP bán ra OFFLINE"
              value={statistics.productsSoldOffline}
              precision={0}
              valueStyle={{ color: '#d4380d', fontSize: '20px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Tỉ Trọng Doanh Thu ONLINE / OFFLINE</Title>
      </Divider>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Card hoverable size="small">
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">ONLINE</Text>
              <Progress percent={Number((statistics.revenueShare.onlinePercent || 0).toFixed ? statistics.revenueShare.onlinePercent.toFixed(1) : statistics.revenueShare.onlinePercent)} showInfo />
            </div>
            <div>
              <Text type="secondary">OFFLINE</Text>
              <Progress strokeColor="#fa8c16" percent={Number((statistics.revenueShare.offlinePercent || 0).toFixed ? statistics.revenueShare.offlinePercent.toFixed(1) : statistics.revenueShare.offlinePercent)} showInfo />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card hoverable size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text>Doanh thu ONLINE:</Text>
              <Text type="success">{new Intl.NumberFormat('vi-VN').format(statistics.revenueShare.onlineRevenue || 0)} ₫</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Doanh thu OFFLINE:</Text>
              <Text type="warning">{new Intl.NumberFormat('vi-VN').format(statistics.revenueShare.offlineRevenue || 0)} ₫</Text>
            </div>
          </Card>
        </Col>
      </Row>
      
    </div>
  );
}

export default StatisticsPage; 