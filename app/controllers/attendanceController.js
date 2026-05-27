const Attendance = require('../models/Attendance');

class AttendanceController {
  // 1. Mark Attendance (Teacher)
   async markAttendance(req, res) {
    try {
      const { batch, date, records } = req.body;

      const existing = await Attendance.findOne({ batch, date });
      if (existing) {
        return res.status(400).json({ message: 'Attendance already marked for this date' });
      }

      const attendance = new Attendance({ batch, date, records });
      await attendance.save();
      res.status(201).json({message:"Attendance done", data:attendance});
    } catch (err) {
      res.status(500).json({ message: 'Failed to mark attendance', error: err.message });
    }
  }

  // 2. View Attendance (by Student or Batch)
   async viewAttendance(req, res) {
    try {
      const result = await Attendance.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'records.student',
            foreignField: '_id',
            as: 'studentInfo',
          },
        },
        {
          $project: {
            name: { $arrayElemAt: ['$studentInfo.name', 0] },
            contact: { $arrayElemAt: ['$studentInfo.contact', 0] },
            date: 1,
            batch: 1,
            student: '$records.student',
            present: '$records.present',
          },
        },
      ]);

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
    }
  }
}

module.exports = new AttendanceController();
