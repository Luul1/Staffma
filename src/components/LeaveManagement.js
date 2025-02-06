import React, { useState, useEffect } from 'react';

function LeaveManagement({ employeeId }) {
  const [leaves, setLeaves] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newLeave, setNewLeave] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: []
  });

  useEffect(() => {
    fetchLeaves();
  }, [employeeId]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/leave/employee/${employeeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch leave history');
      
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      setError('Failed to fetch leave history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/leave/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newLeave,
          employeeId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit leave request');
      }

      await fetchLeaves();
      setShowLeaveForm(false);
      setNewLeave({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        attachments: []
      });
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Leave Management</h3>
        <button 
          onClick={() => setShowLeaveForm(true)}
          style={styles.addButton}
        >
          Request Leave
        </button>
      </div>

      {showLeaveForm && (
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Leave Type:</label>
              <select
                value={newLeave.leaveType}
                onChange={(e) => setNewLeave({
                  ...newLeave,
                  leaveType: e.target.value
                })}
                required
                style={styles.select}
              >
                <option value="">Select Leave Type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="study">Study Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Start Date:</label>
              <input
                type="date"
                value={newLeave.startDate}
                onChange={(e) => setNewLeave({
                  ...newLeave,
                  startDate: e.target.value
                })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>End Date:</label>
              <input
                type="date"
                value={newLeave.endDate}
                onChange={(e) => setNewLeave({
                  ...newLeave,
                  endDate: e.target.value
                })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Reason:</label>
              <textarea
                value={newLeave.reason}
                onChange={(e) => setNewLeave({
                  ...newLeave,
                  reason: e.target.value
                })}
                required
                style={styles.textarea}
              />
            </div>

            <div style={styles.formActions}>
              <button 
                type="button" 
                onClick={() => setShowLeaveForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={styles.submitButton}
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.leaveHistory}>
        <h4>Leave History</h4>
        {loading ? (
          <div>Loading...</div>
        ) : leaves.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>
                    <span style={getStatusStyle(leave.status)}>
                      {leave.status}
                    </span>
                  </td>
                  <td>{leave.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leave history available</p>
        )}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9em'
  };

  switch (status) {
    case 'approved':
      return {
        ...baseStyle,
        backgroundColor: '#d4edda',
        color: '#155724'
      };
    case 'rejected':
      return {
        ...baseStyle,
        backgroundColor: '#f8d7da',
        color: '#721c24'
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: '#fff3cd',
        color: '#856404'
      };
  }
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem'
  },
  
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem'
  },
  
  textarea: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minHeight: '100px',
    fontSize: '0.9rem',
    resize: 'vertical'
  },
  
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px'
  },
  
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  
  leaveHistory: {
    marginTop: '30px'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  'table th, table td': {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd'
  },
  
  'table th': {
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#2c3e50'
  },
  
  error: {
    color: '#e74c3c',
    backgroundColor: '#fde8e8',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export default LeaveManagement; 