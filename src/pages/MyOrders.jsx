import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, updateOrderStatus, getUnreadCountForOrder } from '../api/auth';
import './MyOrders.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaClipboardList, FaBoxOpen, FaMapMarkerAlt } from 'react-icons/fa';
import { MdCheckCircle, MdCancel, MdDashboard, MdInbox } from 'react-icons/md';
import { IoChatbubbleEllipses } from 'react-icons/io5';

function MyOrders() {
    const navigate = useNavigate();
    const [user, setUser]           = useState(null);
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token  = sessionStorage.getItem('token');
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
        } catch (err) { console.error('Failed to fetch orders', err); }
        finally { setLoading(false); }
    };

    const fetchUnreadCounts = async (token, orderList) => {
        const activeOrders = orderList.filter(o => o.status !== 'CANCELLED');
        const counts = {};
        await Promise.all(
            activeOrders.map(async (order) => {
                try {
                    const data = await getUnreadCountForOrder(token, order.id);
                    if (data.success) counts[order.id] = data.data || 0;
                } catch { counts[order.id] = 0; }
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
        } catch (err) { console.error('Failed to update order status', err); }
        finally { setUpdatingId(null); }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const getStatusClass = (status) => {
        if (status === 'PENDING')   return 'status-pending';
        if (status === 'CONFIRMED') return 'status-confirmed';
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'CANCELLED') return 'status-cancelled';
        return '';
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'BUYER')  return '/buyer-dashboard';
        if (user.role === 'FARMER') return '/farmer-dashboard';
        return '/login';
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    if (!user) return null;

    const isFarmer = user.role === 'FARMER';

    return (
        <div className="mo-container">

            {/* NAV */}
            <nav className="mo-nav">
                <div className="mo-nav-brand">
                    <span className="mo-nav-grain">🌾</span>
                    <span className="mo-nav-title">AgriBridge</span>
                    <span className={`mo-nav-badge ${isFarmer ? 'mo-nav-badge-farmer' : 'mo-nav-badge-buyer'}`}>
                        {isFarmer ? 'Farmer' : 'Buyer'}
                    </span>
                </div>
                <div className="mo-nav-right">
                    <span className="mo-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>
                    <button className="mo-nav-btn mo-nav-btn-dashboard" onClick={() => navigate(getDashboardPath())}>
                        <MdDashboard style={{ fontSize: '0.95rem' }} />
                        Dashboard
                    </button>
                    <button className="mo-nav-btn mo-nav-btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* BODY */}
            <div className="mo-body">

                <div className="mo-welcome">
                    <h1>
                        {isFarmer
                            ? <><FaClipboardList style={{ color: '#2563eb', fontSize: '1.6rem' }} />My Sales</>
                            : <><FaBoxOpen style={{ color: '#d97706', fontSize: '1.6rem' }} />My Orders</>
                        }
                    </h1>
                    <p>{isFarmer
                        ? 'Manage orders from buyers here.'
                        : 'Track all your rescue orders here.'}
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
                    <div className="mo-empty">
                        <span style={{ fontSize: '2.5rem' }}>⏳</span>
                        <p>Loading orders…</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="mo-empty">
                        <MdInbox style={{ fontSize: '2.5rem', color: '#94a3b8' }} />
                        <p>No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}orders found.</p>
                        {!isFarmer && (
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
                                    {/* Image */}
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
                                                <span className={`mo-status ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {unread > 0 && (
                                                    <span className="mo-unread-badge">
                                                        <IoChatbubbleEllipses style={{ fontSize: '0.75rem' }} />
                                                        {unread} new message{unread > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mo-order-details">
                                            <span>📦 {order.quantity} {order.unit}</span>
                                            <span className="mo-detail-dot">●</span>
                                            <span>₱{order.pricePerUnit}/{order.unit}</span>
                                            <span className="mo-detail-dot">●</span>
                                            <span className="mo-total">Total: ₱{order.totalPrice}</span>
                                        </div>

                                        <p className="mo-pickup">
                                            <FaMapMarkerAlt style={{ color: '#10b981', fontSize: '0.65rem' }} />
                                            {order.pickupLocation}
                                        </p>

                                        {!isFarmer && order.farmerName && (
                                            <p className="mo-party">
                                                🧑‍🌾 Farmer: {order.farmerName}
                                                {order.farmerPhone && ` • ${order.farmerPhone}`}
                                            </p>
                                        )}
                                        {isFarmer && order.buyerName && (
                                            <p className="mo-party">
                                                🛒 Buyer: {order.buyerName}
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
                                                    className={`mo-action-btn ${unread > 0 ? 'mo-btn-message-active' : 'mo-btn-message'}`}
                                                    onClick={() => navigate(`/messages/${order.id}`)}
                                                >
                                                    <IoChatbubbleEllipses style={{ fontSize: '0.9rem' }} />
                                                    Message{unread > 0 && ` (${unread})`}
                                                </button>
                                            )}

                                            {isFarmer && order.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className="mo-action-btn mo-btn-confirm"
                                                        disabled={updatingId === order.id}
                                                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                                                    >
                                                        <MdCheckCircle style={{ fontSize: '0.95rem' }} />
                                                        {updatingId === order.id ? 'Confirming…' : 'Confirm'}
                                                    </button>
                                                    <button
                                                        className="mo-action-btn mo-btn-cancel"
                                                        disabled={updatingId === order.id}
                                                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                                    >
                                                        <MdCancel style={{ fontSize: '0.95rem' }} />
                                                        {updatingId === order.id ? 'Rejecting…' : 'Reject'}
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    className="mo-action-btn mo-btn-complete"
                                                    disabled={updatingId === order.id}
                                                    onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                >
                                                    <MdCheckCircle style={{ fontSize: '0.95rem' }} />
                                                    {updatingId === order.id ? 'Updating…' : 'Mark Complete'}
                                                </button>
                                            )}

                                            {!isFarmer && order.status === 'PENDING' && (
                                                <button
                                                    className="mo-action-btn mo-btn-cancel"
                                                    disabled={updatingId === order.id}
                                                    onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                                >
                                                    <MdCancel style={{ fontSize: '0.95rem' }} />
                                                    {updatingId === order.id ? 'Cancelling…' : 'Cancel'}
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