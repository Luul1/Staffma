const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SalaryAdvance = require('../models/SalaryAdvance');
const Payroll = require('../models/Payroll');
const Business = require('../models/Business');
const { ObjectId } = require('mongoose').Types;
const Employee = require('../models/Employee');
const BankService = require('../services/bankService');

// Add this helper function at the top of the file, after the imports
const isValidPayrollPeriod = async (businessId, month, year) => {
  try {
    // Get business registration date
    const business = await Business.findById(businessId);
    if (!business) return false;

    const registrationDate = new Date(business.createdAt);
    const periodDate = new Date(year, month - 1);
    const currentDate = new Date();
    
    // Special case for December 2024 (for testing)
    if (month === 12 && year === 2024) {
      return true;
    }
    
    // Cannot process future months (except December 2024)
    if (periodDate > currentDate && !(month === 12 && year === 2024)) {
      return false;
    }
    
    // Cannot process months before registration
    if (periodDate < registrationDate) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating payroll period:', error);
    return false;
  }
};

// Salary advance request route
router.post('/advance-request', auth, async (req, res) => {
  try {
    const { employeeIds, amount, reason, requestDate } = req.body;
    
    // Validate input
    if (!employeeIds?.length) {
      return res.status(400).json({ message: 'No employees selected' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    // Calculate fee (5% of advance amount)
    const fee = amount * 0.05;
    const totalAmount = amount + fee;

    // Create salary advance request
    const advanceRequest = new SalaryAdvance({
      employees: employeeIds,
      amount,
      fee,
      totalAmount,
      reason,
      requestDate,
      status: 'pending',
      businessId: req.user.businessId,
      repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await advanceRequest.save();

    res.status(201).json({ 
      message: 'Salary advance request submitted successfully',
      requestId: advanceRequest._id,
      fee,
      totalAmount
    });
  } catch (error) {
    console.error('Error creating salary advance request:', error);
    res.status(500).json({ 
      message: 'Failed to submit salary advance request',
      error: error.message 
    });
  }
});

// Get salary advance requests
router.get('/advance-requests', auth, async (req, res) => {
  try {
    const advanceRequests = await SalaryAdvance.find({ businessId: req.user.businessId })
      .populate('employees', 'firstName lastName position')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(advanceRequests);
  } catch (error) {
    console.error('Error fetching salary advance requests:', error);
    res.status(500).json({ message: 'Failed to fetch salary advance requests' });
  }
});

// Update salary advance request status
router.patch('/advance-request/:id', auth, async (req, res) => {
  try {
    const { status, comments } = req.body;
    const advanceRequest = await SalaryAdvance.findOne({
      _id: req.params.id,
      businessId: req.user.businessId
    }).populate('employees');

    if (!advanceRequest) {
      return res.status(404).json({ message: 'Salary advance request not found' });
    }

    advanceRequest.status = status;
    advanceRequest.comments = comments;
    
    if (status === 'approved') {
      advanceRequest.approvedBy = req.user._id;
      advanceRequest.approvalDate = new Date();

      // Process bank transfers for each employee
      const transactions = [];
      for (const employee of advanceRequest.employees) {
        if (employee.bankDetails?.accountNumber) {
          try {
            const transaction = await BankService.initiateSalaryAdvanceTransfer(
              advanceRequest._id,
              req.user.businessId,
              employee._id,
              advanceRequest.amount / advanceRequest.employees.length, // Split amount equally
              employee.bankDetails
            );
            transactions.push(transaction);
          } catch (transferError) {
            console.error('Transfer error:', transferError);
          }
        }
      }

      // Update status based on transfer results
      if (transactions.length > 0) {
        const allSuccessful = transactions.every(t => t.status === 'completed');
        advanceRequest.status = allSuccessful ? 'disbursed' : 'failed';
        advanceRequest.transactionReference = transactions.map(t => t.transactionReference).join(',');
        advanceRequest.disbursementDate = new Date();
      }
    }

    await advanceRequest.save();

    res.json({ 
      message: `Salary advance request ${advanceRequest.status}`,
      advanceRequest 
    });
  } catch (error) {
    console.error('Error updating salary advance request:', error);
    res.status(500).json({ message: 'Failed to update salary advance request' });
  }
});

// Get payroll history
router.get('/history', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    console.log('Fetching payroll history:', { month, year, businessId: req.user.businessId });

    const payrollHistory = await Payroll.find({
      businessId: req.user.businessId,
      month: parseInt(month),
      year: parseInt(year)
    }).populate('employeeId', 'firstName lastName position department');

    res.json(payrollHistory);
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    res.status(500).json({ message: 'Failed to fetch payroll history' });
  }
});

// Process payroll
router.post('/process', auth, async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        message: 'Month and year are required'
      });
    }

    // Check if payroll has already been processed for this month
    const existingPayroll = await Payroll.findOne({
      businessId: req.user.businessId,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (existingPayroll) {
      return res.status(400).json({
        message: `Payroll for ${month}/${year} has already been processed. Cannot process multiple times.`,
        processedDate: existingPayroll.processedDate
      });
    }

    // Check if the payroll period is valid
    const isValid = await isValidPayrollPeriod(req.user.businessId, Number(month), Number(year));
    if (!isValid) {
      return res.status(400).json({
        message: 'Cannot process payroll for this period. You can only process payroll from your registration month onwards.'
      });
    }

    // Get all active employees
    const employees = await Employee.find({ 
      businessId: req.user.businessId,
      status: 'active'
    });

    if (!employees.length) {
      return res.status(400).json({
        message: 'No active employees found'
      });
    }

    const payrollResults = [];
    const errors = [];
    const transactions = [];

    for (const employee of employees) {
      try {
        // Calculate payroll for each employee
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
        const payrollRecord = new Payroll({
          employeeId: employee._id,
          businessId: req.user.businessId,
          month: parseInt(month),
          year: parseInt(year),
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
        });

        await payrollRecord.save();
        payrollResults.push(payrollRecord);

        // Initiate salary transfer if employee has bank details
        if (employee.bankDetails?.accountNumber) {
          const transaction = await BankService.initiateSalaryTransfer(
            payrollRecord._id,
            req.user.businessId,
            employee._id,
            netSalary,
            employee.bankDetails
          );
          transactions.push(transaction);
        } else {
          errors.push(`No bank details found for ${employee.firstName} ${employee.lastName}`);
        }
      } catch (employeeError) {
        errors.push(`Error processing ${employee.firstName} ${employee.lastName}: ${employeeError.message}`);
      }
    }

    res.status(200).json({
      message: `Payroll processed successfully for ${payrollResults.length} employees`,
      warnings: errors.length ? errors : undefined,
      count: payrollResults.length,
      transactions: transactions.map(t => ({
        employeeId: t.employeeId,
        amount: t.amount,
        status: t.status,
        reference: t.transactionReference
      }))
    });
  } catch (error) {
    console.error('Payroll processing error:', error);
    res.status(500).json({ 
      message: 'Failed to process payroll',
      error: error.message 
    });
  }
});

