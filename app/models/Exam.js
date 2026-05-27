const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: String,
  date: Date,
  duration: String,
  totalMarks: Number,
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  results: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      marksObtained: {type:Number},
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
