import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { Table } from '../components/Table';
import { userService } from '../services/api';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await userService.getTeachers();
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      key: 'name',
      render: (teacher) => (
        <div style={styles.nameCell}>
          <div style={styles.avatar}>
            {teacher.profileImage ? (
              <img src={teacher.profileImage} alt={teacher.name} style={styles.avatarImg} />
            ) : (
              <span>{teacher.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div style={styles.teacherName}>{teacher.name}</div>
            <div style={styles.teacherEmail}>{teacher.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject',
      key: 'subject',
      render: (teacher) => (
        <span style={styles.subject}>{teacher.teacherDetails?.subject || 'N/A'}</span>
      ),
    },
    {
      header: 'Division',
      key: 'division',
      render: (teacher) => (
        <span>{teacher.teacherDetails?.division || 'N/A'}</span>
      ),
    },
    {
      header: 'Experience',
      key: 'experience',
      render: (teacher) => (
        <span>{teacher.teacherDetails?.experience || 0} years</span>
      ),
    },
    {
      header: 'Qualification',
      key: 'qualification',
      render: (teacher) => (
        <span>{teacher.teacherDetails?.qualification || 'N/A'}</span>
      ),
    },
    {
      header: 'Performance',
      key: 'performance',
      render: (teacher) => (
        <div style={styles.performanceCell}>
          <div style={styles.performanceBar}>
            <div 
              style={{
                ...styles.performanceProgress,
                width: `${teacher.performanceScore || 0}%`,
                backgroundColor: teacher.performanceScore >= 80 ? '#4caf50' : teacher.performanceScore >= 60 ? '#ff9800' : '#f44336'
              }}
            />
          </div>
          <span style={styles.performanceText}>{teacher.performanceScore || 0}%</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (teacher) => (
        <span style={{
          ...styles.badge,
          backgroundColor: teacher.isActive ? '#e8f5e9' : '#ffebee',
          color: teacher.isActive ? '#2e7d32' : '#c62828'
        }}>
          {teacher.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Teachers</h1>
            <p style={styles.subtitle}>Manage teachers in your department.</p>
          </div>
        </div>

        <Card title="Teachers">
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>📚</p>
              <h3>No teachers found</h3>
              <p style={styles.emptyText}>
                No teachers in your department yet.
              </p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={teachers} />
            </>
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
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: '60px 20px',
    color: 'var(--muted)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border)',
    borderTop: '4px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--muted)',
  },
  emptyText: {
    fontSize: '14px',
    marginTop: '8px',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  teacherName: {
    fontWeight: '600',
    color: 'var(--text)',
    fontSize: '14px',
  },
  teacherEmail: {
    fontSize: '12px',
    color: 'var(--muted)',
    marginTop: '2px',
  },
  subject: {
    color: 'var(--text)',
    fontSize: '14px',
  },
  performanceCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  performanceBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--border)',
    borderRadius: '4px',
    overflow: 'hidden',
    minWidth: '80px',
  },
  performanceProgress: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  performanceText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
    minWidth: '40px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default TeachersPage;
