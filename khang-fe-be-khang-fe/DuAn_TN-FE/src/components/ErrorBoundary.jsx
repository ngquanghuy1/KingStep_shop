import React from 'react';
import { Button, Result } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
          extra={[
            <Button 
              type="primary" 
              key="reload"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </Button>,
            <Button 
              key="home"
              onClick={() => window.location.href = '/'}
            >
              Về trang chủ
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 