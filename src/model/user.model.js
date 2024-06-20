import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must be at most 30 characters long'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: true // To Ensure password is not selected by default set it to false
  },
  role: {
    type: String,
    enum: ['admin', 'sub_admin', 'owner', 'employee'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  organizationName: {
    type: String,
    trim: true,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: String,
    required: true,
    trim: true,
    default: 'null'
  }
});

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware to update the lastUpdated field
userSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to hide sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Create the user model
const UserList = mongoose.model('UserList', userSchema);

export default UserList;

/* 
// Example of using ObjectId and reference for lastUpdatedBy
// Uncomment this block if you want to use ObjectId and reference
// lastUpdatedBy: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User'
// }
*/

/*
// Example of using timestamps option
// Uncomment this block if you want to use timestamps option
// }, { timestamps: true });
*/
