import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../api/auth';
import './Chat.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaPaperPlane } from 'react-icons/fa';
import { IoReceiptOutline } from 'react-icons/io5';

/* helpers */
const formatTime = (sentAt) => {
    if (!sentAt) return '';
    return new Date(sentAt).toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
};

const formatDate = (sentAt) => {
    if (!sentAt) return '';
    return new Date(sentAt).toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
};

/* main component */
function Chat() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [user, setUser]           = useState(null);
    const [messages, setMessages]   = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading]     = useState(true);
    const [sending, setSending]     = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const messagesEndRef            = useRef(null);
    const pollRef                   = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token  = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchMessages(token);

        pollRef.current = setInterval(() => {
            fetchMessages(sessionStorage.getItem('token'), false);
        }, 3000);

        return () => clearInterval(pollRef.current);
    }, [navigate, orderId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async (token, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await getMessages(token, orderId);
            if (data.success) {
                setMessages(data.data || []);
                if (data.orderInfo) setOrderInfo(data.orderInfo);
            } else {
                navigate('/my-orders');
            }
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            const token = sessionStorage.getItem('token');
            const data  = await sendMessage(token, orderId, newMessage.trim());
            if (data.success) {
                setNewMessage('');
                fetchMessages(token, false);
            }
        } catch (err) {
            console.error('Failed to send message', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const handleLogout = () => {
        clearInterval(pollRef.current);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.sentAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    if (!user) return null;

    const isFarmer   = user.role === 'FARMER';
    const badgeCls   = isFarmer ? 'chat-nav-badge-farmer' : 'chat-nav-badge-buyer';
    const badgeLabel = isFarmer ? 'Farmer' : 'Buyer';

    return (
        <div className="chat-container">

            {/* NAV */}
            <nav className="chat-nav">
                <div className="chat-nav-brand">
                    <span className="chat-nav-grain">🌾</span>
                    <span className="chat-nav-title">AgriBridge</span>
                    <span className={`chat-nav-badge ${badgeCls}`}>{badgeLabel}</span>
                </div>

                <div className="chat-nav-right">
                    <span className="chat-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>

                    <button
                        className="chat-nav-btn chat-nav-btn-back"
                        onClick={() => navigate('/my-orders')}
                    >
                        <IoReceiptOutline style={{ fontSize: '0.95rem' }} />
                        My Orders
                    </button>

                    <button
                        className="chat-nav-btn chat-nav-btn-logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* CHAT WRAPPER */}
            <div className="chat-wrapper">

                {/* HEADER */}
                <div className="chat-header">
                    <div className="chat-header-icon">💬</div>
                    <div className="chat-header-info">
                        <h2>Order Chat</h2>
                        <p>Order #{orderId} — coordinate your pickup details here</p>
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="chat-messages">
                    {loading ? (
                        <div className="chat-loading">Loading messages…</div>
                    ) : messages.length === 0 ? (
                        <div className="chat-empty">
                            <span>💬</span>
                            <p>No messages yet.</p>
                            <p className="chat-empty-sub">
                                Start the conversation to coordinate your pickup!
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <div key={date}>
                                <div className="chat-date-separator">
                                    <span>{date}</span>
                                </div>

                                {dateMessages.map((message) => {
                                    const isMe =
                                        message.senderId === null
                                            ? false
                                            : String(message.senderId) === String(user.id) ||
                                                message.senderName === user.fullName;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`chat-bubble-wrapper ${isMe ? 'me' : 'them'}`}
                                        >
                                            {!isMe && (
                                                <div className="chat-sender-name">
                                                    {message.senderName}
                                                    <span className="chat-sender-role">
                                                        ({message.senderRole})
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                                                <p>{message.messageText}</p>
                                                <span className="chat-time">
                                                    {formatTime(message.sentAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <form className="chat-input-area" onSubmit={handleSend}>
                    <textarea
                        className="chat-input"
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={500}
                        rows={1}
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={sending || !newMessage.trim()}
                        title="Send message"
                    >
                        {sending ? '⏳' : <FaPaperPlane style={{ fontSize: '0.85rem' }} />}
                    </button>
                </form>

                <p className="chat-hint">
                    {newMessage.length}/500 characters • Press Enter to send
                </p>
            </div>
        </div>
    );
}

export default Chat;