import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService, notificationService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

export const TeacherMessagingPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    recipientType: 'individual',
    recipientId: '',
    title: '',
    message: '',
    type: 'message',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Try getAssignedStudents first (teacher-specific), then fall back to getStudents
      let response;
      try {
        response = await userService.getAssignedStudents();
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('getAssignedStudents failed with 403, trying getStudents');
          response = await userService.getStudents({ limit: 100 });
        } else {
          throw error;
        }
      }
      
      // Handle multiple response formats
      let studentsData = [];
      if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else {
        studentsData = response.data?.students || response.data?.data || [];
      }
      
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({
        type: 'error',
        text: `Failed to load students. ${error.response?.status === 403 ? 'Ensure you are logged in as a teacher.' : 'Please try refreshing the page.'}`,
      });
      setStudents([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (formData.recipientType === 'individual' && !formData.recipientId) {
      setMessage({ type: 'error', text: 'Please select a recipient' });
      return;
    }

    setSending(true);
    setMessage({ type: '', text: '' });

    try {
      const announcementData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (formData.recipientType === 'individual') {
        // Send to individual student
        announcementData.recipientId = formData.recipientId;
      }

      const response = await notificationService.sendAnnouncement(announcementData);
      
      if (response || response.success) {
        setMessage({ 
          type: 'success', 
          text: formData.recipientType === 'all' 
            ? `Announcement sent to all students!` 
            : 'Message sent successfully!' 
        });

        // Reset form
        setFormData({
          recipientType: 'individual',
          recipientId: '',
          title: '',
          message: '',
          type: 'message',
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Send Message</h1>
          <p style={styles.subtitle}>Send messages and announcements to your students</p>
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

        <div style={styles.gridContainer}>
          {/* Message Form */}
          <Card title="Compose Message">
            <form onSubmit={handleSendMessage} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Recipient Type *</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="recipientType"
                      value="individual"
                      checked={formData.recipientType === 'individual'}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                    <span>Individual Student</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="recipientType"
                      value="all"
                      checked={formData.recipientType === 'all'}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                    <span>All Students</span>
                  </label>
                </div>
              </div>

              {formData.recipientType === 'individual' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Student *</label>
                  <select
                    name="recipientId"
                    value={formData.recipientId}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Message Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="message">General Message</option>
                  <option value="announcement">Announcement</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subject *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter message subject..."
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  style={styles.textarea}
                  rows="6"
                  required
                />
              </div>

              <button type="submit" disabled={sending} style={styles.sendBtn}>
                {sending ? '📤 Sending...' : '📤 Send Message'}
              </button>
            </form>
          </Card>

          {/* Preview */}
          <Card title="Message Preview">
            <div style={styles.preview}>
              {formData.title || formData.message ? (
                <>
                  <div style={styles.previewHeader}>
                    <div style={styles.previewIcon}>
                      {formData.type === 'announcement'
                        ? '📢'
                        : formData.type === 'reminder'
                        ? '⏰'
                        : '💬'}
                    </div>
                    <div style={styles.previewBadge}>
                      {formData.type === 'announcement'
                        ? 'ANNOUNCEMENT'
                        : formData.type === 'reminder'
                        ? 'REMINDER'
                        : 'MESSAGE'}
                    </div>
                  </div>
                  <div style={styles.previewTitle}>
                    {formData.title || 'Message subject will appear here...'}
                  </div>
                  <div style={styles.previewMessage}>
                    {formData.message || 'Message content will appear here...'}
                  </div>
                  <div style={styles.previewFooter}>
                    <div>From: {user?.name}</div>
                    <div>To: {formData.recipientType === 'all' ? 'All Students' : formData.recipientId ? students.find(s => s._id === formData.recipientId)?.name : 'Select student'}</div>
                  </div>
                </>
              ) : (
                <div style={styles.emptyPreview}>
                  <span style={{ fontSize: '48px', marginBottom: '16px' }}>📝</span>
                  <p>Start typing to see preview</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Templates */}
        <Card title="Quick Templates">
          <div style={styles.templates}>
            <div
              style={styles.templateCard}
              onClick={() =>
                setFormData({
                  ...formData,
                  title: 'Assignment Reminder',
                  message: 'This is a reminder to submit your pending assignments by the due date.',
                  type: 'reminder',
                })
              }
            >
              <div style={styles.templateIcon}>⏰</div>
              <div style={styles.templateName}>Assignment Reminder</div>
            </div>
            <div
              style={styles.templateCard}
              onClick={() =>
                setFormData({
                  ...formData,
                  title: 'Document Approval Update',
                  message: 'Your submitted document has been reviewed. Please check the status.',
                  type: 'message',
                })
              }
            >
              <div style={styles.templateIcon}>📄</div>
              <div style={styles.templateName}>Document Update</div>
            </div>
            <div
              style={styles.templateCard}
              onClick={() =>
                setFormData({
                  ...formData,
                  title: 'Class Announcement',
                  message: 'Important announcement regarding upcoming class schedule.',
                  type: 'announcement',
                })
              }
            >
              <div style={styles.templateIcon}>📢</div>
              <div style={styles.templateName}>Class Announcement</div>
            </div>
            <div
              style={styles.templateCard}
              onClick={() =>
                setFormData({
                  ...formData,
                  title: 'Resume Feedback',
                  message: 'I have reviewed your resume. Please check the feedback and make necessary updates.',
                  type: 'message',
                })
              }
            >
              <div style={styles.templateIcon}>📝</div>
              <div style={styles.templateName}>Resume Feedback</div>
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
  message: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  radio: {
    cursor: 'pointer',
  },
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid var(--border)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid var(--border)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid var(--border)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  sendBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2f80ed, #63a4ff)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(47, 128, 237, 0.3)',
  },
  preview: {
    padding: '20px',
    background: 'var(--bg)',
    borderRadius: '12px',
    minHeight: '300px',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  previewIcon: {
    fontSize: '32px',
  },
  previewBadge: {
    padding: '4px 12px',
    background: 'var(--primary)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '12px',
  },
  previewMessage: {
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  previewFooter: {
    paddingTop: '16px',
    borderTop: '2px solid var(--border)',
    fontSize: '13px',
    color: 'var(--muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  emptyPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '250px',
    color: 'var(--muted)',
  },
  templates: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
  },
  templateCard: {
    padding: '20px',
    background: 'var(--bg)',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  templateIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  templateName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
};
