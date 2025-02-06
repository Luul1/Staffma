const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');
const { ObjectId } = require('mongoose').Types;

// Existing routes...

// Update bank details
router.put('/:id/bank-details', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { bankDetails } = req.body;

    const employee = await Employee.findOneAndUpdate(
      {
        _id: id,
        businessId: req.user.businessId
      },
      { $set: { bankDetails } },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ 
      message: 'Bank details updated successfully',
      bankDetails: employee.bankDetails 
    });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({ 
      message: 'Failed to update bank details',
      error: error.message 
    });
  }
});

module.exports = router; 