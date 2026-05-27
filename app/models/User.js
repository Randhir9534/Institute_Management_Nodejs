const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: {type:String},
  profilePicture: {type:String},
  isVerified: { type: Boolean, default: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  verificationToken: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
