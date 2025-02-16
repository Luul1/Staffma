const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ObjectId } = mongoose.Types;

// Import models
const Business = require('./models/Business');
const Employee = require('./models/Employee');
const Payroll = require('./models/Payroll');
const PerformanceReview = require('./models/PerformanceReview');
const performanceReviewsRouter = require('./routes/performanceReviews');
const payrollRoutes = require('./routes/payrollRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    }
  })
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit if can't connect to database
  });

// Authentication middleware
const authenticateBusiness = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!mongoose.Types.ObjectId.isValid(decoded.businessId)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    req.businessId = decoded.businessId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add this dashboard data endpoint
app.get('/api/dashboard', authenticateBusiness, async (req, res) => {
  try {
    const business = await Business.findById(req.businessId)
      .populate('employees')
      .select('-password');

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Calculate dashboard metrics
    const totalEmployees = business.employees.length;
    const departments = business.departments || [];
    const employeesByDepartment = {};
    
    business.employees.forEach(employee => {
      employeesByDepartment[employee.department] = 
        (employeesByDepartment[employee.department] || 0) + 1;
    });

    res.json({
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        businessType: business.businessType,
        departments: business.departments
      },
      metrics: {
        totalEmployees,
        departments: departments.length,
        employeesByDepartment
      },
      employees: business.employees
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Add these endpoints for dashboard data
app.get('/api/business', authenticateBusiness, async (req, res) => {
  try {
    const business = await Business.findById(req.businessId)
      .select('-password');
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business data' });
  }
});

app.get('/api/employees', authenticateBusiness, async (req, res) => {
  try {
    const employees = await Employee.find({ businessId: req.businessId });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/employees/count', authenticateBusiness, async (req, res) => {
  try {
    const count = await Employee.countDocuments({ businessId: req.businessId });
    res.json({
      total: count,
      limit: 100,
      remaining: 100 - count
    });
  } catch (error) {
    console.error('Error counting employees:', error);
    res.status(500).json({ error: 'Failed to get employee count' });
  }
});

app.put('/api/business/update', authenticateBusiness, async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.businessId,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!updatedBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(updatedBusiness);
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Add employee endpoint
app.post('/api/employees', authenticateBusiness, async (req, res) => {
  try {
    // Validate salary before creating employee
    const basicSalary = Number(req.body.salary);
    if (isNaN(basicSalary) || basicSalary <= 0) {
      return res.status(400).json({ 
        error: 'Invalid salary amount. Salary must be a positive number.' 
      });
    }

    const employeeData = {
      ...req.body,
      businessId: req.businessId,
      salary: {
        basic: basicSalary, // Use the validated salary
        allowances: {
          housing: 0,
          transport: 0,
          medical: 0,
          other: 0
        },
        deductions: {
          loans: 0,
          other: 0
        }
      }
    };

    // Log the employee data for debugging
    console.log('Creating employee with data:', {
      ...employeeData,
      salary: {
        ...employeeData.salary,
        basic: employeeData.salary.basic
      }
    });

    const employee = new Employee(employeeData);
    await employee.save();

    // Update business with new employee
    await Business.findByIdAndUpdate(
      req.businessId,
      { $push: { employees: employee._id } }
    );

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ 
      error: 'Failed to add employee',
      details: error.message 
    });
  }
});

// Get employee details with all related information
app.get('/api/employees/:id', authenticateBusiness, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(req.businessId)
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get payroll history
    const payrollHistory = await Payroll.find({
      employeeId: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(req.businessId)
    }).sort({ year: -1, month: -1 });

    // Get performance reviews
    const performanceReviews = await PerformanceReview.find({
      employeeId: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(req.businessId)
    }).sort({ reviewDate: -1 });

    // Combine all data
    const employeeData = {
      ...employee.toObject(),
      payrollHistory,
      performanceReviews
    };

    res.json(employeeData);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to fetch employee details' });
  }
});

// Update employee details
app.put('/api/employees/:id', authenticateBusiness, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify the employee belongs to this business
    const employee = await Employee.findOne({
      _id: id,
      businessId: req.businessId
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update employee data
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { ...updateData, businessId: req.businessId },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
app.delete('/api/employees/:id', authenticateBusiness, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the employee belongs to this business
    const employee = await Employee.findOne({
      _id: id,
      businessId: req.businessId
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee and their payroll records
    await Promise.all([
      Employee.findByIdAndDelete(id),
      Payroll.deleteMany({ employeeId: id })
    ]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Routes
app.post('/api/register', upload.fields([
  { name: 'companyPin', maxCount: 1 },
  { name: 'cr12', maxCount: 1 },
  { name: 'businessCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Registration request received:', {
      ...req.body,
      password: '[HIDDEN]',
      files: req.files
    });

    const {
      businessName,
      email,
      password,
      businessType,
      applicantName,
      applicantRole,
      businessAddress,
      contactNumber
    } = req.body;

    // Validate required fields
    if (!businessName || !email || !password) {
      return res.status(400).json({ 
        error: 'Business name, email and password are required' 
      });
    }

    // Check if email already exists
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare KYC documents
    const kycDocuments = {
      companyPin: req.files?.companyPin?.[0]?.location,
      cr12: req.files?.cr12?.[0]?.location,
      businessCertificate: req.files?.businessCertificate?.[0]?.location
    };

    // Create business document
    const business = new Business({
      businessName: businessName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      businessType: businessType || 'sole',
      applicantName: applicantName?.trim(),
      applicantRole: applicantRole?.trim(),
      businessAddress: businessAddress?.trim(),
      contactNumber: contactNumber?.trim(),
      kycDocuments,
      createdAt: new Date()
    });

    // Save to database
    await business.save();

    // Generate token
    const token = jwt.sign(
      { businessId: business._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send success response
    return res.status(201).json({
      message: 'Registration successful',
      token,
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.message
      });
    }
    return res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Update the token generation in login and register endpoints
const generateToken = (businessId) => {
  return jwt.sign(
    { businessId },
    JWT_SECRET,
    { expiresIn: '7d' } // Increase token expiration to 7 days
  );
};

// Add refresh token endpoint
app.post('/api/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify existing token
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Generate new token
    const newToken = generateToken(decoded.businessId);
    
    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update the login endpoint to use generateToken
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const isValid = await bcrypt.compare(password, business.password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const token = generateToken(business._id);

    // Send response with proper headers
    res.status(200).json({
      token,
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Add this endpoint for employee payroll history
app.get('/api/payroll/employee/:employeeId', authenticateBusiness, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: new ObjectId(employeeId),
      businessId: new ObjectId(req.businessId)
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const payrollHistory = await Payroll.find({
      employeeId: new ObjectId(employeeId),
      businessId: new ObjectId(req.businessId)
    }).sort({ year: -1, month: -1 });

    res.json(payrollHistory);
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }
    res.status(500).json({ error: 'Failed to fetch payroll history' });
  }
});

// Add this endpoint for processing payroll
app.post('/api/payroll/process-employee', authenticateBusiness, async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: employeeId,
      businessId: req.businessId
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate payroll
    const basicSalary = employee.salary.basic;
    const allowances = Object.values(employee.salary.allowances || {}).reduce((sum, val) => sum + val, 0);
    const grossSalary = basicSalary + allowances;

    // Calculate deductions
    const paye = calculatePAYE(grossSalary);
    const nhif = calculateNHIF(grossSalary);
    const nssf = calculateNSSF(grossSalary);
    const otherDeductions = Object.values(employee.salary.deductions || {}).reduce((sum, val) => sum + val, 0);
    const totalDeductions = paye + nhif + nssf + otherDeductions;

    // Calculate net salary
    const netSalary = grossSalary - totalDeductions;

    // Create or update payroll record
    const payroll = await Payroll.findOneAndUpdate(
      {
        employeeId,
        businessId: req.businessId,
        month,
        year
      },
      {
        basicSalary,
        allowances,
        grossSalary,
        deductions: {
          paye,
          nhif,
          nssf,
          other: otherDeductions,
          totalDeductions
        },
        netSalary,
        processedDate: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(payroll);
  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ error: 'Failed to process payroll' });
  }
});

// Get payroll summary
app.get('/api/payroll/summary', authenticateBusiness, async (req, res) => {
  try {
    const { month, year } = req.query;

    const summary = await Payroll.aggregate([
      {
        $match: {
          businessId: new ObjectId(req.businessId),
          month: parseInt(month),
          year: parseInt(year)
        }
      },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalPAYE: { $sum: '$deductions.paye' },
          totalNHIF: { $sum: '$deductions.nhif' },
          totalNSSF: { $sum: '$deductions.nssf' }
        }
      }
    ]);

    res.json(summary[0] || {
      totalEmployees: 0,
      totalGrossSalary: 0,
      totalNetSalary: 0,
      totalPAYE: 0,
      totalNHIF: 0,
      totalNSSF: 0
    });
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
});

// Add this endpoint for downloading payslips
app.get('/api/payroll/download/:payrollId', authenticateBusiness, async (req, res) => {
  try {
    const { payrollId } = req.params;
    const payroll = await Payroll.findOne({
      _id: payrollId,
      businessId: req.businessId
    }).populate('employeeId');

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Get business details
    const business = await Business.findById(req.businessId);

    // Generate PDF payslip
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.month}-${payroll.year}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`${business.businessName}`);
    doc.text(`${business.businessAddress}`);
    doc.moveDown();
    doc.text(`Employee: ${payroll.employeeId.firstName} ${payroll.employeeId.lastName}`);
    doc.text(`Position: ${payroll.employeeId.position}`);
    doc.text(`Department: ${payroll.employeeId.department}`);
    doc.moveDown();
    doc.text(`Period: ${payroll.month}/${payroll.year}`);
    doc.moveDown();
    doc.text(`Basic Salary: KES ${payroll.basicSalary.toLocaleString()}`);
    doc.text(`Allowances: KES ${payroll.allowances.toLocaleString()}`);
    doc.text(`Gross Salary: KES ${payroll.grossSalary.toLocaleString()}`);
    doc.moveDown();
    doc.text('Deductions:');
    doc.text(`PAYE: KES ${payroll.deductions.paye.toLocaleString()}`);
    doc.text(`NHIF: KES ${payroll.deductions.nhif.toLocaleString()}`);
    doc.text(`NSSF: KES ${payroll.deductions.nssf.toLocaleString()}`);
    doc.moveDown();
    doc.text(`Total Deductions: KES ${payroll.deductions.totalDeductions.toLocaleString()}`);
    doc.moveDown();
    doc.text(`Net Salary: KES ${payroll.netSalary.toLocaleString()}`);
    doc.moveDown();
    doc.end();
  } catch (error) {
    console.error('Error downloading payslip:', error);
    res.status(500).json({ error: 'Failed to download payslip' });
  }
});

// Add performance review
app.post('/api/employees/:id/performance-review', authenticateBusiness, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reviewDate,
      reviewerName,
      rating,
      comments,
      goals,
      strengths,
      areasForImprovement,
      trainingRecommendations
    } = req.body;

    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: id,
      businessId: req.businessId
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const performanceReview = new PerformanceReview({
      employeeId: id,
      businessId: req.businessId,
      reviewDate,
      reviewerName,
      rating,
      comments,
      goals,
      strengths,
      areasForImprovement,
      trainingRecommendations
    });

    await performanceReview.save();
    res.status(201).json(performanceReview);
  } catch (error) {
    console.error('Error adding performance review:', error);
    res.status(500).json({ error: 'Failed to add performance review' });
  }
});

// Get employee performance reviews
app.get('/api/employees/:id/performance-reviews', authenticateBusiness, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: id,
      businessId: req.businessId
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const reviews = await PerformanceReview.find({
      employeeId: id,
      businessId: req.businessId
    }).sort({ reviewDate: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.status(500).json({ error: 'Failed to fetch performance reviews' });
  }
});

app.use('/api', performanceReviewsRouter);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/employees', employeeRoutes);

// Add this before your routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Add this after all your routes but before error handlers
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


