import React from 'react';
import { Card, Row, Col, Typography, Button, Empty } from 'antd';

const { Title } = Typography;

// Dữ liệu mẫu sản phẩm yêu thích (có thể thay bằng dữ liệu thực tế từ localStorage hoặc API)
const wishlistProducts = [];

function Wishlist() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Sản phẩm yêu thích</Title>
      {wishlistProducts.length === 0 ? (
        <Empty description="Bạn chưa có sản phẩm yêu thích nào." />
      ) : (
        <Row gutter={[16, 16]}>
          {wishlistProducts.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Card
                hoverable
                cover={<img alt={product.name} src={product.img} />}
                actions={[
                  <Button type="primary">Mua ngay</Button>,
                  <Button danger>Xóa khỏi yêu thích</Button>
                ]}
              >
                <Card.Meta title={product.name} description={`Giá: ${product.price.toLocaleString()}đ`} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default Wishlist; 