import React from 'react';

export const Table = ({ columns, data, loading, onRowClick }) => {
  return (
    <div style={styles.container}>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : data.length === 0 ? (
        <p style={styles.empty}>No data available</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              {columns.map((col) => (
                <th key={col.key} style={{ ...styles.th, width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                style={styles.bodyRow}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  headerRow: {
    backgroundColor: '#f9f9f9',
    borderBottom: '2px solid #ddd',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#555',
    borderRight: '1px solid #eee',
  },
  bodyRow: {
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px',
    color: '#666',
    borderRight: '1px solid #eee',
  },
  loading: {
    textAlign: 'center',
    padding: '30px',
    color: '#999',
  },
  empty: {
    textAlign: 'center',
    padding: '30px',
    color: '#999',
  },
};
