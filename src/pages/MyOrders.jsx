import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, updateOrderStatus, getUnreadCountForOrder } from '../api/auth';
import './MyOrders.css';

function MyOrders() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchOrders(token);
    }, [navigate]);

    const fetchOrders = async (token) => {
        setLoading(true);
        try {
        const data = await getMyOrders(token);
        if (data.success) {
            const fetchedOrders = data.data || [];
            setOrders(fetchedOrders);
            fetchUnreadCounts(token, fetchedOrders);
        }
        } catch (err) {
        console.error('Failed to fetch orders', err);
        } finally {
        setLoading(false);
        }
    };

    const fetchUnreadCounts = async (token, orderList) => {
        const activeOrders = orderList.filter(o => o.status !== 'CANCELLED');
        const counts = {};
        await Promise.all(
        activeOrders.map(async (order) => {
            try {
            const data = await getUnreadCountForOrder(token, order.id);
            if (data.success) counts[order.id] = data.data || 0;
            } catch (err) {
            counts[order.id] = 0;
            }
        })
        );
        setUnreadCounts(counts);
    };

    const handleStatusUpdate = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
        const token = sessionStorage.getItem('token');
        await updateOrderStatus(token, orderId, status);
        fetchOrders(token);
        } catch (err) {
        console.error('Failed to update order status', err);
        } finally {
        setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const getStatusColor = (status) => {
        if (status === 'PENDING') return 'status-pending';
        if (status === 'CONFIRMED') return 'status-confirmed';
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'CANCELLED') return 'status-cancelled';
        return '';
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'BUYER') return '/buyer-dashboard';
        if (user.role === 'FARMER') return '/farmer-dashboard';
        return '/login';
    };

    if (!user) return null;

    return (
        <div className="mo-container">
        {/* NAV */}
        <nav className="mo-nav">
            <div className="mo-nav-brand">
            <span className="mo-nav-title">AgriBridge</span>
            <span className="mo-nav-badge">{user.role === 'BUYER' ? 'Buyer' : 'Farmer'}</span>
            </div>
            <div className="mo-nav-right">
            <span className="mo-nav-name">👤 {user.fullName}</span>
            <button className="mo-back-btn" onClick={() => navigate(getDashboardPath())}>
                ← Dashboard
            </button>
            <button className="mo-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        <div className="mo-body">
            <div className="mo-header">
            <h1>{user.role === 'BUYER' ? '📦 My Orders' : '📋 My Sales'}</h1>
            <p>{user.role === 'BUYER'
                ? 'Track all your rescue orders here.'
                : 'Manage orders from buyers here.'}
            </p>
            </div>

            {/* FILTER TABS */}
            <div className="mo-filters">
            {filters.map(f => (
                <button
                key={f}
                className={`mo-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                >
                {f}
                </button>
            ))}
            </div>

            {/* ORDERS */}
            {loading ? (
            <div className="mo-empty">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
            <div className="mo-empty">
                <span>📭</span>
                <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} orders found.</p>
                {user.role === 'BUYER' && (
                <button className="mo-btn-primary" onClick={() => navigate('/buyer-dashboard')}>
                    Browse Produce
                </button>
                )}
            </div>
            ) : (
            <div className="mo-orders-list">
                {filteredOrders.map((order) => {
                const unread = unreadCounts[order.id] || 0;
                return (
                    <div
                    className={`mo-order-card ${unread > 0 ? 'has-unread' : ''}`}
                    key={order.id}
                    >
                    {/* Photo */}
                    <div className="mo-order-img">
                        {order.photoBase64 ? (
                        <img src={order.photoBase64} alt={order.produceName} />
                        ) : (
                        <div className="mo-order-img-placeholder">🥬</div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mo-order-info">
                        <div className="mo-order-top">
                        <div>
                            <h3>{order.produceName}</h3>
                            <p className="mo-order-number">#{order.orderNumber}</p>
                        </div>
                        <div className="mo-order-top-right">
                            <span className={`mo-status ${getStatusColor(order.status)}`}>
                            {order.status}
                            </span>
                            {unread > 0 && (
                            <span className="mo-unread-badge">
                                💬 {unread} new message{unread > 1 ? 's' : ''}
                            </span>
                            )}
                        </div>
                        </div>

                        <div className="mo-order-details">
                        <span>📦 {order.quantity} {order.unit}</span>
                        <span>₱{order.pricePerUnit}/{order.unit}</span>
                        <span className="mo-total">Total: ₱{order.totalPrice}</span>
                        </div>

                        <p className="mo-pickup">📍 {order.pickupLocation}</p>

                        {user.role === 'BUYER' && order.farmerName && (
                        <p className="mo-party">🧑‍🌾 Farmer: {order.farmerName}
                            {order.farmerPhone && ` • ${order.farmerPhone}`}
                        </p>
                        )}
                        {user.role === 'FARMER' && order.buyerName && (
                        <p className="mo-party">🛒 Buyer: {order.buyerName}
                            {order.buyerPhone && ` • ${order.buyerPhone}`}
                        </p>
                        )}

                        {order.buyerNotes && (
                        <p className="mo-notes">📝 {order.buyerNotes}</p>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="mo-order-actions">
                        {order.status !== 'CANCELLED' && (
                            <button
                            className={`mo-btn-message ${unread > 0 ? 'mo-btn-message-active' : ''}`}
                            onClick={() => navigate(`/messages/${order.id}`)}
                            >
                            💬 Message{unread > 0 && ` (${unread})`}
                            </button>
                        )}

                        {user.role === 'FARMER' && order.status === 'PENDING' && (
                            <>
                            <button
                                className="mo-btn-confirm"
                                disabled={updatingId === order.id}
                                onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                            >
                                {updatingId === order.id ? '⏳' : '✅ Confirm'}
                            </button>
                            <button
                                className="mo-btn-cancel"
                                disabled={updatingId === order.id}
                                onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                            >
                                {updatingId === order.id ? '⏳' : '❌ Reject'}
                            </button>
                            </>
                        )}

                        {order.status === 'CONFIRMED' && (
                            <button
                            className="mo-btn-complete"
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                            >
                            {updatingId === order.id ? '⏳' : '✅ Mark Complete'}
                            </button>
                        )}

                        {user.role === 'BUYER' && order.status === 'PENDING' && (
                            <button
                            className="mo-btn-cancel"
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                            >
                            {updatingId === order.id ? '⏳' : '❌ Cancel'}
                            </button>
                        )}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
}

export default MyOrders;