import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';

export const TeacherStudentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await userService.getStudents({ limit: 100 });
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDivisionFromBatch = (batch = '') => batch.match(/^[A-Za-z]+/)?.[0] || '';

  const filteredStudents = students;

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Students</h1>
          <p style={styles.subtitle}>Manage and track your assigned students</p>
        </div>

        {/* Statistics */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{filteredStudents.length}</div>
            <div style={styles.statText}>Total Students</div>
          </div>
        </div>

        {/* Students Grid */}
        <Card title={`Students (${filteredStudents.length})`}>
          {filteredStudents.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>👥</span>
              <p>No students found</p>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div style={styles.studentGrid}>
              {filteredStudents.map((student) => (
                <div key={student._id} style={styles.studentCard}>
                  <div style={styles.studentHeader}>
                    <div style={styles.avatar}>
                      {student.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div style={styles.studentBasicInfo}>
                      <div style={styles.studentName}>{student.name}</div>
                      <div style={styles.studentEmail}>{student.email}</div>
                    </div>
                  </div>

                  <div style={styles.studentDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Enrollment:</span>
                      <span style={styles.detailValue}>
                        {student.studentDetails?.enrollmentNumber || 'N/A'}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Batch:</span>
                      <span style={styles.detailValue}>{student.studentDetails?.batch || 'N/A'}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Division:</span>
                      <span style={styles.detailValue}>
                        {getDivisionFromBatch(student.studentDetails?.batch) || 'N/A'}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>CGPA:</span>
                      <span style={styles.detailValue}>
                        {student.studentDetails?.cgpa || 'N/A'}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Placement:</span>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            student.studentDetails?.placementStatus === 'Placed'
                              ? '#e8f5e9'
                              : '#fff3e0',
                          color:
                            student.studentDetails?.placementStatus === 'Placed'
                              ? '#2e7d32'
                              : '#f57c00',
                        }}
                      >
                        {student.studentDetails?.placementStatus || 'Not Placed'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.progressSection}>
                    <div style={styles.progressLabel}>Overall Progress</div>
                    <ProgressBar value={student.progress?.overallProgress || 0} max={100} />
                  </div>

                  <div style={styles.progressMetrics}>
                    <div style={styles.metric}>
                      <div style={styles.metricValue}>
                        {student.progress?.approvedDocuments || 0}/
                        {student.progress?.totalDocuments || 0}
                      </div>
                      <div style={styles.metricLabel}>Documents</div>
                    </div>
                    <div style={styles.metric}>
                      <div style={styles.metricValue}>
                        {student.progress?.resumeCompletion || 0}%
                      </div>
                      <div style={styles.metricLabel}>Resume</div>
                    </div>
                    <div style={styles.metric}>
                      <div style={styles.metricValue}>
                        {student.progress?.profileCompletion || 0}%
                      </div>
                      <div style={styles.metricLabel}>Profile</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    margin: '24px 0',
  },
  statBox: {
    padding: '24px',
    background: 'white',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--primary)',
    marginBottom: '8px',
  },
  statText: {
    fontSize: '14px',
    color: 'var(--muted)',
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '16px',
  },
  studentCard: {
    padding: '20px',
    background: 'var(--bg)',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    transition: 'all 0.2s',
  },
  studentHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2f80ed, #63a4ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  studentBasicInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  studentEmail: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  studentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: '12px',
  },
  progressLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  progressMetrics: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-around',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
  },
  metric: {
    textAlign: 'center',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  metricLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: 'var(--text)',
    textAlign: 'center',
  },
};
