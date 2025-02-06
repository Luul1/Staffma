import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    applicantName: '',
    applicantRole: '',
    businessAddress: '',
    contactNumber: '',
    kycDocuments: {
      companyPin: null,
      cr12: null,
      businessCertificate: null
    }
  });

  const [fileNames, setFileNames] = useState({
    companyPin: '',
    cr12: '',
    businessCertificate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.businessName || !formData.email || !formData.password) {
        console.log('Missing required fields:', {
          businessName: !formData.businessName,
          email: !formData.email,
          password: !formData.password
        });
        setError('Business name, email and password are required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Create request body
      const registrationData = {
        businessName: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        businessType: formData.businessType || 'sole',
        applicantName: formData.applicantName.trim(),
        applicantRole: formData.applicantRole.trim(),
        businessAddress: formData.businessAddress.trim(),
        contactNumber: formData.contactNumber.trim()
      };

      console.log('Attempting registration with data:', {
        ...registrationData,
        password: '[HIDDEN]'
      });

      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registration failed');
      }

      // Registration successful
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      kycDocuments: {
        ...prev.kycDocuments,
        [documentType]: file
      }
    }));
    setFileNames(prev => ({
      ...prev,
      [documentType]: file ? file.name : ''
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Create Business Account</h2>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Business Details Section */}
          <div style={styles.formSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Business Name</label>
              <input
                style={styles.input}
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Business Type</label>
              <select
                style={styles.select}
                value={formData.businessType}
                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                required
              >
                <option value="">Select Type</option>
                <option value="limited">Limited Company</option>
                <option value="sole">Sole Proprietorship</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Business Address</label>
              <input
                style={styles.input}
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Applicant Details Section */}
          <div style={styles.formSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Applicant Name</label>
              <input
                style={styles.input}
                type="text"
                value={formData.applicantName}
                onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role in Business</label>
              <input
                style={styles.input}
                type="text"
                value={formData.applicantRole}
                onChange={(e) => setFormData({...formData, applicantRole: e.target.value})}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Number</label>
              <input
                style={styles.input}
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Account Details Section */}
          <div style={styles.formSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>

          {/* KYC Documents Section */}
          <div style={styles.formSection}>
            <h3 style={styles.kycTitle}>KYC Documents</h3>
            <div style={styles.fileInputGroup}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Company PIN Certificate</label>
                <input
                  style={styles.fileInput}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'companyPin')}
                />
              </div>

              {formData.businessType === 'limited' ? (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CR12 Certificate</label>
                  <input
                    style={styles.fileInput}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'cr12')}
                  />
                </div>
              ) : (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Business Certificate</label>
                  <input
                    style={styles.fileInput}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'businessCertificate')}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="button"
              onClick={() => navigate('/')}
              style={styles.backButton}
            >
              ← Back to Home
            </button>
            <button 
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f6fa',
    padding: '2rem',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '1200px',
  },
  title: {
    marginBottom: '2rem',
    color: '#2c3e50',
    fontSize: '1.8rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  formSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #dcdde1',
    fontSize: '1rem',
    width: '100%',
  },
  select: {
    padding: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #dcdde1',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    width: '100%',
  },
  kycSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  kycTitle: {
    marginBottom: '1rem',
    color: '#2c3e50',
    fontSize: '1.2rem',
  },
  fileInputGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fileInput: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #dcdde1',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
  },
  submitBtn: {
    padding: '0.8rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  backButton: {
    padding: '0.8rem 2rem',
    backgroundColor: 'transparent',
    color: '#7f8c8d',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  error: {
    color: '#e74c3c',
    padding: '1rem',
    backgroundColor: '#fde2e2',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default Register;