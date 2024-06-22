import mongoose from 'mongoose';

const docEmployeeRelationSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  employee: {
    type: String,
    required: true,
    trim: true,
  },
  docName: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
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
    enum: ['signed', 'pending', 'rejected'],
    default: 'pending',
  },
  docURL: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Adding indexes for better query performance
docEmployeeRelationSchema.index({ owner: 1 });
docEmployeeRelationSchema.index({ employee: 1 });
docEmployeeRelationSchema.index({ key: 1 });

const DocEmployeeRelation = mongoose.model('DocEmployeeRelation', docEmployeeRelationSchema);

export default DocEmployeeRelation;
