import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentNumber: '',
    division: '',
    batchNumber: '',
    cgpa: '',
    department: '',
    subject: '',
    experience: '',
    qualification: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First check if user exists in context
        if (user) {
          setCurrentUser(user);
          populateForm(user);
          setLoading(false);
        } else {
          // Try to get user from API
          const response = await authService.getCurrentUser();
          const userData = response.data.user;
          setCurrentUser(userData);
          updateUser(userData);
          populateForm(userData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, updateUser]);

  const populateForm = (userData) => {
    // Parse batch into division and batchNumber (e.g., "A1" -> division: "A", batchNumber: "1")
    const batch = userData.studentDetails?.batch || '';
    const studentDivision = batch.match(/^[A-Za-z]+/)?.[0] || '';
    const studentBatchNumber = batch.match(/\d+$/)?.[0] || '';
    const teacherDivision = userData.teacherDetails?.division || '';
    const resolvedDivision = userData.role === 'teacher' ? teacherDivision : studentDivision;
    const resolvedBatchNumber = userData.role === 'student' ? studentBatchNumber : '';

    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      enrollmentNumber: userData.studentDetails?.enrollmentNumber || '',
      division: resolvedDivision,
      batchNumber: resolvedBatchNumber,
      cgpa: userData.studentDetails?.cgpa || '',
      department: userData.department || userData.hodDetails?.assignedDepartments?.[0] || '',
      subject: userData.teacherDetails?.subject || '',
      experience: userData.teacherDetails?.experience || '',
      qualification: userData.teacherDetails?.qualification || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await authService.uploadProfilePhoto(formDataUpload);
      console.log('Upload response:', response.data);
      
      const updatedUser = response.data.user;
      const userWithImage = {
        ...updatedUser,
        profileImage: updatedUser.profileImage || updatedUser.profilePhoto,
      };
      
      setCurrentUser(userWithImage);
      updateUser(userWithImage);
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload photo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      // Add role-specific fields
      if (currentUser?.role === 'student') {
        updateData.studentDetails = {
          enrollmentNumber: formData.enrollmentNumber,
          batch: `${formData.division}${formData.batchNumber}`, // Combine division and batch number
          cgpa: parseFloat(formData.cgpa) || 0,
        };
      } else if (currentUser?.role === 'teacher') {
        updateData.teacherDetails = {
          division: formData.division,
          subject: formData.subject,
          experience: parseInt(formData.experience) || 0,
          qualification: formData.qualification,
        };
      }

      const response = await authService.updateProfile(updateData);
      const updatedUser = response.data.user;
      setCurrentUser(updatedUser);
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      const status = error.response?.status;
      const errorText =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (status === 401 ? 'Session expired. Please log in again.' : 'Failed to update profile');
      setMessage({
        type: 'error',
        text: errorText,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading profile...</p>
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
          <h1 style={styles.title}>Profile Settings</h1>
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

        {/* Profile Picture Section */}
        <Card title="Profile Picture">
          <div style={styles.profilePictureSection}>
            <div style={styles.avatar}>
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt="Profile" style={styles.avatarImg} />
              ) : (
                <span style={styles.avatarText}>
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div style={styles.avatarInfo}>
              <h3 style={styles.userName}>{currentUser?.name || 'User'}</h3>
              <p style={styles.userRole}>
                {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'User'} • {currentUser?.email || ''}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <button
                style={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <span>📷</span> {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information">
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  style={{ ...styles.input, background: '#f5f5f5', cursor: 'not-allowed' }}
                  disabled
                />
                <span style={styles.hint}>Email cannot be changed</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+1 234 567 8900"
                />
              </div>

              {currentUser?.role === 'student' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Enrollment Number</label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., 2024CS001"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Division</label>
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="">Select Division</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Batch Number</label>
                    <input
                      type="number"
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleChange}
                      style={styles.input}
                      min="1"
                      max="99"
                      placeholder="e.g., 1"
                    />
                    <span style={styles.hint}>Batch will be: {formData.division}{formData.batchNumber}</span>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>CGPA</label>
                    <input
                      type="number"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      style={styles.input}
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g., 8.5"
                    />
                  </div>
                </>
              )}

              {currentUser?.role === 'teacher' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Division</label>
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="">Select Division</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      style={styles.input}
                      min="0"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., Ph.D. in Computer Science"
                    />
                  </div>
                </>
              )}

              {currentUser?.role === 'hod' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.saveBtn}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>

        {/* Privacy & Security */}
        {/* Removed section */}

        {/* Preferences */}
        {/* Removed section */}
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
  message: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
  },
  profilePictureSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2f80ed, #63a4ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700',
    color: 'white',
  },
  avatarText: {
    userSelect: 'none',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 8px 0',
  },
  userRole: {
    fontSize: '14px',
    color: 'var(--muted)',
    margin: '0 0 16px 0',
  },
  uploadBtn: {
    padding: '10px 20px',
    background: 'var(--bg)',
    border: '2px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
    cursor: 'not-allowed',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    marginTop: '8px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid var(--border)',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  formActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #2f80ed, #63a4ff)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(47, 128, 237, 0.2)',
  },
  settingsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '12px',
  },
  settingTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  settingDesc: {
    fontSize: '14px',
    color: 'var(--muted)',
  },
  badge: {
    padding: '6px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
};
