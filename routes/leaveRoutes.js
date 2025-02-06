const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Leave = require('../models/Leave');
const { ObjectId } = require('mongoose').Types;

// Request leave
router.post('/request', auth, async (req, res) => {
  try {
    const { 
      employeeId, 
      leaveType, 
      startDate, 
      endDate, 
      reason, 
      attachments 
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $ne: 'rejected' },
      $or: [
        {
          startDate: { $lte: start },
          endDate: { $gte: start }
        },
        {
          startDate: { $lte: end },
          endDate: { $gte: end }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: 'There is already a leave request for these dates' 
      });
    }

    const leave = new Leave({
      employeeId,
      businessId: req.user.businessId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachments
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ 
      message: 'Failed to submit leave request',
      error: error.message 
    });
  }
});

// Get leave requests for an employee
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaves = await Leave.find({
      employeeId,
      businessId: req.user.businessId
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch leave requests' 
    });
  }
});

// Get all leave requests for a business
router.get('/business', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({
      businessId: req.user.businessId
    })
    .populate('employeeId', 'firstName lastName position department')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch leave requests' 
    });
  }
});

// Update leave request status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, comments } = req.body;
    const leave = await Leave.findOne({
      _id: req.params.id,
      businessId: req.user.businessId
    });

    if (!leave) {
      return res.status(404).json({ 
        message: 'Leave request not found' 
      });
    }

    leave.status = status;
    leave.comments = comments;
    
    if (status === 'approved') {
      leave.approvedBy = req.user._id;
      leave.approvalDate = new Date();
    }

    await leave.save();

    res.json({
      message: `Leave request ${status}`,
      leave
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ 
      message: 'Failed to update leave request' 
    });
  }
});

module.exports = router; 