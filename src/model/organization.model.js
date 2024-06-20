import mongoose from 'mongoose';
import validator from 'validator';
import libphonenumber from 'google-libphonenumber';

const { Schema } = mongoose;
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

// Define the organization schema
const organizationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name must be at most 100 characters long']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address must be at most 200 characters long']
  },
  primaryOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Primary owner is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  phoneNo: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        try {
          const phoneNumber = phoneUtil.parseAndKeepRawInput(v);
          return phoneUtil.isValidNumber(phoneNumber);
        } catch (error) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid phone number`
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    required: [true, 'Status is required']
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: [true, 'Plan is required']
  },
  expiresOn: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: String,
    required: [true, 'Last updated by is required'],
    trim: true,
    default: 'null'
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Indexes for faster querying (optional)
organizationSchema.index({ name: 1 });
organizationSchema.index({ status: 1 });

// Create the organization model
const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
