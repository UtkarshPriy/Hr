import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  docName: {
    type: String,
    required: true,
    trim: true,
  },
  Key: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  employee_name: {
    type: String,
    required: true,
    trim: true,
  },
  employee_email: {
    type: String,
    required: true,
    trim: true,
  },
  signLocation: {
    type: String,
    trim: true,
  },
  signReason: {
    type: String,
    trim: true,
  },
  signContact: {
    type: String,
    trim: true,
  },
  signUrl: {
    type: String,
    trim: true,
    default: null,
  },
  signDatetime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['signed', 'pending', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Adding indexes for better query performance
signatureSchema.index({ docName: 1 });
signatureSchema.index({ key: 1 });
signatureSchema.index({ employee_email: 1 });

const Signature = mongoose.model('Signature', signatureSchema);

export default Signature;
