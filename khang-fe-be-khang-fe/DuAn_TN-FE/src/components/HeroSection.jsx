import React from 'react';
import { Carousel, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=80',
    title: 'Bộ Sưu Tập Mới 2024',
    description: 'Khám phá những mẫu giày thể thao mới nhất với thiết kế hiện đại và công nghệ tiên tiến',
    buttonText: 'Khám phá ngay',
    buttonLink: '/products',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1920&q=80',
    title: 'Siêu Sale Lên Đến 70%',
    description: 'Cơ hội vàng để sở hữu đôi giày yêu thích với mức giá cực kỳ ưu đãi. Số lượng có hạn!',
    buttonText: 'Mua ngay',
    buttonLink: '/products',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1920&q=80',
    title: 'Thương Hiệu Hàng Đầu Thế Giới',
    description: 'Nike, Adidas, Puma và nhiều thương hiệu nổi tiếng khác. Chất lượng đảm bảo, giá cả hợp lý',
    buttonText: 'Xem bộ sưu tập',
    buttonLink: '/products',
  },
];

function HeroSection() {
  return (
    <div style={{ position: 'relative' }}>
      <Carousel autoplay>
        {heroSlides.map(slide => (
          <div key={slide.id}>
            <div
              style={{
                height: '500px',
                background: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0 10%',
                maxWidth: '100%',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div style={{ 
                color: '#fff', 
                maxWidth: '650px',
                zIndex: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}>
                <Title level={1} style={{ 
                  color: '#fff', 
                  marginBottom: '24px',
                  fontSize: 'clamp(32px, 5vw, 64px)',
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                }}>
                  {slide.title}
                </Title>
                <Paragraph style={{ 
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  color: '#fff',
                  marginBottom: '36px',
                  lineHeight: 1.6,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
                }}>
                  {slide.description}
                </Paragraph>
                <Link to={slide.buttonLink}>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{
                      height: '50px',
                      padding: '0 40px',
                      fontSize: '18px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.4)';
                    }}
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Banner nhỏ bên dưới */}
      <div style={{ 
        padding: '40px 10%',
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap', // Responsive
      }}>
        <div style={{ 
          flex: '1 1 200px', // Responsive flex
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          minWidth: '200px',
        }}>
          <Title level={4} style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Miễn phí vận chuyển</Title>
          <Paragraph style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>Cho đơn hàng từ 500.000đ</Paragraph>
        </div>
        <div style={{ 
          flex: '1 1 200px', // Responsive flex
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          minWidth: '200px',
        }}>
          <Title level={4} style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Đổi trả dễ dàng</Title>
          <Paragraph style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>Trong vòng 30 ngày</Paragraph>
        </div>
        <div style={{ 
          flex: '1 1 200px', // Responsive flex
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          minWidth: '200px',
        }}>
          <Title level={4} style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Thanh toán an toàn</Title>
          <Paragraph style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>Bảo mật thông tin</Paragraph>
        </div>
      </div>
    </div>
  );
}

export default HeroSection; 