import React from 'react';

export const ProgressBar = ({ value = 0, max = 100, label }) => {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? value : 0;
  const percentage = Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);

  return (
    <div style={styles.container}>
      {label && <p style={styles.label}>{label}</p>}
      <div style={styles.bar}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
          }}
        />
      </div>
      <p style={styles.percentage}>{Math.round(percentage)}%</p>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '13px',
    marginBottom: '5px',
    color: 'var(--muted)',
    fontWeight: '600',
  },
  bar: {
    height: '20px',
    backgroundColor: 'var(--primary-soft)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2f80ed 0%, #63a4ff 100%)',
    transition: 'width 0.3s ease',
  },
  percentage: {
    fontSize: '12px',
    marginTop: '5px',
    color: 'var(--muted)',
  },
};
