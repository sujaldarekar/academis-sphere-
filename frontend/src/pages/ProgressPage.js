import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService, documentService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

export const ProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    fetchAllData();
  }, [user?._id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [progressRes, docsRes] = await Promise.all([
        userService.getStudentDetail(user._id),
        documentService.getMyDocuments(),
      ]);

      setProgressData(progressRes.data.progress || {});
      setDocuments(docsRes.data.documents || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  const safeProgress = {
    overallProgress: progressData?.overallProgress || 0,
  };

  const approvedDocs = documents.filter((doc) => doc.status === 'approved').length;
  const pendingDocs = documents.filter((doc) => doc.status === 'pending').length;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Progress Tracker</h1>
          <p style={styles.subtitle}>Track your academic and document progress in detail</p>
        </div>

        {/* Overall Progress */}
        <Card title="Overall Progress">
          <div style={styles.overallProgressContainer}>
            <div style={styles.circularProgress}>
              <svg width="160" height="160" style={styles.circularSvg}>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 70 * (1 - safeProgress.overallProgress / 100)
                  }`}
                  strokeLinecap="round"
                  style={styles.progressCircle}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2f80ed" />
                    <stop offset="100%" stopColor="#63a4ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={styles.circularText}>
                <span style={styles.circularValue}>{safeProgress.overallProgress}%</span>
                <span style={styles.circularLabel}>Complete</span>
              </div>
            </div>
            <div style={styles.overallStats}>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>📝</div>
                <div>
                  <div style={styles.statValue}>{documents.length}</div>
                  <div style={styles.statLabel}>Total Documents</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={{ ...styles.statIcon, background: '#e8f5e9' }}>✓</div>
                <div>
                  <div style={styles.statValue}>{approvedDocs}</div>
                  <div style={styles.statLabel}>Approved</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={{ ...styles.statIcon, background: '#fff3e0' }}>⏳</div>
                <div>
                  <div style={styles.statValue}>{pendingDocs}</div>
                  <div style={styles.statLabel}>Pending</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg)',
  },
  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--muted)',
    margin: 0,
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
  overallProgressContainer: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  circularProgress: {
    position: 'relative',
    width: '160px',
    height: '160px',
  },
  circularSvg: {
    transform: 'rotate(-90deg)',
  },
  progressCircle: {
    transition: 'stroke-dashoffset 1s ease',
  },
  circularText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  circularValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  circularLabel: {
    fontSize: '14px',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  overallStats: {
    flex: 1,
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
    minWidth: '150px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    background: 'var(--accent)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    margin: '24px 0',
  },
  progressCard: {
    padding: '8px 0',
  },
  progressHint: {
    fontSize: '14px',
    color: 'var(--muted)',
    marginTop: '12px',
    marginBottom: '0',
  },
  documentStats: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  docStatBadge: {
    display: 'inline-block',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  timeline: {
    position: 'relative',
    paddingLeft: '30px',
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: '24px',
    display: 'flex',
    gap: '16px',
  },
  timelineDot: {
    position: 'absolute',
    left: '-30px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginTop: '6px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  timelineDesc: {
    fontSize: '14px',
    color: 'var(--muted)',
    marginBottom: '4px',
  },
  timelineDate: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--muted)',
  },
  tipsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tipItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: '32px',
  },
  tipTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  tipDesc: {
    fontSize: '14px',
    color: 'var(--muted)',
  },
};
