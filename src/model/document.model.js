import mongoose from 'mongoose';

const docSchema = new mongoose.Schema({
  docName: {
    type: String,
    required: true,
    trim: true,
  },
  Key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  uploader: {
    type: String,
    required: true,
    trim: true,
  },
  docURL: {
    type: String,
    required: true,
    trim: true,
  },
  organizationName: {
    type: String,
    trim: true,
    default: null
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
  },
}, {
  timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Adding indexes for better query performance
docSchema.index({ Key: 1 });
docSchema.index({ uploader: 1 });

const Doc = mongoose.model('Doc', docSchema);

export default Doc;
