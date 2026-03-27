import React, { useState, useEffect } from 'react';
import { documentService, resumeService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { Table } from '../components/Table';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('certificate');
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, typeFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        status: filter === 'all' ? undefined : filter,
      };
      if (typeFilter !== 'all') {
        params.documentType = typeFilter;
      }
      const response = await documentService.getMyDocuments(params);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('title', title);

    try {
      await documentService.uploadDocument(formData);
      setFile(null);
      setTitle('');
      setDocumentType('certificate');
      fetchDocuments();
      alert('Document uploaded successfully');
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddToResume = async (doc) => {
    if (doc.status !== 'approved') {
      alert('Only approved documents can be added to resume');
      return;
    }

    try {
      const newCertification = {
        title: doc.title,
        issuer: doc.description || 'Uploaded Document',
        credentialUrl: doc.fileUrl,
        issueDate: new Date(doc.createdAt),
      };

      const resumeResponse = await resumeService.getMyResume();
      const updatedCertifications = [
        ...(resumeResponse.data?.sections?.certifications || []),
        newCertification,
      ];

      await resumeService.updateSection('certifications', {
        content: updatedCertifications,
      });

      alert(`"${doc.title}" added to resume successfully!`);
    } catch (error) {
      alert('Error adding to resume: ' + error.message);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'documentType', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusColors = {
          pending: '#ff9800',
          approved: '#4caf50',
          rejected: '#f44336',
        };
        return (
          <span style={{ color: statusColors[row.status] }}>
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Uploaded',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={styles.actionButtons}>
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.viewBtn}
          >
            View
          </a>
          {row.status === 'approved' && (
            <button
              onClick={() => handleAddToResume(row)}
              style={styles.addResumeBtn}
              title="Add to Resume"
            >
              +Resume
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1>My Documents</h1>
        </div>

        <Card title="Upload Document">
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder="Document title"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={styles.input}
              >
                <option value="resume">Resume</option>
                <option value="certificate">Certificate</option>
                <option value="transcript">Transcript</option>
                <option value="project-report">Project Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>File (PDF, PPT, Image)</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.input}
                accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </Card>

        <Card title="Your Documents">
          <div style={styles.filterSection}>
            <div>
              <p style={styles.filterLabel}>Status:</p>
              <div style={styles.filterButtons}>
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    style={{
                      ...styles.filterBtn,
                      backgroundColor: filter === status ? '#007bff' : '#f0f0f0',
                      color: filter === status ? 'white' : '#333',
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={styles.filterLabel}>Type:</p>
              <div style={styles.filterButtons}>
                {['all', 'resume', 'certificate', 'transcript', 'project-report', 'other'].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      style={{
                        ...styles.filterBtn,
                        backgroundColor: typeFilter === type ? '#28a745' : '#f0f0f0',
                        color: typeFilter === type ? 'white' : '#333',
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <Table columns={columns} data={documents} loading={loading} />
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
    marginBottom: '30px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    alignItems: 'end',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    marginBottom: '5px',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterSection: {
    marginBottom: '20px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  filterBtn: {
    padding: '8px 15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  actionButtons: {
    display: 'flex',
    gap: '6px',
  },
  viewBtn: {
    padding: '4px 10px',
    backgroundColor: '#17a2b8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
  },
  addResumeBtn: {
    padding: '4px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
