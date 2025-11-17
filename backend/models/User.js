import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  role: { 
    type: Schema.Types.ObjectId, 
    ref: 'Role', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  avatar: { 
    type: String, 
    default: "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png" // Avatar mặc định
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

export default mongoose.model('User', UserSchema);
