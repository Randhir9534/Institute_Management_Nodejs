const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  date: Date,
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      present: Boolean
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
