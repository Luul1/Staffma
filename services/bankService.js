const Transaction = require('../models/Transaction');
const Business = require('../models/Business');

class BankService {
  static async initiateSalaryTransfer(payrollId, businessId, employeeId, amount, employeeBankDetails) {
    try {
      // Fetch business bank details (in a real app, this would be stored securely)
      const business = await Business.findById(businessId);
      
      // Create transaction record
      const transaction = new Transaction({
        businessId,
        payrollId,
        employeeId,
        amount,
        bankDetails: {
          fromAccount: {
            bankName: 'Stafma Bank',
            accountName: business.name,
            accountNumber: '1234567890' // This would be the actual business account number
          },
          toAccount: {
            ...employeeBankDetails
          }
        }
      });

      // Simulate bank API call
      const success = await this.simulateBankTransfer(transaction);

      if (success) {
        transaction.status = 'completed';
      } else {
        transaction.status = 'failed';
        transaction.errorMessage = 'Bank transfer simulation failed';
      }

      await transaction.save();
      return transaction;
    } catch (error) {
      console.error('Error initiating salary transfer:', error);
      throw error;
    }
  }

  static async simulateBankTransfer(transaction) {
    // Simulate bank API call with 95% success rate
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return Math.random() < 0.95; // 95% success rate
  }

  static async getTransactionStatus(transactionReference) {
    try {
      const transaction = await Transaction.findOne({ transactionReference });
      return transaction?.status || 'not_found';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  static async initiateSalaryAdvanceTransfer(advanceId, businessId, employeeId, amount, employeeBankDetails) {
    try {
      const business = await Business.findById(businessId);
      
      // Create transaction record
      const transaction = new Transaction({
        businessId,
        payrollId: advanceId, // Using advanceId in place of payrollId
        employeeId,
        amount,
        bankDetails: {
          fromAccount: {
            bankName: 'Stafma Bank',
            accountName: 'Stafma Salary Advance Account',
            accountNumber: '9876543210' // Special account for salary advances
          },
          toAccount: {
            ...employeeBankDetails
          }
        }
      });

      // Simulate bank API call
      const success = await this.simulateBankTransfer(transaction);

      if (success) {
        transaction.status = 'completed';
      } else {
        transaction.status = 'failed';
        transaction.errorMessage = 'Bank transfer simulation failed';
      }

      await transaction.save();
      return transaction;
    } catch (error) {
      console.error('Error initiating salary advance transfer:', error);
      throw error;
    }
  }
}

module.exports = BankService; 