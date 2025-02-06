const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    salary: {
        basic: {
            type: Number,
            required: true
        },
        allowances: {
            housing: {
                type: Number,
                default: 0
            },
            transport: {
                type: Number,
                default: 0
            },
            medical: {
                type: Number,
                default: 0
            },
            other: {
                type: Number,
                default: 0
            }
        },
        deductions: {
            loans: {
                type: Number,
                default: 0
            },
            other: {
                type: Number,
                default: 0
            }
        }
    },
    bankDetails: {
        bankName: {
            type: String,
            required: true,
            trim: true
        },
        accountName: {
            type: String,
            required: true,
            trim: true
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true
        },
        branchName: {
            type: String,
            required: true,
            trim: true
        },
        swiftCode: {
            type: String,
            trim: true
        },
        bankCode: {
            type: String,
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    performanceReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PerformanceReview'
    }],
    employmentType: {
        type: String,
        enum: ['permanent', 'contract', 'probation', 'attachment'],
        required: true,
        default: 'permanent'
    },
    employmentEndDate: {
        type: Date,
        required: function() {
            return this.employmentType === 'contract' || this.employmentType === 'attachment';
        }
    },
    probationEndDate: {
        type: Date,
        required: function() {
            return this.employmentType === 'probation';
        }
    },
    employeeNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Index for faster queries
employeeSchema.index({ businessId: 1 });
employeeSchema.index({ email: 1, businessId: 1 }, { unique: true });

// Update the pre-save middleware to ensure it runs before validation
employeeSchema.pre('validate', async function(next) {
    if (!this.employeeNumber) {
        const lastEmployee = await this.constructor.findOne(
            { businessId: this.businessId },
            { employeeNumber: 1 },
            { sort: { employeeNumber: -1 } }
        );

        let nextNumber = 1;
        if (lastEmployee && lastEmployee.employeeNumber) {
            const lastNumber = parseInt(lastEmployee.employeeNumber.replace('STAFMA', ''));
            nextNumber = lastNumber + 1;
        }

        this.employeeNumber = `STAFMA${String(nextNumber).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Employee', employeeSchema); 


