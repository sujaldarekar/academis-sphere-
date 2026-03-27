import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { userService } from '../services/api';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await userService.getDepartmentAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1>Analytics</h1>
          <p style={styles.subtitle}>Department overview and placement stats</p>
        </div>

        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <div style={styles.grid}>
              <Card title="Students">
                <p style={styles.bigNumber}>{analytics?.studentCount || 0}</p>
                <p style={styles.info}>Total students</p>
              </Card>
              <Card title="Teachers">
                <p style={styles.bigNumber}>{analytics?.teacherCount || 0}</p>
                <p style={styles.info}>Faculty members</p>
              </Card>
              <Card title="Placement Readiness">
                <p style={styles.bigNumber}>{analytics?.placementReadiness || 0}%</p>
                <p style={styles.info}>Department score</p>
              </Card>
              <Card title="Pending Approvals">
                <p style={styles.bigNumber}>{analytics?.pendingApprovals || 0}</p>
                <p style={styles.info}>Documents waiting</p>
              </Card>
            </div>

            <Card title="Placement Status">
              <div style={styles.placementGrid}>
                <div style={styles.placementStat}>
                  <p style={styles.placementValue}>{analytics?.placementStats?.placed || 0}</p>
                  <p style={styles.placementLabel}>Placed</p>
                </div>
                <div style={styles.placementStat}>
                  <p style={styles.placementValue}>{analytics?.placementStats?.notPlaced || 0}</p>
                  <p style={styles.placementLabel}>Not Placed</p>
                </div>
                <div style={styles.placementStat}>
                  <p style={styles.placementValue}>{analytics?.placementStats?.pursuingHigherStudies || 0}</p>
                  <p style={styles.placementLabel}>Higher Studies</p>
                </div>
              </div>
            </Card>
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
    backgroundColor: '#fafafa',
  },
  main: {
    flex: 1,
    padding: '30px',
  },
  header: {
    marginBottom: '20px',
  },
  subtitle: {
    color: '#777',
    fontSize: '13px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  bigNumber: {
    fontSize: '36px',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  info: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
    marginTop: '10px',
  },
  placementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  placementStat: {
    textAlign: 'center',
  },
  placementValue: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  placementLabel: {
    fontSize: '13px',
    color: '#999',
    margin: 0,
    marginTop: '5px',
  },
};
