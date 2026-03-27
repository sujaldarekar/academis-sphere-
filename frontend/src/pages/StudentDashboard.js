import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/api';
import Sidebar from '../components/Sidebar';
import { ProgressBar } from '../components/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchProgress = async () => {
    try {
      const response = await userService.getStudentDetail(user?._id);
      setProgress(response.data.progress || null);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeProgress = {
    profileCompletion: progress?.profileCompletion || 0,
    documentProgress: progress?.documentProgress || 0,
    approvedDocuments: progress?.approvedDocuments || 0,
    totalDocuments: progress?.totalDocuments || 0,
    resumeCompletion: progress?.resumeCompletion || 0,
    overallProgress: progress?.overallProgress || 0,
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
            <p style={styles.subtitle}>Track your progress and next steps</p>
          </div>
          <div style={{ ...styles.headerStats, ...(isMobile ? mobileStyles.headerStats : {}) }}>
            <div style={styles.headerStat}>
              <span style={styles.headerStatLabel}>Department</span>
              <span style={styles.headerStatValue}>{user?.department || 'N/A'}</span>
            </div>
            <div style={styles.headerStat}>
              <span style={styles.headerStatLabel}>Status</span>
              <span style={styles.headerStatValue}>Active</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div style={{ ...styles.statsGrid, ...(isMobile ? mobileStyles.statsGrid : {}) }}>
              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>👤</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{safeProgress.profileCompletion}%</div>
                    <div style={styles.statCardLabel}>Profile Completion</div>
                  </div>
                </div>
              </div>

              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>📄</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{safeProgress.approvedDocuments}</div>
                    <div style={styles.statCardLabel}>Approved Documents</div>
                  </div>
                </div>
              </div>

              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>📝</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{safeProgress.resumeCompletion}%</div>
                    <div style={styles.statCardLabel}>Resume Completion</div>
                  </div>
                </div>
              </div>

              <div style={styles.statCardWrapper}>
                <div style={{ ...styles.statCardContent, ...(isMobile ? mobileStyles.statCardContent : {}), background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <div style={styles.statCardTop}>
                    <div style={styles.statCardIcon}>📊</div>
                  </div>
                  <div style={styles.statCardBottom}>
                    <div style={styles.statCardNumber}>{safeProgress.overallProgress}%</div>
                    <div style={styles.statCardLabel}>Overall Progress</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.mainContent, ...(isMobile ? mobileStyles.mainContent : {}) }}>
              <div style={styles.leftColumn}>
                <div style={{ ...styles.sectionCard, ...(isMobile ? mobileStyles.sectionCard : {}) }}>
                  <h2 style={styles.sectionTitle}>📈 Progress Overview</h2>
                  <div style={styles.progressRows}>
                    <div style={styles.progressRow}>
                      <ProgressBar value={safeProgress.profileCompletion} max={100} label="Profile" />
                      <p style={styles.progressHint}>Complete your profile to improve visibility</p>
                    </div>
                    <div style={styles.progressRow}>
                      <ProgressBar value={safeProgress.documentProgress} max={100} label="Document Upload" />
                      <p style={styles.progressHint}>
                        {safeProgress.approvedDocuments}/{safeProgress.totalDocuments} documents approved
                      </p>
                    </div>
                    <div style={styles.progressRow}>
                      <ProgressBar value={safeProgress.resumeCompletion} max={100} label="Resume" />
                      <p style={styles.progressHint}>Build and finalize your resume</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.rightColumn}>
                <div style={{ ...styles.sectionCard, ...(isMobile ? mobileStyles.sectionCard : {}) }}>
                  <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
                  <div style={{ ...styles.quickActionsGrid, ...(isMobile ? mobileStyles.quickActionsGrid : {}) }}>
                    <button style={styles.quickActionCard} onClick={() => navigate('/profile')}>
                      <div style={styles.quickActionNumber}>👤</div>
                      <div style={styles.quickActionName}>Profile</div>
                      <div style={styles.quickActionCount}>Update</div>
                    </button>
                    <button style={styles.quickActionCard} onClick={() => navigate('/documents')}>
                      <div style={styles.quickActionNumber}>📄</div>
                      <div style={styles.quickActionName}>Documents</div>
                      <div style={styles.quickActionCount}>Manage</div>
                    </button>
                    <button style={styles.quickActionCard} onClick={() => navigate('/resume')}>
                      <div style={styles.quickActionNumber}>📝</div>
                      <div style={styles.quickActionName}>Resume</div>
                      <div style={styles.quickActionCount}>Build</div>
                    </button>
                  </div>
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
  progressRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  progressRow: {
    padding: '12px 16px',
    backgroundColor: '#f7fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  progressHint: {
    fontSize: '12px',
    color: '#718096',
    margin: '8px 0 0 0',
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
  quickActionsGrid: {
    gridTemplateColumns: '1fr',
  },
};
