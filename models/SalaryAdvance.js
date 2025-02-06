const mongoose = require('mongoose');

const salaryAdvanceSchema = new mongoose.Schema({
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  }],
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'failed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  comments: String,
  transactionReference: String,
  disbursementDate: Date,
  repaymentDate: Date,
  repaymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalaryAdvance', salaryAdvanceSchema); 