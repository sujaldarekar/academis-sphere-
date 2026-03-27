import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { validateEmailForRole } from '../utils/validation';

export const StudentRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEmailForRole(formData.email, 'student')) {
      setError('Invalid email domain for student');
      setLoading(false);
      return;
    }

    try {
      await authService.registerStudent({ ...formData, role: 'student' });
      navigate('/student/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <div style={styles.header}>
          <img src="/logo.png" alt="Academia Sphere" style={styles.logo} />
          <h1 style={styles.brandName}>Academia Sphere</h1>
        </div>
        <h2 style={styles.title}>Student Register</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your full name"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="student@student.mes.ac.in"
              required
            />
            <small style={styles.hint}>Students: @student.mes.ac.in</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Department</option>
              <option value="CS">Computer Science</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.hint2}>
          Already have an account? <a href="/student/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  formBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logo: {
    height: '48px',
    marginRight: '15px',
  },
  brandName: {
    margin: '0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#333',
  },
  title: {
    marginTop: 0,
    marginBottom: '30px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid #ef5350',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    marginBottom: '5px',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  hint: {
    fontSize: '11px',
    color: '#999',
    marginTop: '3px',
    display: 'block',
  },
  hint2: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    marginTop: '20px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};
