const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
    trim: true,
    maxlength: [255, 'Organization name must be at most 255 characters long']
  },
  address: {
    type: String,
    required: [true, 'Organization address is required'],
    trim: true
  },
  primaryOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model exists for primary owners
    required: [true, 'Primary owner is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model exists for creators
    required: [true, 'Creator is required']
  },
  phoneNo: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must be at most 20 characters long']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  plan: {
    type: String,
    required: [true, 'Plan is required'],
    trim: true
  },
  handler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming a User model exists for handlers
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming a User model exists for last updaters
  }
}, { timestamps: true });

// Indexes for faster queries
organizationSchema.index({ name: 1 });

// Error handling middleware for unique constraint
organizationSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Organization name must be unique'));
  } else {
    next();
  }
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;

// module.exports = Organization;
