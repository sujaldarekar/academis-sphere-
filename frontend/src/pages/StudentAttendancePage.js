import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { attendanceService } from '../services/api';

export const StudentAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedMonth] = useState(
    new Date().toISOString().split('T')[0].slice(0, 7)
  );
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAttendance();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getStudentAttendance();
      const attendanceData = response.data?.data || response.data?.attendance || response.data || [];
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      
      const stats = response.data?.statistics || response.data?.stats || null;
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      if (error.response?.status === 403) {
        console.error('Forbidden: User may not be authenticated as a student');
      }
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await attendanceService.getAttendanceSummary(selectedMonth);
      const summaryData = response.data?.summary || response.data?.data || response.data || null;
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setSummary(null);
    }
  };

  const filteredAttendance =
    filterStatus === 'all'
      ? attendance
      : attendance.filter((a) => a.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#4caf50';
      case 'absent':
        return '#f44336';
      case 'late':
        return '#ff9800';
      case 'excused':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return '✓';
      case 'absent':
        return '✗';
      case 'late':
        return '⏱';
      case 'excused':
        return 'E';
      default:
        return '?';
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Attendance</h1>
          <p style={styles.subtitle}>Track your attendance records and statistics</p>
        </div>

        {/* Overall Statistics */}
        {statistics && (
          <Card title="Attendance Overview">
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div>
                  <div style={styles.statValue}>{statistics.totalClasses}</div>
                  <div style={styles.statLabel}>Total Classes</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#e8f5e9' }}>✓</div>
                <div>
                  <div style={styles.statValue}>{statistics.presentCount}</div>
                  <div style={styles.statLabel}>Present</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: '#ffebee' }}>✗</div>
                <div>
                  <div style={styles.statValue}>{statistics.absentCount}</div>
                  <div style={styles.statLabel}>Absent</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📈</div>
                <div>
                  <div style={styles.statValue}>{statistics.attendancePercentage}%</div>
                  <div style={styles.statLabel}>Attendance %</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
              <div style={styles.progressLabel}>
                <span>Overall Attendance</span>
                <span style={styles.progressValue}>{statistics.attendancePercentage}%</span>
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${statistics.attendancePercentage}%`,
                    backgroundColor: statistics.attendancePercentage >= 75 ? '#4caf50' : statistics.attendancePercentage >= 60 ? '#ff9800' : '#f44336'
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Subject-wise Summary */}
        {summary && Object.keys(summary).length > 0 && (
          <Card title="Subject-wise Attendance">
            <div style={styles.summaryGrid}>
              {Object.entries(summary).map(([subject, data]) => (
                <div key={subject} style={styles.subjectCard}>
                  <div style={styles.subjectHeader}>
                    <div style={styles.subjectName}>{subject}</div>
                    <div style={styles.subjectPercentage}>{data.percentage}%</div>
                  </div>
                  <div style={styles.subjectStats}>
                    <span>📊 {data.total} classes</span>
                    <span style={{ color: '#4caf50' }}>✓ {data.present}</span>
                    <span style={{ color: '#f44336' }}>✗ {data.absent}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${data.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Attendance Records */}
        <Card title="Attendance Records">
          <div style={styles.controls}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p>Loading attendance...</p>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <p style={styles.emptyState}>No attendance records found</p>
          ) : (
            <div style={styles.attendanceList}>
              {filteredAttendance.map((record, index) => (
                <div key={record._id || index} style={styles.recordCard}>
                  <div style={styles.recordHeader}>
                    <div
                      style={{
                        ...styles.statusBadge,
                        background: getStatusColor(record.status),
                      }}
                    >
                      {getStatusIcon(record.status)}
                    </div>
                    <div style={styles.recordInfo}>
                      <div style={styles.recordDate}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div style={styles.recordSubject}>{record.subject}</div>
                    </div>
                    <div style={styles.recordStatus}>
                      <div style={styles.status}>{record.status.toUpperCase()}</div>
                      <div style={styles.classType}>{record.classType}</div>
                    </div>
                  </div>
                  {record.remarks && (
                    <div style={styles.remarks}>Remarks: {record.remarks}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
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
    flexShrink: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  progressSection: {
    marginTop: '24px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  progressValue: {
    color: 'var(--primary)',
  },
  progressBar: {
    height: '8px',
    background: 'var(--border)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2f80ed, #63a4ff)',
    transition: 'width 0.5s ease',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  subjectCard: {
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
  },
  subjectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  subjectName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subjectPercentage: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  subjectStats: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--muted)',
    marginBottom: '8px',
  },
  controls: {
    marginBottom: '24px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
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
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--muted)',
  },
  attendanceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recordCard: {
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  recordHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statusBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  recordSubject: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  recordStatus: {
    textAlign: 'right',
  },
  status: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  classType: {
    fontSize: '11px',
    color: 'var(--muted)',
    marginTop: '2px',
  },
  remarks: {
    marginTop: '12px',
    fontSize: '13px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
};

export default StudentAttendancePage;
