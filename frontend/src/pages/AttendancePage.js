import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { attendanceService } from '../services/api';

export const AttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [classType, setClassType] = useState('lecture');

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      console.log('[AttendancePage] Fetching students for date:', selectedDate);
      const response = await attendanceService.getTeacherStudentsAttendance(selectedDate);
      console.log('[AttendancePage] Attendance API response:', response.data);
      const studentsData = response.data?.data || response.data?.students || response.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      
      // Initialize attendance state
      const initialAttendance = {};
      (Array.isArray(studentsData) ? studentsData : []).forEach((student) => {
        initialAttendance[student._id] = {
          status: student.status || 'absent',
          remarks: student.remarks || '',
          classType: student.classType || 'lecture',
        };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('[AttendancePage] API Error response:', error.response?.data);
      if (error.response?.status === 403) {
        setMessage({
          type: 'error',
          text: 'You do not have permission to mark attendance. Ensure you are logged in as a teacher.',
        });
      } else if (error.response?.status === 401) {
        setMessage({
          type: 'error',
          text: 'Authentication failed. Please log in again.',
        });
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || 'Failed to fetch students',
        });
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = {
        ...attendance[student._id],
        status,
      };
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const attendanceData = students.map((student) => ({
        studentId: student._id,
        rollNumber: student.studentDetails?.enrollmentNumber || student.rollNumber || 'N/A',
        date: selectedDate,
        status: attendance[student._id]?.status || 'absent',
        remarks: attendance[student._id]?.remarks || '',
        classType: attendance[student._id]?.classType || classType,
      }));

      console.log('Sending attendance data:', attendanceData);
      await attendanceService.markAttendance(attendanceData);
      
      setMessage({
        type: 'success',
        text: 'Attendance marked successfully!',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.response?.data?.error || 'Failed to mark attendance',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Mark Attendance</h1>
          <p style={styles.subtitle}>Mark attendance for your students by roll number</p>
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

        <Card title="Attendance Settings">
          <div style={styles.settingsGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Class Type</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                style={styles.input}
              >
                <option value="lecture">Lecture</option>
                <option value="practical">Practical</option>
                <option value="seminar">Seminar</option>
                <option value="lab">Lab</option>
              </select>
            </div>
          </div>

          <div style={styles.quickActions}>
            <button
              onClick={() => handleMarkAll('present')}
              style={{ ...styles.btn, background: '#4caf50' }}
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              style={{ ...styles.btn, background: '#f44336' }}
            >
              Mark All Absent
            </button>
          </div>
        </Card>

        {loading ? (
          <Card title="Students">
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p>Loading students...</p>
            </div>
          </Card>
        ) : students.length === 0 ? (
          <Card title="Students">
            <p style={styles.emptyState}>No students found for your department</p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card title={`Students (${students.length})`}>
              <div style={styles.studentsList}>
                {students.map((student, index) => (
                  <div key={student._id} style={styles.studentCard}>
                    <div style={styles.studentInfo}>
                      <div style={styles.studentHeader}>
                        <span style={styles.rollNumber}>Roll: {student.rollNumber}</span>
                        <span style={styles.studentName}>{student.name}</span>
                      </div>
                      <p style={styles.studentEmail}>{student.email}</p>
                    </div>

                    <div style={styles.studentControls}>
                      <select
                        value={attendance[student._id]?.status || 'absent'}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Remarks (optional)"
                        value={attendance[student._id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        style={styles.remarksInput}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </Card>
          </form>
        )}
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
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '14px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
  },
  quickActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
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
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--muted)',
  },
  studentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  studentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  studentInfo: {
    flex: 1,
    minWidth: '200px',
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
  },
  rollNumber: {
    display: 'inline-block',
    background: '#2f80ed',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  studentName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  studentEmail: {
    fontSize: '13px',
    color: 'var(--muted)',
    margin: 0,
  },
  studentControls: {
    display: 'flex',
    gap: '12px',
    minWidth: '300px',
    flexWrap: 'wrap',
  },
  statusSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    cursor: 'pointer',
    minWidth: '120px',
  },
  remarksInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    flex: 1,
    minWidth: '150px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#2f80ed',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default AttendancePage;
