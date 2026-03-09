import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ Sửa client ID đúng với cái bạn đã tạo và xác nhận đang hoạt động
const GOOGLE_CLIENT_ID = '326799010600-sqfvc012vkhmkt52bbaemnq3000ps7a4.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // Tùy chỉnh theme nếu cần
        },
      }}
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);