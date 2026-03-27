import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { validateEmailForRole } from '../utils/validation';

export const HodLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEmailForRole(email, 'hod')) {
      alert('Only HOD emails can login here. Use student or teacher login page.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.loginHod({ email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
        <h2 style={styles.title}>HOD Login</h2>
        <p style={styles.subtitle}>Use your HOD email</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="hod@mes.ac.in"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.hint}>
          No account? <a href="/hod/register" style={styles.link}>Register</a>
        </p>
        <p style={styles.linkRow}>
          <a href="/student/login" style={styles.link}>Student Login</a> |{' '}
          <a href="/teacher/login" style={styles.link}>Teacher Login</a>
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
    marginBottom: '5px',
    fontSize: '18px',
    color: '#666',
  },
  subtitle: {
    color: '#999',
    fontSize: '12px',
    marginBottom: '30px',
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
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    marginTop: '20px',
  },
  linkRow: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    marginTop: '10px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};
