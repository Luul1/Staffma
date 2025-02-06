import React, { useState } from 'react';

function BankDetails({ employeeId, bankDetails, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(bankDetails || {
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    swiftCode: '',
    bankCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/employees/${employeeId}/bank-details`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bankDetails: formData })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update bank details');
      }

      const data = await response.json();
      onUpdate(data.bankDetails);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating bank details:', error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Bank Account Details</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            style={styles.editButton}
          >
            Edit Bank Details
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Bank Name:</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Account Name:</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Account Number:</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Branch Name:</label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>SWIFT Code:</label>
              <input
                type="text"
                value={formData.swiftCode}
                onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Bank Code:</label>
              <input
                type="text"
                value={formData.bankCode}
                onChange={(e) => setFormData({...formData, bankCode: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={styles.saveButton}
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.label}>Bank Name</span>
            <span style={styles.value}>{bankDetails?.bankName || 'Not provided'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Account Name</span>
            <span style={styles.value}>{bankDetails?.accountName || 'Not provided'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Account Number</span>
            <span style={styles.value}>{bankDetails?.accountNumber || 'Not provided'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Branch Name</span>
            <span style={styles.value}>{bankDetails?.branchName || 'Not provided'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>SWIFT Code</span>
            <span style={styles.value}>{bankDetails?.swiftCode || 'Not provided'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Bank Code</span>
            <span style={styles.value}>{bankDetails?.bankCode || 'Not provided'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    color: '#666',
    fontSize: '0.9rem'
  },
  value: {
    color: '#2c3e50',
    fontSize: '1rem',
    fontWeight: '500'
  }
};

export default BankDetails; 