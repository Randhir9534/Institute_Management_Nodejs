const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name:{type:String,required:true},
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  startDate: {type:String,required:true},
  endDate: {type:String,required:true},
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
