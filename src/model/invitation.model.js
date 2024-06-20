import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the invite schema
const inviteSchema = new Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From user ID is required']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To user ID is required']
  },
  type: {
    type: String,
    enum: ['invitation', 'reminder', 'notification'],
    required: [true, 'Type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Last updated by is required']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Indexes for faster querying (optional)
inviteSchema.index({ from: 1 });
inviteSchema.index({ to: 1 });

// Create the invite model
const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;
