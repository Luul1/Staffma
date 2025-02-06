const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  payrollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payroll',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  bankDetails: {
    fromAccount: {
      bankName: String,
      accountName: String,
      accountNumber: String
    },
    toAccount: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      branchName: String,
      swiftCode: String,
      bankCode: String
    }
  },
  transactionReference: {
    type: String,
    unique: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  errorMessage: String
}, {
  timestamps: true
});

// Generate unique transaction reference
transactionSchema.pre('save', function(next) {
  if (!this.transactionReference) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.transactionReference = `TRX${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema); 