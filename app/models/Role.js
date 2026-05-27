const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role: { type: String, enum: ['Admin', 'Student','Teacher'], required: true } 
});

module.exports = mongoose.model('Role', roleSchema);
