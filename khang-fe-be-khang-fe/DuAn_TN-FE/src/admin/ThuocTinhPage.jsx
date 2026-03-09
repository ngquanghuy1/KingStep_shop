import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import { PartitionOutlined, BorderOutlined, BgColorsOutlined, GlobalOutlined, DeploymentUnitOutlined, TagsOutlined, CameraOutlined } from '@ant-design/icons';

import KichThuocPage from './KichThuocPage';
import MauSacPage from './MauSacPage';
import XuatXuPage from './XuatXuPage';
import ChatLieuPage from './ChatLieuPage';
import ThuongHieuPage from './ThuongHieuPage';
import DanhMucPage from './DanhMucPage';

const { Content } = Layout;

function ThuocTinhPage() {
  const location = useLocation();

  const subMenuItems = [
    {
      key: 'kichthuoc',
      icon: <BorderOutlined />,
      label: <Link to="/admin-panel/attributes/kichthuoc">Kích Thước</Link>,
    },
    {
      key: 'mausac',
      icon: <BgColorsOutlined />,
      label: <Link to="/admin-panel/attributes/mausac">Màu Sắc</Link>,
    },
    {
      key: 'xuatxu',
      icon: <GlobalOutlined />,
      label: <Link to="/admin-panel/attributes/xuatxu">Xuất Xứ</Link>,
    },
    {
      key: 'chatlieu',
      icon: <DeploymentUnitOutlined />,
      label: <Link to="/admin-panel/attributes/chatlieu">Chất Liệu</Link>,
    },
    {
      key: 'thuonghieu',
      icon: <TagsOutlined />,
      label: <Link to="/admin-panel/attributes/thuonghieu">Thương Hiệu</Link>,
    },
    {
      key: 'danhmuc',
      icon: <PartitionOutlined />,
      label: <Link to="/admin-panel/attributes/danhmuc">Danh Mục</Link>,
    },
  ];

  // Lấy phần cuối của đường dẫn để xác định menu item đang active
  const getActiveKey = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    // Handle the case where the path ends with /admin-panel/attributes
    // In this case, the default selected key should be 'kichthuoc'
    if (lastPart === 'attributes') {
      return 'kichthuoc';
    }
    return lastPart;
  };

  return (
    <Layout style={{ minHeight: '100%' }}>
      <div style={{ padding: '24px', background: '#fff', marginBottom: '24px' }}>
        <h1 className="page-title">Quản lý Thuộc Tính Sản Phẩm</h1>
        <Menu
          mode="horizontal"
          selectedKeys={[getActiveKey()]}
          items={subMenuItems}
          style={{ borderBottom: 'none' }}
        />
      </div>
      <Content style={{ padding: '0 24px', minHeight: '280px' }}>
        <Routes>
          <Route path="kichthuoc" element={<KichThuocPage />} />
          <Route path="mausac" element={<MauSacPage />} />
          <Route path="xuatxu" element={<XuatXuPage />} />
          <Route path="chatlieu" element={<ChatLieuPage />} />
          <Route path="thuonghieu" element={<ThuongHieuPage />} />
          <Route path="danhmuc" element={<DanhMucPage />} />
          {/* Default to KichThuocPage if no sub-path is specified */}
          <Route index element={<KichThuocPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default ThuocTinhPage; 