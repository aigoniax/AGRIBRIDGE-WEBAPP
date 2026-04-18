import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../api/auth';
import './Chat.css';

function Chat() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchMessages(token);

        // Poll every 3 seconds for new messages
        pollRef.current = setInterval(() => {
        fetchMessages(token, false);
        }, 3000);

        return () => clearInterval(pollRef.current);
    }, [navigate, orderId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (token, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
        const data = await getMessages(token, orderId);
        if (data.success) {
            setMessages(data.data || []);
            // Set order info from first message if available
            if (data.orderInfo) setOrderInfo(data.orderInfo);
        } else {
            // Unauthorized or order not found
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
        const data = await sendMessage(token, orderId, newMessage.trim());
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

    const formatTime = (sentAt) => {
        if (!sentAt) return '';
        const date = new Date(sentAt);
        return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
        });
    };

    const formatDate = (sentAt) => {
        if (!sentAt) return '';
        const date = new Date(sentAt);
        return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.sentAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {});

    if (!user) return null;

    return (
        <div className="chat-container">
        {/* NAV */}
        <nav className="chat-nav">
            <div className="chat-nav-brand">
            <span className="chat-nav-title">AgriBridge</span>
            <span className="chat-nav-badge">
                {user.role === 'BUYER' ? 'Buyer' : 'Farmer'}
            </span>
            </div>
            <div className="chat-nav-right">
            <span className="chat-nav-name">👤 {user.fullName}</span>
            <button className="chat-back-btn" onClick={() => navigate('/my-orders')}>
                ← My Orders
            </button>
            <button className="chat-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        {/* CHAT BOX */}
        <div className="chat-wrapper">
            {/* CHAT HEADER */}
            <div className="chat-header">
            <div className="chat-header-icon">💬</div>
            <div className="chat-header-info">
                <h2>Order Chat</h2>
                <p>Order #{orderId} — coordinate your pickup details here</p>
            </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="chat-messages">
            {loading ? (
                <div className="chat-loading">Loading messages...</div>
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
                    {/* Date separator */}
                    <div className="chat-date-separator">
                    <span>{date}</span>
                    </div>

                    {dateMessages.map((message) => {
                    const isMe = message.senderId === null
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
                            <span className="chat-time">{formatTime(message.sentAt)}</span>
                        </div>
                        </div>
                    );
                    })}
                </div>
                ))
            )}
            <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <form className="chat-input-area" onSubmit={handleSend}>
            <textarea
                className="chat-input"
                placeholder="Type a message... (Press Enter to send)"
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
            >
                {sending ? '⏳' : '➤'}
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