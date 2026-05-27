const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendVerificationEmail = require('../../helper/emailService');
const Role = require('../models/Role');
const path=require('path');
const fs=require('fs')

class AuthController {
  // ======== signup============
 async signup(req, res) {
    try {
      const { name, email,contact, password } = req.body;
      const role = await Role.create(req.body);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const newUser = new User({
        name,
        email,
        contact,
        password: hashedPassword,
        role:role._id,
        verificationToken,
      });
      if(req.file){
      newUser.profilePicture=req.file.path
    }
      
      const user=await newUser.save();
      
      await sendVerificationEmail(user, verificationToken);

      res.status(201).json({
        message: 'Signup successful. Check your email for verification link.',
        data: user
      });
    } catch (err) {
      res.status(500).json({
        message: 'Signup error',
        error: err.message,
      });
    }
  }

  // ========= verify-email/:token ================
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res
          .status(400)
          .json({ message: 'Invalid or expired verification token' });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
      res.status(500).json({
        message: 'Verification error',
        error: err.message,
      });
    }
  }

  // =========== login ==============
 async login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    if (!user.isVerified) return res.status(401).json({ message: 'Email not verified' });

    const roleData = await Role.findById(user.role); // Assuming user.role is ObjectId

    const token = jwt.sign(
      { id: user._id, role: roleData?.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleData?.role
      },
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

    // Get user profile
    async getProfile(req, res) {
      try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  
    // Update profile
    async editProfile(req, res) {
    try {
      const id=req.params.id
      let{name, email,contact, password,profilePicture}=req.body

      if (req.file) {
        const existing = await User.findById(id);
        if (existing && existing.profilePicture) {
          const oldPath = path.resolve(existing.profilePicture);
          fs.unlink(oldPath, (err) => {
            // ignore errors deleting old file
          });
        }
        profilePic = req.file.path;
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,{name, email,contact, password,profilePicture}
      );

      return res.json({message:"profile updated successsfully"});
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
    // List users by role (admin only)
    async listUsersByRole(req, res) {
      try {
        const { role } = req.query;
  
        const users = await User.aggregate([
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'roleInfo'
            }
          },
          { $unwind: '$roleInfo' },
          { $match: { 'roleInfo.name': role } }
        ]);
  
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
}

module.exports = new AuthController();
