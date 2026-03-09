import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Input, Button, Space, Divider, message } from 'antd';
import { Link } from 'react-router-dom';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const footerLinks = {
  'Về Chúng Tôi': [
    { label: 'Giới thiệu', link: '/about' },
    { label: 'Tuyển dụng', link: '/careers' },
    { label: 'Liên hệ', link: '/contact' },
  ],
  'Chính Sách': [
    { label: 'Chính sách bảo mật', link: '/privacy' },
    { label: 'Điều khoản sử dụng', link: '/terms' },
    { label: 'Chính sách đổi trả', link: '/return-policy' },
  ],
  'Hỗ Trợ': [
    { label: 'FAQ', link: '/faq' },
    { label: 'Vận chuyển', link: '/shipping' },
    { label: 'Bảo hành', link: '/warranty' },
  ],
};

function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    if (!email) {
      message.warning('Vui lòng nhập email của bạn');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error('Email không hợp lệ');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success('Đăng ký nhận tin thành công!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <AntFooter style={{ 
      background: 'linear-gradient(180deg, #0a1628 0%, #001529 100%)',
      color: '#fff',
      padding: '80px 10% 30px',
      marginTop: '60px',
    }}>
      <Row gutter={[48, 48]}>
        {/* Thông tin liên hệ */}
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ 
            color: '#fff', 
            marginBottom: '24px',
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}>
            Thông Tin Liên Hệ
          </Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.querySelector('svg').style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.querySelector('svg').style.color = '#fff';
            }}>
              <EnvironmentOutlined style={{ 
                marginRight: '12px', 
                fontSize: '18px',
                marginTop: '4px',
                color: '#fff',
                transition: 'color 0.3s ease',
              }} />
              <Text style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '14px',
                lineHeight: '1.6',
              }}>
                123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </Text>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.querySelector('svg').style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.querySelector('svg').style.color = '#fff';
            }}>
              <PhoneOutlined style={{ 
                marginRight: '12px', 
                fontSize: '18px',
                color: '#fff',
                transition: 'color 0.3s ease',
              }} />
              <Text style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '14px',
              }}>0123 456 789</Text>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.querySelector('svg').style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.querySelector('svg').style.color = '#fff';
            }}>
              <MailOutlined style={{ 
                marginRight: '12px', 
                fontSize: '18px',
                color: '#fff',
                transition: 'color 0.3s ease',
              }} />
              <Text style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '14px',
              }}>contact@shoestore.com</Text>
            </div>
          </Space>
        </Col>

        {/* Menu links */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <Col xs={24} sm={12} md={4} key={title}>
            <Title level={4} style={{ 
              color: '#fff', 
              marginBottom: '24px',
              fontSize: '18px',
              fontWeight: '600',
              letterSpacing: '0.5px',
            }}>
              {title}
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {links.map(link => (
                <Link 
                  key={link.label} 
                  to={link.link}
                  style={{ 
                    color: 'rgba(255,255,255,0.75)', 
                    display: 'block',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    padding: '4px 0',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#1890ff';
                    e.target.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.75)';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Space>
          </Col>
        ))}

        {/* Đăng ký nhận tin */}
        <Col xs={24} sm={24} md={8}>
          <Title level={4} style={{ 
            color: '#fff', 
            marginBottom: '24px',
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}>
            Đăng Ký Nhận Tin
          </Title>
          <Text style={{ 
            color: 'rgba(255,255,255,0.75)', 
            display: 'block', 
            marginBottom: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
          }}>
            Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt
          </Text>
          <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
            <Input 
              placeholder="Email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleSubscribe}
              style={{
                height: '44px',
                fontSize: '14px',
                borderRadius: '6px 0 0 6px',
              }}
            />
            <Button 
              type="primary" 
              onClick={handleSubscribe}
              loading={loading}
              style={{
                height: '44px',
                borderRadius: '0 6px 6px 0',
                fontSize: '14px',
                fontWeight: '500',
                padding: '0 24px',
              }}
            >
              Đăng ký
            </Button>
          </Space.Compact>
          <Text style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '12px',
          }}>
            Chúng tôi cam kết bảo mật thông tin của bạn
          </Text>
        </Col>
      </Row>

      <Divider style={{ 
        borderColor: 'rgba(255,255,255,0.1)',
        margin: '40px 0 30px',
      }} />

      {/* Social media và copyright */}
      <Row justify="space-between" align="middle" style={{ flexWrap: 'wrap' }}>
        <Col xs={24} sm={24} md={12} style={{ marginBottom: '16px' }}>
          <Text style={{ 
            color: 'rgba(255,255,255,0.65)', 
            fontSize: '14px',
          }}>
            © 2024 ShoeStore. Tất cả quyền được bảo lưu.
          </Text>
        </Col>
        <Col xs={24} sm={24} md={12} style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginBottom: '16px',
        }}>
          <Space size="large">
            <Link 
              to="#" 
              style={{ 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1877f2';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FacebookOutlined style={{ fontSize: '20px' }} />
            </Link>
            <Link 
              to="#" 
              style={{ 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <InstagramOutlined style={{ fontSize: '20px' }} />
            </Link>
            <Link 
              to="#" 
              style={{ 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff0000';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <YoutubeOutlined style={{ fontSize: '20px' }} />
            </Link>
          </Space>
        </Col>
      </Row>
    </AntFooter>
  );
}

export default Footer; 