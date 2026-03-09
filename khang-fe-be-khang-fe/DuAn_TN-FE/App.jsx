import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './admin/AdminDashboard';
import MainLayout from './layouts/MainLayout';
import AdminPanel from './admin/AdminPanel';
import AdminLogin from './admin/AdminLogin';
import ProtectedRoute from './admin/ProtectedRoute';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import OrderDetail from './pages/OrderDetail';
import VnpayTestInfo from './pages/VnpayTestInfo';
import CheckPayment from './pages/CheckPayment';
import DebugInfo from './components/DebugInfo';
import GHNTestComponent from './components/GHNTestComponent';
import './styles/App.css';
import { testConfig } from './utils/testConfig';
import Profile from './pages/Profile';
import CustomerProtectedRoute from './components/ProtectedRoute';

// Test config khi app khởi động
testConfig();

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/debug" element={<DebugInfo />} />
        <Route path="/ghn-test" element={<GHNTestComponent />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/vnpay-test" element={<VnpayTestInfo />} />
          <Route path="/check-payment" element={<CheckPayment />} />
          <Route path="/profile" element={<CustomerProtectedRoute><Profile /></CustomerProtectedRoute>} />
        </Route>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-panel/*" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
export default App;
