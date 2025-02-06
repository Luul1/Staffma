import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeaveManagement from './LeaveManagement';
import BankDetails from './BankDetails';

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No employee ID provided');
      setLoading(false);
      return;
    }
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employee details');
      }

      const data = await response.json();
      setEmployee({
        ...data,
        documents: data.documents || {
          nationalId: null,
          offerLetter: null,
          kraPin: null,
          nssfCard: null,
          nhifCard: null
        }
      });
    } catch (error) {
      console.error('Error in fetchEmployeeDetails:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileType, file) => {
    try {
      const formData = new FormData();
      formData.append(fileType, file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/employees/${id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload document');
      
      const data = await response.json();
      setEmployee(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [fileType]: data.documentUrl
        }
      }));
    } catch (error) {
      console.error('Document upload error:', error);
      alert('Failed to upload document');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedEmployee)
      });

      if (!response.ok) throw new Error('Failed to update employee');
      
      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update employee details');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading employee details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/employees')} 
            style={styles.backButton}
          >
            Back to Employees List
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>Employee not found</p>
          <button 
            onClick={() => navigate('/employees')} 
            style={styles.backButton}
          >
            Back to Employees List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => navigate('/employees')} 
            style={styles.backButton}
          >
            ← Back to Employees List
          </button>
          <h1 style={styles.title}>
            {employee.firstName} {employee.lastName}
          </h1>
        </div>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'personal' && styles.activeTab)}}
          onClick={() => setActiveTab('personal')}
        >
          Personal Information
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'performance' && styles.activeTab)}}
          onClick={() => setActiveTab('performance')}
        >
          Performance Reviews
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'payroll' && styles.activeTab)}}
          onClick={() => setActiveTab('payroll')}
        >
          Payroll History
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'leave' && styles.activeTab)}}
          onClick={() => setActiveTab('leave')}
        >
          Leave Management
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'bank' && styles.activeTab)}}
          onClick={() => setActiveTab('bank')}
        >
          Bank Details
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'personal' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.subtitle}>Personal Information</h2>
              {!isEditing ? (
                <button 
                  onClick={() => {
                    setEditedEmployee({...employee});
                    setIsEditing(true);
                  }}
                  style={styles.editButton}
                >
                  Edit Details
                </button>
              ) : (
                <div style={styles.editButtons}>
                  <button 
                    onClick={handleSaveChanges}
                    style={styles.saveButton}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={styles.detailsGrid}>
              {isEditing ? (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Employee Number</label>
                    <input
                      style={{...styles.input, backgroundColor: '#f5f6fa'}}
                      value={editedEmployee.employeeNumber}
                      disabled
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>First Name</label>
                    <input
                      style={styles.input}
                      value={editedEmployee.firstName}
                      onChange={(e) => setEditedEmployee({
                        ...editedEmployee,
                        firstName: e.target.value
                      })}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      style={styles.input}
                      value={editedEmployee.lastName}
                      onChange={(e) => setEditedEmployee({
                        ...editedEmployee,
                        lastName: e.target.value
                      })}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Employment Type</label>
                    <select
                      style={styles.input}
                      value={editedEmployee.employmentType}
                      onChange={(e) => setEditedEmployee({
                        ...editedEmployee,
                        employmentType: e.target.value
                      })}
                    >
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="probation">Probation</option>
                      <option value="attachment">Attachment</option>
                    </select>
                  </div>
                  {editedEmployee.employmentType === 'contract' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Contract End Date</label>
                      <input
                        type="date"
                        style={styles.input}
                        value={editedEmployee.endDate}
                        onChange={(e) => setEditedEmployee({
                          ...editedEmployee,
                          endDate: e.target.value
                        })}
                      />
                    </div>
                  )}
                  {/* Add more editable fields */}
                </>
              ) : (
                <>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Employee Number</span>
                    <span style={styles.value}>{employee.employeeNumber}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Full Name</span>
                    <span style={styles.value}>{`${employee.firstName} ${employee.lastName}`}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Employment Type</span>
                    <span style={styles.value}>{employee.employmentType}</span>
                  </div>
                  {/* Display other fields */}
                </>
              )}
            </div>

            <div style={styles.documentsSection}>
              <h3 style={styles.documentTitle}>Employee Documents</h3>
              <div style={styles.documentGrid}>
                {employee?.documents && Object.entries({
                  nationalId: 'National ID',
                  offerLetter: 'Offer Letter / Contract',
                  kraPin: 'KRA PIN Certificate',
                  nssfCard: 'NSSF Card',
                  nhifCard: 'NHIF Card'
                }).map(([key, label]) => (
                  <div key={key} style={styles.documentItem}>
                    <span style={styles.documentLabel}>{label}</span>
                    {employee.documents[key] ? (
                      <a 
                        href={employee.documents[key]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.viewButton}
                      >
                        View Document
                      </a>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(key, e.target.files[0])}
                        style={styles.fileInput}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div style={styles.card}>
            <h2 style={styles.subtitle}>Performance Reviews</h2>
            {employee.performanceReviews?.length > 0 ? (
              employee.performanceReviews.map(review => (
                <div key={review._id} style={styles.reviewCard}>
                  <h3>Review Date: {new Date(review.reviewDate).toLocaleDateString()}</h3>
                  <p><strong>Rating:</strong> {review.rating}/5</p>
                  <p><strong>Reviewer:</strong> {review.reviewerName}</p>
                  <p><strong>Comments:</strong> {review.comments}</p>
                </div>
              ))
            ) : (
              <p>No performance reviews available</p>
            )}
          </div>
        )}

        {activeTab === 'payroll' && (
          <div style={styles.card}>
            <h2 style={styles.subtitle}>Payroll History</h2>
            {employee.payrollHistory?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Basic Salary</th>
                    <th>Gross Pay</th>
                    <th>Net Pay</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.payrollHistory.map(payroll => (
                    <tr key={payroll._id}>
                      <td>{`${payroll.month}/${payroll.year}`}</td>
                      <td>KES {payroll.basicSalary?.toLocaleString()}</td>
                      <td>KES {payroll.grossSalary?.toLocaleString()}</td>
                      <td>KES {payroll.netSalary?.toLocaleString()}</td>
                      <td>
                        <button 
                          onClick={() => window.open(`/api/payroll/download/${payroll._id}`, '_blank')}
                          style={styles.downloadButton}
                        >
                          Download Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payroll history available</p>
            )}
          </div>
        )}

        {activeTab === 'leave' && (
          <div style={styles.card}>
            <LeaveManagement employeeId={id} />
          </div>
        )}

        {activeTab === 'bank' && (
          <div style={styles.card}>
            <BankDetails 
              employeeId={id}
              bankDetails={employee.bankDetails}
              onUpdate={(updatedBankDetails) => {
                setEmployee(prev => ({
                  ...prev,
                  bankDetails: updatedBankDetails
                }));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  title: {
    margin: 0,
    color: '#2c3e50',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f1f1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#666',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#3498db'
    }
  },
  activeTab: {
    color: '#3498db',
    borderBottom: '2px solid #3498db',
    fontWeight: '500'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    color: '#666',
    fontSize: '0.9rem',
  },
  value: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  reviewCard: {
    padding: '15px',
    borderBottom: '1px solid #eee',
    marginBottom: '15px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
  },
  downloadButton: {
    padding: '6px 12px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: '#e74c3c',
    padding: '20px',
    backgroundColor: '#ffd5d5',
    borderRadius: '8px',
    textAlign: 'center',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButtons: {
    display: 'flex',
    gap: '10px',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  documentsSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  documentTitle: {
    marginBottom: '10px',
  },
  documentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  documentItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  documentLabel: {
    fontSize: '0.9rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  fileInput: {
    padding: '0.5rem',
    border: '1px solid #dcdde1',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  employeeNumber: {
    backgroundColor: '#f5f6fa',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontWeight: '500',
    color: '#2c3e50',
  },
  disabledInput: {
    backgroundColor: '#f5f6fa',
    color: '#2c3e50',
    cursor: 'not-allowed'
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#fff'
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fde8e8',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export default EmployeeDetails; 
