import React, { useState, useEffect } from 'react';
import { documentService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

export const TeacherApprovalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentService.getPendingDocuments();
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId) => {
    setActionLoading(docId);
    setMessage({ type: '', text: '' });
    try {
      await documentService.approveDocument(docId, remarks);
      setMessage({ type: 'success', text: 'Document approved successfully!' });
      setSelectedDoc(null);
      setRemarks('');
      fetchDocuments();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve document',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (docId) => {
    if (!remarks.trim()) {
      setMessage({ type: 'error', text: 'Please provide remarks for rejection' });
      alert('Remarks are required for rejection. Please provide your feedback.');
      return;
    }
    setActionLoading(docId);
    setMessage({ type: '', text: '' });
    try {
      await documentService.rejectDocument(docId, remarks);
      setMessage({ type: 'success', text: 'Document rejected successfully!' });
      setSelectedDoc(null);
      setRemarks('');
      fetchDocuments();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject document',
      });
      console.error('Reject error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading documents...</p>
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
          <h1 style={styles.title}>Document Approvals</h1>
          <p style={styles.subtitle}>Review and approve student documents</p>
        </div>

        {message.text && (
          <div
            style={{
              ...styles.message,
              background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: message.type === 'success' ? '#2e7d32' : '#c62828',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Statistics */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>{documents.length}</div>
            <div style={styles.statText}>Total Pending</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNumber}>
              {documents.filter((d) => d.documentType === 'certificate').length}
            </div>
            <div style={styles.statText}>Certificates</div>
          </div>
        </div>

        {/* Documents List */}
        <Card title={`Pending Documents (${filteredDocuments.length})`}>
          {filteredDocuments.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>✅</span>
              <p>No pending approvals</p>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                All documents have been reviewed. Great job!
              </p>
            </div>
          ) : (
            <div style={styles.documentList}>
              {filteredDocuments.map((doc) => (
                <div key={doc._id} style={styles.documentCard}>
                  <div style={styles.docHeader}>
                    <div style={styles.docIcon}>📄</div>
                    <div style={styles.docMainInfo}>
                      <div style={styles.docFileName}>{doc.fileName}</div>
                      <div style={styles.docMeta}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            background:
                              doc.documentType === 'certificate'
                                ? '#e3f2fd'
                                : doc.documentType === 'transcript'
                                ? '#f3e5f5'
                                : '#fff3e0',
                            color:
                              doc.documentType === 'certificate'
                                ? '#1976d2'
                                : doc.documentType === 'transcript'
                                ? '#7b1fa2'
                                : '#f57c00',
                          }}
                        >
                          {doc.documentType}
                        </span>
                        <span style={styles.separator}>•</span>
                        <span>Uploaded by {doc.studentId?.name || 'Student'}</span>
                        <span style={styles.separator}>•</span>
                        <span>
                          {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedDoc === doc._id ? (
                    <div style={styles.reviewSection}>
                      <div style={styles.remarksSection}>
                        <label style={styles.remarksLabel}>Remarks (Optional for approval, Required for rejection):</label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Add your feedback here..."
                          style={styles.textarea}
                          rows="3"
                        />
                      </div>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleApprove(doc._id)}
                          disabled={actionLoading === doc._id}
                          style={styles.approveBtn}
                        >
                          {actionLoading === doc._id ? 'Approving...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(doc._id)}
                          disabled={actionLoading === doc._id}
                          style={styles.rejectBtn}
                        >
                          {actionLoading === doc._id ? 'Rejecting...' : '✕ Reject'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoc(null);
                            setRemarks('');
                          }}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.docActions}>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.viewLink}
                      >
                        👁️ View Document
                      </a>
                      <button
                        onClick={() => setSelectedDoc(doc._id)}
                        style={styles.reviewBtn}
                      >
                        Review
                      </button>
                    </div>
                  )}
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
  message: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statBox: {
    padding: '24px',
    background: 'white',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    textAlign: 'center',
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
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  documentCard: {
    padding: '20px',
    background: 'var(--bg)',
    borderRadius: '12px',
    border: '2px solid var(--border)',
  },
  docHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  docIcon: {
    fontSize: '32px',
  },
  docMainInfo: {
    flex: 1,
  },
  docFileName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  docMeta: {
    fontSize: '13px',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  typeBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  separator: {
    color: 'var(--muted)',
  },
  docActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  viewLink: {
    padding: '10px 20px',
    background: 'white',
    border: '2px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--primary)',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  reviewBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #2f80ed, #63a4ff)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  reviewSection: {
    marginTop: '16px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
  },
  remarksSection: {
    marginBottom: '16px',
  },
  remarksLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid var(--border)',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  approveBtn: {
    padding: '10px 24px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectBtn: {
    padding: '10px 24px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: 'white',
    border: '2px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
