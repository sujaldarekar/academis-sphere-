import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import api from '../services/api';

export const PerformancePage = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // Fetch teacher's students using the correct API
      const { getStudents, getAssignedStudents } = await import('../services/api').then(m => ({ 
        getStudents: m.userService.getStudents,
        getAssignedStudents: m.userService.getAssignedStudents 
      }));
      
      const studentsRes = await getAssignedStudents();
      const studentsData = studentsRes.data?.data || studentsRes.data || [];

      setStudents(studentsData);
      
      // Calculate performance metrics
      const metrics = calculatePerformanceMetrics(studentsData);
      setPerformance(metrics);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError('Unable to load performance data');
      // Set default empty metrics
      setPerformance({
        totalStudents: 0,
        approvalRate: 0,
        averageCompletion: 0,
        topPerformers: [],
        recentActivity: [],
        metrics: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceMetrics = (students) => {
    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        approvalRate: 0,
        averageCompletion: 0,
        topPerformers: [],
        recentActivity: [],
        metrics: [],
      };
    }

    const totalStudents = students.length;
    
    // Calculate approval rate (approximate based on documents)
    let approvedDocs = 0;
    let totalDocs = 0;
    let totalCompletion = 0;

    students.forEach((student) => {
      if (student.documents) {
        totalDocs += student.documents.length;
        approvedDocs += student.documents.filter(d => d.status === 'approved').length;
      }
      totalCompletion += student.profileCompletion || 0;
    });

    const approvalRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;
    const averageCompletion = totalStudents > 0 ? Math.round(totalCompletion / totalStudents) : 0;

    // Get top performers
    const topPerformers = [...students]
      .sort((a, b) => (b.profileCompletion || 0) - (a.profileCompletion || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.firstName + ' ' + s.lastName,
        completion: s.profileCompletion || 0,
        documents: s.documents ? s.documents.length : 0,
      }));

    // Get recent activity
    const recentActivity = [...students]
      .filter(s => s.documents && s.documents.length > 0)
      .flatMap(s => 
        (s.documents || []).map(d => ({
          studentName: s.firstName + ' ' + s.lastName,
          documentType: d.documentType || 'Document',
          status: d.status,
          date: d.uploadedAt,
        }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return {
      totalStudents,
      approvalRate,
      averageCompletion,
      topPerformers,
      recentActivity,
      metrics: [
        { label: 'Total Documents', value: totalDocs, icon: '📄' },
        { label: 'Approved Documents', value: approvedDocs, icon: '✓' },
        { label: 'Pending Review', value: totalDocs - approvedDocs, icon: '⏳' },
      ],
    };
  };

  const safePerformance = performance || {
    totalStudents: 0,
    approvalRate: 0,
    averageCompletion: 0,
    topPerformers: [],
    recentActivity: [],
    metrics: [],
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Performance</h1>
          <p style={styles.subtitle}>Your performance summary.</p>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Loading performance data...</p>
          </div>
        ) : error ? (
          <Card title="Performance Summary">
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>⚠️ {error}</p>
              <p style={styles.errorHint}>This section will be available soon.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Overall Performance Summary */}
            <Card title="Performance Summary">
              <div style={styles.overallContainer}>
                {/* Circular Progress */}
                <div style={styles.circularProgressWrapper}>
                  <div style={styles.circularProgress}>
                    <svg
                      width="160"
                      height="160"
                      style={styles.circularSvg}
                      viewBox="0 0 160 160"
                    >
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 70 * (1 - safePerformance.averageCompletion / 100)
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
                      <span style={styles.circularValue}>{safePerformance.averageCompletion}%</span>
                      <span style={styles.circularLabel}>Avg Completion</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={styles.overallStats}>
                  <div style={styles.statItem}>
                    <div style={styles.statIcon}>👥</div>
                    <div>
                      <div style={styles.statValue}>{safePerformance.totalStudents}</div>
                      <div style={styles.statLabel}>Total Students</div>
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={{ ...styles.statIcon, background: '#e8f5e9' }}>✓</div>
                    <div>
                      <div style={styles.statValue}>{safePerformance.approvalRate}%</div>
                      <div style={styles.statLabel}>Approval Rate</div>
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={{ ...styles.statIcon, background: '#fff3e0' }}>📊</div>
                    <div>
                      <div style={styles.statValue}>{safePerformance.averageCompletion}%</div>
                      <div style={styles.statLabel}>Avg Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div style={styles.gridContainer}>
              {safePerformance.metrics.map((metric, index) => (
                <Card key={index} title={metric.label}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}>{metric.icon}</div>
                    <div style={styles.metricValue}>{metric.value}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Top Performers */}
            <Card title="Top Performers">
              <div style={styles.topPerformersContainer}>
                {safePerformance.topPerformers.length === 0 ? (
                  <p style={styles.emptyState}>No students yet.</p>
                ) : (
                  safePerformance.topPerformers.map((performer, index) => (
                    <div key={index} style={styles.performerItem}>
                      <div style={styles.performerRank}>#{index + 1}</div>
                      <div style={styles.performerInfo}>
                        <div style={styles.performerName}>{performer.name}</div>
                        <div style={styles.performerStats}>
                          {performer.completion}% • {performer.documents} documents
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.performerProgress,
                          width: `${performer.completion}%`,
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity">
              <div style={styles.timeline}>
                {safePerformance.recentActivity.length === 0 ? (
                  <p style={styles.emptyState}>No activity yet.</p>
                ) : (
                  safePerformance.recentActivity.map((activity, index) => (
                    <div key={index} style={styles.timelineItem}>
                      <div
                        style={{
                          ...styles.timelineDot,
                          background:
                            activity.status === 'approved'
                              ? '#4caf50'
                              : activity.status === 'rejected'
                              ? '#f44336'
                              : '#ff9800',
                        }}
                      />
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>
                          {activity.studentName}
                          <span style={styles.statusBadge}>
                            {activity.status === 'approved' && '✓ Approved'}
                            {activity.status === 'rejected' && '✗ Rejected'}
                            {activity.status === 'pending' && '⏳ Pending'}
                          </span>
                        </div>
                        <div style={styles.timelineDesc}>{activity.documentType}</div>
                        <div style={styles.timelineDate}>
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Insights & Recommendations */}
            <Card title="Insights & Recommendations">
              <div style={styles.insightsContainer}>
                <div style={styles.insightItem}>
                  <span style={styles.insightIcon}>💡</span>
                  <div>
                    <div style={styles.insightTitle}>High Approval Rate</div>
                    <div style={styles.insightDesc}>
                      {safePerformance.approvalRate >= 80
                        ? 'Your students are doing great! Keep maintaining quality.'
                        : safePerformance.approvalRate >= 60
                        ? 'Good approval rate. Continue supporting students with document quality.'
                        : 'Work with students on improving document quality to increase approval rates.'}
                    </div>
                  </div>
                </div>
                <div style={styles.insightItem}>
                  <span style={styles.insightIcon}>🎯</span>
                  <div>
                    <div style={styles.insightTitle}>Student Progress</div>
                    <div style={styles.insightDesc}>
                      {safePerformance.averageCompletion >= 80
                        ? 'Students are highly engaged with strong progress across the board.'
                        : safePerformance.averageCompletion >= 60
                        ? 'Students are making good progress. Encourage those lagging behind.'
                        : 'Consider reviewing with students who need support in completing their profiles.'}
                    </div>
                  </div>
                </div>
                <div style={styles.insightItem}>
                  <span style={styles.insightIcon}>📈</span>
                  <div>
                    <div style={styles.insightTitle}>Engagement Metrics</div>
                    <div style={styles.insightDesc}>
                      {safePerformance.totalStudents > 0
                        ? `You have ${safePerformance.totalStudents} students with ${safePerformance.metrics[0]?.value || 0} total documents submitted.`
                        : 'No students or submissions yet. Start by adding students to your class.'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  errorText: {
    fontSize: '16px',
    color: '#f44336',
    marginBottom: '8px',
  },
  errorHint: {
    fontSize: '14px',
    color: 'var(--muted)',
    margin: 0,
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
  overallContainer: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  circularProgressWrapper: {
    display: 'flex',
    justifyContent: 'center',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    margin: '24px 0',
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
  },
  metricIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  topPerformersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  performerItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: 'var(--bg)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  performerProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'rgba(47, 128, 237, 0.1)',
    transition: 'width 0.5s ease',
    zIndex: 0,
  },
  performerRank: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
    zIndex: 1,
  },
  performerInfo: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  performerName: {
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  performerStats: {
    fontSize: '13px',
    color: 'var(--muted)',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'var(--bg)',
    marginLeft: 'auto',
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
  insightsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  insightItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  insightTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  insightDesc: {
    fontSize: '14px',
    color: 'var(--muted)',
    lineHeight: '1.5',
  },
};

export default PerformancePage;
