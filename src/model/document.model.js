import mongoose from 'mongoose';

const docSchema = new mongoose.Schema({
  docName: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
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
  date: {
    type: Date,
    default: Date.now,
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
docSchema.index({ key: 1 });
docSchema.index({ uploader: 1 });

const Doc = mongoose.model('Doc', docSchema);

export default Doc;