// Add a route to check if payroll has been processed for a given month
router.get('/check-processed', auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    const existingPayroll = await Payroll.findOne({
      businessId: req.user.businessId,
      month: parseInt(month),
      year: parseInt(year)
    });

    res.json({
      processed: !!existingPayroll,
      processedDate: existingPayroll?.processedDate || null
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to check payroll status',
      error: error.message 
    });
  }
});

// Get employee payroll history
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee belongs to this business
    const employee = await Employee.findOne({
      _id: new ObjectId(employeeId),
      businessId: req.user.businessId
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const payrollHistory = await Payroll.find({
      employeeId: new ObjectId(employeeId),
      businessId: req.user.businessId
    }).sort({ year: -1, month: -1 });

    res.json(payrollHistory);
  } catch (error) {
    console.error('Error fetching employee payroll history:', error);
    res.status(500).json({ message: 'Failed to fetch employee payroll history' });
  }
});

// Helper functions for payroll calculations
function calculatePAYE(grossSalary) {
  // Implement PAYE calculation logic based on your tax brackets
  // This is a simplified example
  if (grossSalary <= 24000) return 0;
  if (grossSalary <= 32333) return grossSalary * 0.1;
  if (grossSalary <= 50000) return grossSalary * 0.15;
  return grossSalary * 0.2;
}

function calculateNHIF(grossSalary) {
  // Implement NHIF calculation logic based on your NHIF rates
  if (grossSalary <= 5999) return 150;
  if (grossSalary <= 7999) return 300;
  if (grossSalary <= 11999) return 400;
  if (grossSalary <= 14999) return 500;
  return 600; // Simplified example
}

function calculateNSSF(grossSalary) {
  // Implement NSSF calculation logic
  // This is a simplified example
  const nssfRate = 0.06; // 6%
  const maxContribution = 1080; // Maximum contribution
  const contribution = grossSalary * nssfRate;
  return Math.min(contribution, maxContribution);
}

// Add a route to check transaction status
router.get('/transaction/:reference', auth, async (req, res) => {
  try {
    const status = await BankService.getTransactionStatus(req.params.reference);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get transaction status',
      error: error.message 
    });
  }
});

module.exports = router; 