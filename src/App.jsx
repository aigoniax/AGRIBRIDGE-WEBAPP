import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import BuyerDashboard from './pages/BuyerDashboard.jsx';
import MyListings from './pages/MyListings.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyOrders from './pages/MyOrders.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </Router>
  );
}

export default App;