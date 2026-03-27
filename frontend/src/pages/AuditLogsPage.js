import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { Table } from '../components/Table';
import { auditService } from '../services/api';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  useEffect(() => {
    fetchLogs();
  }, [action, resourceType, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAuditLogs({ action, resourceType, page, limit: 10 });
      setLogs(response.data?.logs || []);
      setPagination(response.data?.pagination || { total: 0, pages: 1, currentPage: 1 });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      label: 'Time',
      key: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      label: 'User',
      key: 'user',
      render: (row) => row.userId?.name || 'System',
    },
    {
      label: 'Action',
      key: 'action',
    },
    {
      label: 'Resource',
      key: 'resourceType',
      render: (row) => row.resourceType || 'N/A',
    },
    {
      label: 'Description',
      key: 'description',
      render: (row) => row.description || '—',
    },
    {
      label: 'Target',
      key: 'targetUserId',
      render: (row) => row.targetUserId?.name || '—',
    },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1>Audit Logs</h1>
            <p style={styles.subtitle}>Track system activity and changes</p>
          </div>
        </div>

        <Card>
          <div style={styles.filters}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Action</label>
              <input
                type="text"
                value={action}
                onChange={(e) => {
                  setPage(1);
                  setAction(e.target.value);
                }}
                placeholder="e.g., user-updated"
                style={styles.input}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Resource Type</label>
              <input
                type="text"
                value={resourceType}
                onChange={(e) => {
                  setPage(1);
                  setResourceType(e.target.value);
                }}
                placeholder="e.g., Notification"
                style={styles.input}
              />
            </div>
          </div>
        </Card>

        <Card title={`Logs (${pagination.total || 0})`}>
          <Table columns={columns} data={logs} loading={loading} />
          <div style={styles.pagination}>
            <button
              style={styles.pageButton}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span style={styles.pageText}>
              Page {pagination.currentPage || page} of {pagination.pages || 1}
            </span>
            <button
              style={styles.pageButton}
              onClick={() => setPage((p) => Math.min(pagination.pages || 1, p + 1))}
              disabled={page >= (pagination.pages || 1)}
            >
              Next
            </button>
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
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  filterGroup: {
    display: 'grid',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '13px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '14px',
  },
  pageButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    background: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  pageText: {
    fontSize: '12px',
    color: '#666',
  },
};
