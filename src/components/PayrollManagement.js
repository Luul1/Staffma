import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9em'
  };

  switch (status) {
    case 'pending':
      return {
        ...baseStyle,
        backgroundColor: '#fff3cd',
        color: '#856404'
      };
    case 'completed':
      return {
        ...baseStyle,
        backgroundColor: '#d4edda',
        color: '#155724'
      };
    case 'failed':
      return {
        ...baseStyle,
        backgroundColor: '#f8d7da',
        color: '#721c24'
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: '#e9ecef',
        color: '#6c757d'
      };
  }
};

function PayrollManagement() {
  const [employees, setEmployees] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationDate, setRegistrationDate] = useState(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [reason, setReason] = useState('');
  const [payrollProcessed, setPayrollProcessed] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isProcessed, setIsProcessed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchPayrollHistory();
    fetchBusinessDetails();
    checkPayrollStatus();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError('Failed to fetch employees');
      console.error(error);
    }
  };

  const fetchPayrollHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching payroll history with params:', {
        month: selectedMonth,
        year: selectedYear
      });

      const response = await fetch(
        `http://localhost:5001/api/payroll/history?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      
      console.log('Payroll history response:', {
        ok: response.ok,
        status: response.status,
        data
      });

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch payroll history');
      }

      setPayrollHistory(data);
      await fetchPayrollSummary();
    } catch (error) {
      console.error('Error fetching payroll history:', error);
      setError('Failed to fetch payroll history: ' + error.message);
    }
  };

  const fetchPayrollSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/payroll/summary?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch payroll summary');
      const data = await response.json();
      setPayrollSummary(data);
    } catch (error) {
      setError('Failed to fetch payroll summary');
      console.error(error);
    }
  };

  const processPayroll = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/payroll/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });

      const data = await response.json();
      setPayrollProcessed(true);
      setTransactions(data.transactions || []);
      
      // Poll transaction status for pending transactions
      const pendingTransactions = data.transactions.filter(t => t.status === 'pending');
      if (pendingTransactions.length > 0) {
        pollTransactionStatus(pendingTransactions);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to process payroll');
      }

      alert(data.message);
      await fetchPayrollHistory();
      await fetchPayrollSummary();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  const pollTransactionStatus = async (pendingTransactions) => {
    const token = localStorage.getItem('token');
    
    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/payroll/transaction/${transaction.reference}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          const { status } = await response.json();
          setTransactions(prev => 
            prev.map(t => 
              t.reference === transaction.reference 
                ? { ...t, status } 
                : t
            )
          );
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    }
  };

  const downloadPayslip = async (payrollId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/payroll/download/${payrollId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Payslip download error:', error);
      alert('Failed to download payslip: ' + error.message);
    }
  };

  const fetchBusinessDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/business', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch business details');
      
      const data = await response.json();
      setRegistrationDate(new Date(data.createdAt));
    } catch (error) {
      console.error('Error fetching business details:', error);
    }
  };

  const isValidPayrollPeriod = (month, year) => {
    if (!registrationDate) return true; // Allow if registration date not loaded yet
    
    // Special case for December 2024 (for testing)
    if (month === 12 && year === 2024) {
      return true;
    }
    
    const periodDate = new Date(year, month - 1);
    const currentDate = new Date();
    
    // Cannot process future months (except December 2024)
    if (periodDate > currentDate && !(month === 12 && year === 2024)) {
      return false;
    }
    
    // Cannot process months before registration
    if (periodDate < registrationDate) {
      return false;
    }
    
    return true;
  };

  const requestSalaryAdvance = async () => {
    try {
      if (!selectedEmployees.length) {
        alert('Please select at least one employee');
        return;
      }
      if (!advanceAmount || isNaN(advanceAmount) || advanceAmount <= 0) {
        alert('Please enter a valid advance amount');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Log the request details
      console.log('Sending request with:', {
        employeeIds: selectedEmployees,
        amount: Number(advanceAmount),
        reason: reason,
        requestDate: new Date().toISOString()
      });

      const response = await fetch('http://localhost:5001/api/payroll/advance-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          amount: Number(advanceAmount),
          reason: reason,
          requestDate: new Date().toISOString()
        })
      });

      // Log the raw response
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit advance request');
      }

      alert('Salary advance request submitted successfully!');
      setShowAdvanceModal(false);
      setSelectedEmployees([]);
      setAdvanceAmount('');
      setReason('');
    } catch (error) {
      console.error('Error requesting salary advance:', error);
      alert(error.message);
    }
  };

  const checkPayrollStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/payroll/check-processed?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      setIsProcessed(data.processed);
      
      if (data.processed) {
        const date = new Date(data.processedDate).toLocaleDateString();
        setError(`Payroll for ${selectedMonth}/${selectedYear} was already processed on ${date}`);
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error checking payroll status:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Payroll Management</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.controls}>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={styles.select}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const isValid = isValidPayrollPeriod(month, selectedYear);
            return (
              <option 
                key={month} 
                value={month}
                disabled={!isValid}
              >
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                {!isValid ? ' (Not Available)' : ''}
              </option>
            );
          })}
        </select>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={styles.select}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            const isValid = isValidPayrollPeriod(selectedMonth, year);
            return (
              <option 
                key={year} 
                value={year}
                disabled={!isValid}
              >
                {year}
                {!isValid ? ' (Not Available)' : ''}
              </option>
            );
          })}
        </select>
        
        <button 
          onClick={processPayroll} 
          disabled={loading || isProcessed}
          style={{
            ...styles.button,
            ...(loading || isProcessed ? styles.disabledButton : {})
          }}
        >
          {loading ? 'Processing...' : isProcessed ? 'Already Processed' : 'Process Payroll'}
        </button>

        <button 
          onClick={() => setShowAdvanceModal(true)}
          style={styles.advanceButton}
        >
          Request Salary Advance
        </button>
      </div>

      {showAdvanceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Request Salary Advance</h3>
            
            <div style={styles.modalContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Employees:</label>
                <div style={styles.employeeList}>
                  {employees.map(employee => (
                    <div key={employee._id} style={styles.employeeCheckbox}>
                      <input
                        type="checkbox"
                        id={employee._id}
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, employee._id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee._id));
                          }
                        }}
                      />
                      <label htmlFor={employee._id}>
                        {employee.firstName} {employee.lastName} - {employee.position}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Advance Amount (KES):</label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  style={styles.input}
                  min="1"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={styles.textarea}
                  required
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowAdvanceModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={requestSalaryAdvance}
                style={styles.submitButton}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {payrollSummary && (
        <div style={styles.summaryContainer}>
          <h3 style={styles.summaryTitle}>Payroll Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>👥</div>
              <span style={styles.cardLabel}>Total Employees</span>
              <span style={styles.cardValue}>{payrollSummary.totalEmployees}</span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>💰</div>
              <span style={styles.cardLabel}>Total Gross Salary</span>
              <span style={styles.cardValue}>KES {payrollSummary.totalGrossSalary?.toLocaleString()}</span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>💵</div>
              <span style={styles.cardLabel}>Total Net Salary</span>
              <span style={styles.cardValue}>KES {payrollSummary.totalNetSalary?.toLocaleString()}</span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>📊</div>
              <span style={styles.cardLabel}>Total PAYE</span>
              <span style={styles.cardValue}>KES {payrollSummary.totalPAYE?.toLocaleString()}</span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>🏥</div>
              <span style={styles.cardLabel}>Total NHIF</span>
              <span style={styles.cardValue}>KES {payrollSummary.totalNHIF?.toLocaleString()}</span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.cardIcon}>🏦</div>
              <span style={styles.cardLabel}>Total NSSF</span>
              <span style={styles.cardValue}>KES {payrollSummary.totalNSSF?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        {payrollHistory.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Employee</th>
                <th style={styles.tableHeader}>Position</th>
                <th style={styles.tableHeader}>Department</th>
                <th style={styles.tableHeader}>Basic Salary</th>
                <th style={styles.tableHeader}>Gross Salary</th>
                <th style={styles.tableHeader}>PAYE</th>
                <th style={styles.tableHeader}>NHIF</th>
                <th style={styles.tableHeader}>NSSF</th>
                <th style={styles.tableHeader}>Net Salary</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.map((record) => (
                <tr key={record._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {record.employeeId?.firstName} {record.employeeId?.lastName}
                  </td>
                  <td style={styles.tableCell}>{record.employeeId?.position}</td>
                  <td style={styles.tableCell}>{record.employeeId?.department}</td>
                  <td style={styles.tableCell}>KES {record.basicSalary?.toLocaleString()}</td>
                  <td style={styles.tableCell}>KES {record.grossSalary?.toLocaleString()}</td>
                  <td style={styles.tableCell}>KES {record.deductions?.paye?.toLocaleString()}</td>
                  <td style={styles.tableCell}>KES {record.deductions?.nhif?.toLocaleString()}</td>
                  <td style={styles.tableCell}>KES {record.deductions?.nssf?.toLocaleString()}</td>
                  <td style={styles.tableCell}>KES {record.netSalary?.toLocaleString()}</td>
                  <td style={styles.tableCell}>
                    <button 
                      onClick={() => downloadPayslip(record._id)}
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
          <div style={styles.noData}>
            No payroll records found for {new Date(2000, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
          </div>
        )}
      </div>

      {payrollProcessed && transactions.length > 0 && (
        <div style={styles.transactionSection}>
          <h3>Salary Disbursement Status</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.reference}>
                  <td>{transaction.employeeId}</td>
                  <td>KES {transaction.amount.toLocaleString()}</td>
                  <td>
                    <span style={getStatusStyle(transaction.status)}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '20px',
    color: '#2c3e50',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '10px',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  cardLabel: {
    color: '#6c757d',
    fontSize: '0.9rem',
    marginBottom: '5px',
    textAlign: 'center',
  },
  cardValue: {
    color: '#2c3e50',
    fontSize: '1.2rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    padding: '15px',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: '600',
    borderBottom: '2px solid #dee2e6',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  tableCell: {
    padding: '15px',
    color: '#2c3e50',
    fontSize: '0.9rem',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  downloadButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  noData: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6c757d',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  advanceButton: {
    padding: '8px 16px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    marginBottom: '20px',
    color: '#2c3e50',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  modalContent: {
    marginBottom: '20px',
  },
  employeeList: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
  },
  employeeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 0',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '5px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  transactionSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: '20px',
  }
};

export default PayrollManagement; 