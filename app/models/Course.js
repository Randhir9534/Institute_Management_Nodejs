const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: String,
  fees: Number
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
