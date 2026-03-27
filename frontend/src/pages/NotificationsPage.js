import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notificationService';
import { userService } from '../services/api';
import '../styles/Dashboard.css';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, announcements
  const [activeTab, setActiveTab] = useState('inbox'); // inbox, send
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState({ type: '', text: '' });
  const [sendType, setSendType] = useState('direct'); // direct, announcement
  const [recipientRole, setRecipientRole] = useState('student');
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'send' && (user?.role === 'teacher' || user?.role === 'hod')) {
      fetchRecipients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.role]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      // Handle both array and object responses
      const data = Array.isArray(response) ? response : (response?.notifications || response?.data || []);
      const normalized = Array.isArray(data)
        ? data.map((n) => ({ ...n, read: n.read ?? n.isRead }))
        : [];
      setNotifications(normalized);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, read: true, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, read: true, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const isRead = notif.read ?? notif.isRead;
    if (filter === 'unread') return !isRead;
    if (filter === 'announcements') return notif.type === 'announcement';
    return true;
  });

  const unreadCount = notifications.filter((n) => !(n.read ?? n.isRead)).length;
  const announcementCount = notifications.filter((n) => n.type === 'announcement').length;

  const fetchRecipients = async () => {
    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        userService.getStudents({ limit: 200 }),
        user?.role === 'hod' ? userService.getTeachers({ limit: 200 }) : Promise.resolve({ data: { teachers: [] } }),
      ]);

      setStudents(studentsResponse.data?.students || []);
      setTeachers(teachersResponse.data?.teachers || []);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      setStudents([]);
      setTeachers([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!title.trim() || !message.trim()) {
      setSendMessage({ type: 'error', text: 'Please fill in both title and message.' });
      return;
    }

    setSending(true);
    setSendMessage({ type: '', text: '' });

    try {
      const sendData = { title, message, recipientRole };
      console.log('Sending notification with data:', sendData, 'recipientId:', recipientId);
      
      // Handle "Send to All" option
      if (recipientId === 'all_recipients') {
        // For "send to all", teachers should use bulk endpoint or we create the broadcast differently
        if (user?.role === 'teacher') {
          // Teachers send via announcement endpoint (needs backend to allow teachers)
          await notificationService.sendBroadcast({
            title,
            message,
            recipientRole,
          });
          setSendMessage({ type: 'success', text: `Sent to all ${recipientRole}s successfully.` });
        } else {
          // HOD sends announcement
          await notificationService.sendAnnouncement({
            title,
            message,
            recipientRole,
          });
          setSendMessage({ type: 'success', text: `Sent to all ${recipientRole}s successfully.` });
        }
      } else if (user?.role === 'hod' && sendType === 'announcement') {
        await notificationService.sendAnnouncement({
          title,
          message,
          recipientRole,
        });
        setSendMessage({ type: 'success', text: 'Announcement sent successfully.' });
      } else {
        if (!recipientId) {
          setSendMessage({ type: 'error', text: 'Please select a recipient.' });
          setSending(false);
          return;
        }
        await notificationService.sendNotification({
          recipientId,
          recipientRole,
          title,
          message,
          type: 'message',
        });
        setSendMessage({ type: 'success', text: 'Notification sent successfully.' });
      }

      setTitle('');
      setMessage('');
      setRecipientId('');
      fetchNotifications();
    } catch (error) {
      console.error('Notification send error:', error);
      const errorResponse = error.response?.data;
      let errorText = 'Failed to send notification.';
      
      if (errorResponse?.error) {
        // Use the human-readable error message from backend
        errorText = errorResponse.error;
      } else if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
        // Fallback to extracting from errors array
        errorText = errorResponse.errors
          .map(e => `${e.param}: ${e.msg}`)
          .join(', ');
      } else if (error.message) {
        errorText = error.message;
      }
      
      console.error('Error text:', errorText);
      setSendMessage({ type: 'error', text: errorText });
    } finally {
      setSending(false);
    }
  };

  const recipientOptions = recipientRole === 'teacher' ? teachers : students;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'approval':
        return '✅';
      case 'rejection':
        return '❌';
      case 'message':
        return '💬';
      default:
        return '📌';
    }
  };

  const getTypeTheme = (type) => {
    switch (type) {
      case 'announcement':
        return { bg: '#fff7e6', border: '#ffd591', text: '#ad6800' };
      case 'approval':
        return { bg: '#f6ffed', border: '#b7eb8f', text: '#237804' };
      case 'rejection':
        return { bg: '#fff1f0', border: '#ffa39e', text: '#a8071a' };
      case 'message':
        return { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' };
      default:
        return { bg: '#f5f5f5', border: '#d9d9d9', text: '#434343' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.pageShell}>
      <Sidebar />
      <div style={styles.pageMain}>
        <div style={styles.heroPanel}>
          <div>
            <h1 style={styles.heroTitle}>Notifications Hub</h1>
            <p style={styles.heroSubtitle}>A focused feed for alerts, messages, and announcements.</p>
            <div style={styles.heroChips}>
              <span style={styles.heroChip}>Total {notifications.length}</span>
              <span style={styles.heroChipUnread}>Unread {unreadCount}</span>
              <span style={styles.heroChipAnnounce}>Announcements {announcementCount}</span>
            </div>
          </div>
          <button
            style={{
              ...styles.markAllButton,
              ...(notifications.every((n) => (n.read ?? n.isRead)) ? styles.markAllButtonDisabled : {}),
            }}
            onClick={markAllAsRead}
            disabled={notifications.every((n) => (n.read ?? n.isRead))}
          >
            Mark All as Read
          </button>
        </div>

        {(user?.role === 'teacher' || user?.role === 'hod') && (
          <div style={styles.tabRow}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'inbox' ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab('inbox')}
            >
              Inbox
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'send' ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab('send')}
            >
              Compose
            </button>
          </div>
        )}

        {(user?.role === 'teacher' || user?.role === 'hod') && activeTab === 'send' && (
          <Card title="Compose Notification">
            <form onSubmit={handleSend} style={styles.sendForm}>
              {user?.role === 'hod' && (
                <div style={styles.formRow}>
                  <label style={styles.label}>Delivery Type</label>
                  <select
                    value={sendType}
                    onChange={(e) => setSendType(e.target.value)}
                    style={styles.input}
                  >
                    <option value="direct">Direct Message</option>
                    <option value="announcement">Announcement (Broadcast)</option>
                  </select>
                </div>
              )}

              <div style={styles.formRow}>
                <label style={styles.label}>Recipient Role</label>
                <select
                  value={recipientRole}
                  onChange={(e) => {
                    setRecipientRole(e.target.value);
                    setRecipientId('');
                  }}
                  style={styles.input}
                >
                  <option value="student">Student</option>
                </select>
              </div>

              {sendType === 'direct' && (
                <div style={styles.formRow}>
                  <label style={styles.label}>Recipient</label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select recipient</option>
                    <option value="all_recipients" style={{fontWeight: '600', color: '#1d4ed8'}}>
                      📢 Send to all {recipientRole}s
                    </option>
                    {recipientOptions.map((recipient) => (
                      <option key={recipient._id} value={recipient._id}>
                        {recipient.name} ({recipient.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.formRow}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRowWide}>
                <label style={styles.label}>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={styles.textarea}
                  required
                />
              </div>

              {sendMessage.text && (
                <div
                  style={{
                    ...styles.sendStatus,
                    ...(sendMessage.type === 'error' ? styles.sendError : styles.sendSuccess),
                  }}
                >
                  {sendMessage.text}
                </div>
              )}

              <button type="submit" style={styles.sendButton} disabled={sending}>
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </Card>
        )}

        {activeTab === 'inbox' && (
          <div style={styles.filterContainer}>
            <button
              style={{ ...styles.filterButton, ...(filter === 'all' ? styles.filterButtonActive : {}) }}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              style={{ ...styles.filterButton, ...(filter === 'unread' ? styles.filterButtonActive : {}) }}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              style={{ ...styles.filterButton, ...(filter === 'announcements' ? styles.filterButtonActive : {}) }}
              onClick={() => setFilter('announcements')}
            >
              Announcements ({announcementCount})
            </button>
          </div>
        )}

        {activeTab === 'inbox' &&
          (loading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🔔</span>
                <h3 style={styles.emptyTitle}>No notifications yet</h3>
                <p style={styles.emptyText}>Your inbox is clear.</p>
              </div>
            </Card>
          ) : (
            <div style={styles.notificationsList}>
              {filteredNotifications.map((notification) => {
                const theme = getTypeTheme(notification.type);
                const isUnread = !(notification.read ?? notification.isRead);

                return (
                  <div
                    key={notification._id}
                    style={{
                      ...styles.messageCard,
                      borderColor: theme.border,
                      background: isUnread ? '#ffffff' : '#fcfcfd',
                    }}
                  >
                    <div style={{ ...styles.messageIconWrap, background: theme.bg, color: theme.text }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div style={styles.messageBody}>
                      <div style={styles.messageTopRow}>
                        <h3 style={styles.messageTitle}>{notification.title}</h3>
                        {isUnread && <span style={styles.unreadBadge}>Unread</span>}
                      </div>

                      <p style={styles.messageText}>{notification.message}</p>

                      <div style={styles.messageMeta}>
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.sender && <span>From: {notification.sender.name}</span>}
                      </div>
                    </div>

                    <div style={styles.messageActions}>
                      {isUnread && (
                        <button style={styles.actionButton} onClick={() => markAsRead(notification._id)}>
                          Mark Read
                        </button>
                      )}
                      <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={() => deleteNotification(notification._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
};

const styles = {
  pageShell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f6f9ff',
  },
  pageMain: {
    flex: 1,
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  heroPanel: {
    background: 'linear-gradient(135deg, #eaf2ff 0%, #f4f9ff 100%)',
    border: '1px solid #d9e6ff',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heroTitle: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
    color: '#17375e',
  },
  heroSubtitle: {
    marginTop: '6px',
    marginBottom: '10px',
    color: '#4f6b8c',
    fontSize: '14px',
  },
  heroChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  heroChip: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #d8e2f2',
    color: '#334e68',
    fontSize: '12px',
    fontWeight: '600',
  },
  heroChipUnread: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#eef4ff',
    border: '1px solid #b7ccff',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '700',
  },
  heroChipAnnounce: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#fff8e7',
    border: '1px solid #f8d48f',
    color: '#9a6700',
    fontSize: '12px',
    fontWeight: '700',
  },
  tabRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '4px',
  },
  tabButton: {
    padding: '10px 18px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7deea',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    backgroundColor: '#1d4ed8',
    color: 'white',
    borderColor: '#1d4ed8',
  },
  sendForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  formRow: {
    display: 'grid',
    gap: '6px',
  },
  formRowWide: {
    display: 'grid',
    gap: '6px',
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d2d9e6',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    minHeight: '120px',
    resize: 'vertical',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d2d9e6',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  sendButton: {
    gridColumn: '1 / -1',
    padding: '12px 18px',
    backgroundColor: '#1d4ed8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  sendStatus: {
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  sendError: {
    background: '#fdecea',
    color: '#b71c1c',
    gridColumn: '1 / -1',
  },
  sendSuccess: {
    background: '#e8f5e9',
    color: '#2e7d32',
    gridColumn: '1 / -1',
  },
  markAllButton: {
    padding: '10px 20px',
    backgroundColor: '#1d4ed8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  markAllButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #d7deea',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s ease',
  },
  filterButtonActive: {
    backgroundColor: '#1d4ed8',
    color: 'white',
    borderColor: '#1d4ed8',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyTitle: {
    margin: '0 0 6px 0',
    color: '#26374d',
  },
  emptyText: {
    margin: 0,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '12px',
    border: '1px solid #d7deea',
    borderRadius: '12px',
    padding: '14px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
  },
  messageIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
    border: '1px solid transparent',
  },
  messageBody: {
    flex: 1,
  },
  messageTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  messageTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#243b53',
    margin: 0,
  },
  unreadBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    backgroundColor: '#1d4ed8',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '600',
  },
  messageText: {
    fontSize: '14px',
    color: '#475569',
    margin: '0 0 10px 0',
    lineHeight: '1.5',
  },
  messageMeta: {
    fontSize: '12px',
    color: '#708090',
    display: 'flex',
    gap: '15px',
  },
  messageActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
    justifyContent: 'center',
  },
  actionButton: {
    padding: '7px 12px',
    backgroundColor: 'white',
    border: '1px solid #d5ddea',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  deleteButton: {
    color: '#b42318',
    borderColor: '#fda29b',
  },
};

export default NotificationsPage;
