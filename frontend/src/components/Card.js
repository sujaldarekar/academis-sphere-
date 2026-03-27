import React from 'react';

const Card = ({
  children,
  title,
  actions,
  style,
  headerStyle,
  titleStyle,
  actionsStyle,
  contentStyle,
}) => {
  return (
    <div style={{ ...styles.card, ...style }}>
      {title && (
        <div style={{ ...styles.header, ...headerStyle }}>
          <h3 style={{ ...styles.title, ...titleStyle }}>{title}</h3>
          {actions && <div style={{ ...styles.actions, ...actionsStyle }}>{actions}</div>}
        </div>
      )}
      <div style={{ ...styles.content, ...contentStyle }}>{children}</div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    marginBottom: '15px',
  },
  header: {
    padding: '15px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '16px',
    margin: 0,
    color: 'var(--text)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  content: {
    padding: '15px',
  },
};

export default Card;
