import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/api';
import notificationService from '../services/notificationService';
import Sidebar from '../components/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';

export const HODDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, notificationsResponse] = await Promise.all([
        userService.getDepartmentAnalytics(),
        notificationService.getNotifications(),
      ]);
      setAnalytics(analyticsResponse.data);
      const notificationsData = Array.isArray(notificationsResponse)
        ? notificationsResponse
        : (notificationsResponse?.notifications || notificationsResponse?.data || []);
      setNotifications(
        Array.isArray(notificationsData)
          ? notificationsData.map((notification) => ({ ...notification, read: notification.read ?? notification.isRead }))
          : []
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((notification) => !(notification.read ?? notification.isRead)).length;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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

  return (
    <div style={{ ...styles.container, ...(isMobile ? mobileStyles.container : {}) }}>
      <Sidebar />
      <div style={{ ...styles.main, ...(isMobile ? mobileStyles.main : {}) }}>
        <div style={styles.welcomeSection}>
          <div>
            <h1 style={styles.titleRow}>
              <img src="/logo.png" alt="Academia Sphere" style={{ ...styles.titleLogo, ...(isMobile ? mobileStyles.titleLogo : {}) }} />
              <span style={{ ...styles.title, ...(isMobile ? mobileStyles.title : {}) }}>Academia Sphere</span>
            </h1>
            <p style={styles.subtitle}>Department analytics and management overview</p>
          </div>
          <div style={{ ...styles.headerStats, ...(isMobile ? mobileStyles.headerStats : {}) }}>
            <div style={styles.headerStat}>
              <span style={styles.headerStatLabel}>Department</span>
              <span style={styles.headerStatValue}>{analytics?.department || user?.department || 'N/A'}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            <div style={{ ...styles.statsGrid, ...(isMobile ? mobileStyles.statsGrid : {}) }}>
              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>👥</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{analytics?.studentCount || 0}</div>
                    <div style={styles.statCardLabel}>Students</div>
                  </div>
                </div>
              </div>

              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>🧑‍🏫</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{analytics?.teacherCount || 0}</div>
                    <div style={styles.statCardLabel}>Teachers</div>
                  </div>
                </div>
              </div>

              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>🏢</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{(analytics?.studentCount || 0) + (analytics?.teacherCount || 0)}</div>
                    <div style={styles.statCardLabel}>Total Members</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.mainContent, ...(isMobile ? mobileStyles.mainContent : {}) }}>
              <div style={styles.leftColumn}>
                <div style={{ ...styles.sectionCard, ...(isMobile ? mobileStyles.sectionCard : {}) }}>
                  <h2 style={styles.sectionTitle}>📊 Department Overview</h2>
                  <div style={styles.todayStats}>
                    <div style={styles.todayStatItem}>
                      <span style={styles.todayStatLabel}>Total Students</span>
                      <span style={styles.todayStatValue}>{analytics?.studentCount || 0}</span>
                    </div>
                    <div style={styles.todayStatItem}>
                      <span style={styles.todayStatLabel}>Total Teachers</span>
                      <span style={styles.todayStatValue}>{analytics?.teacherCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.rightColumn}>
                <div style={{ ...styles.sectionCard, ...(isMobile ? mobileStyles.sectionCard : {}) }}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>🔔 Notifications Panel</h2>
                    <span style={styles.badge}>{unreadCount} New</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>
                      <span style={{ fontSize: '40px', marginBottom: '10px' }}>🔔</span>
                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    <div style={styles.notificationList}>
                      {notifications.slice(0, 4).map((notification) => {
                        const isUnread = !(notification.read ?? notification.isRead);
                        return (
                          <div
                            key={notification._id}
                            style={{
                              ...styles.notificationItem,
                              borderColor: isUnread ? '#bfdbfe' : '#e2e8f0',
                              backgroundColor: isUnread ? '#f8fbff' : '#f9fafb',
                            }}
                          >
                            <div style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</div>
                            <div style={styles.notificationBody}>
                              <div style={styles.notificationTitleRow}>
                                <div style={styles.notificationTitle}>{notification.title}</div>
                                {isUnread && <span style={styles.unreadDot}>New</span>}
                              </div>
                              <div style={styles.notificationTime}>{formatDate(notification.createdAt)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button style={styles.viewAllBtn} onClick={() => navigate('/notifications')}>
                    Open Notifications →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  main: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  },
  welcomeSection: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  titleLogo: {
    width: '42px',
    height: '42px',
    objectFit: 'contain',
    borderRadius: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: 0,
  },
  headerStats: {
    display: 'flex',
    gap: '32px',
  },
  headerStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerStatLabel: {
    fontSize: '12px',
    color: '#a0aec0',
    fontWeight: '600',
  },
  headerStatValue: {
    fontSize: '16px',
    color: '#2d3748',
    fontWeight: '700',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  statCardWrapper: {
    flex: 1,
  },
  statCardContent: {
    borderRadius: '16px',
    padding: '28px 24px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '160px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  statCardTop: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statCardIcon: {
    fontSize: '32px',
    opacity: 0.8,
  },
  statCardBottom: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  statCardNumber: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
  },
  statCardLabel: {
    fontSize: '12px',
    opacity: 0.95,
    marginTop: '6px',
    fontWeight: '500',
    lineHeight: '1.3',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 20px 0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  badge: {
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
  },
  notificationIcon: {
    fontSize: '20px',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef4ff',
    flexShrink: 0,
  },
  notificationBody: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  notificationTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  notificationTime: {
    fontSize: '11px',
    color: '#718096',
    marginTop: '2px',
  },
  unreadDot: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    borderRadius: '999px',
    padding: '2px 8px',
    flexShrink: 0,
  },
  viewAllBtn: {
    width: '100%',
    padding: '12px',
    background: '#edf2f7',
    border: '2px solid #cbd5e0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  quickActionCard: {
    padding: '20px',
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  quickActionNumber: {
    fontSize: '28px',
  },
  quickActionName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2d3748',
  },
  quickActionCount: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '500',
  },
  todayStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  todayStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f7fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  todayStatLabel: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '500',
  },
  todayStatValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2d3748',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'var(--muted)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    color: 'var(--muted)',
    textAlign: 'center',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid var(--border)',
    borderTop: '4px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
};

const mobileStyles = {
  container: {
    flexDirection: 'column',
  },
  main: {
    padding: '16px',
  },
  title: {
    fontSize: '28px',
  },
  titleLogo: {
    width: '34px',
    height: '34px',
  },
  headerStats: {
    width: '100%',
    justifyContent: 'space-between',
    gap: '12px',
  },
  statsGrid: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  statCardContent: {
    height: '130px',
    padding: '20px 18px',
  },
  mainContent: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  sectionCard: {
    padding: '16px',
  },
};
