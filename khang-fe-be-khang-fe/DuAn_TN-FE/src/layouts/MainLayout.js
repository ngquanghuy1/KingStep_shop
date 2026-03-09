import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Content } = Layout;

function MainLayout() {
  return (
    <Layout>
      <Header />
      <Content style={{ padding: '0 20px' }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
}

export default MainLayout; 