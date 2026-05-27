const { sendMail } = require("../../helper/reportMailer");
const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Exam = require("../models/Exam");
const User = require("../models/User");
const mongoose = require("mongoose");

class ReportController {
  // 1. Course Enrollment Stats
  async courseEnrollmentStats(req, res) {
    try {
      const result = await Enrollment.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseInfo",
          },
        },
        { $unwind: "$courseInfo" },
        {
          $group: {
            _id: "$course",
            courseName: { $first: "$courseInfo.name" },
            totalEnrollments: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // 2. Batch Performance
  async batchPerformance(req, res) {
    try {
      const batchId = new mongoose.Types.ObjectId(req.params.batchId);

      const attendance = await Attendance.aggregate([
        { $match: { batch: batchId } },
        { $unwind: "$records" },
        {
          $group: {
            _id: "$records.student",
            totalDays: { $sum: 1 },
            presentDays: { $sum: { $cond: ["$records.present", 1, 0] } },
          },
        },
        {
          $project: {
            studentId: "$_id",
            attendancePercentage: {
              $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
            },
          },
        },
      ]);

      const exams = await Exam.aggregate([
        { $match: { batch: batchId } },
        { $unwind: "$results" },
        {
          $group: {
            _id: "$results.student",
            averageMarks: { $avg: "$results.marksObtained" },
          },
        },
      ]);

      const report = attendance.map((att) => {
        const exam = exams.find(
          (e) => e._id.toString() === att.studentId.toString()
        );
        return {
          studentId: att.studentId,
          attendance: att.attendancePercentage.toFixed(2),
          averageMarks: exam ? exam.averageMarks.toFixed(2) : "N/A",
        };
      });

      res.status(200).json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // 3. Student Performance
  async studentPerformance(req, res) {
    try {
      const studentId = new mongoose.Types.ObjectId(req.params.studentId);

      // Attendance aggregation (same as before)
      const attendance = await Attendance.aggregate([
        { $unwind: "$records" },
        { $match: { "records.student": studentId } },
        {
          $group: {
            _id: "$records.student",
            totalDays: { $sum: 1 },
            presentDays: { $sum: { $cond: ["$records.present", 1, 0] } },
          },
        },
        {
          $project: {
            attendancePercentage: {
              $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
            },
          },
        },
      ]);

      // Exam aggregation to calculate average marks per student
      const examStats = await Exam.aggregate([
        { $unwind: "$results" },
        { $match: { "results.student": studentId } },
        {
          $group: {
            _id: "$results.student",
            averageMarks: { $avg: "$results.marksObtained" },
          },
        },
      ]);

      res.status(200).json({
        studentId: req.params.studentId,
        attendance: attendance[0]?.attendancePercentage.toFixed(2) || "N/A",
        averageMarks: examStats[0]?.averageMarks.toFixed(2) || "N/A",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // 4. Send Report to Email
async sendReportToEmail(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);
    const student = await User.findById(studentId);
    console.log("student", student);

    if (!student || !student.email) {
      return res.status(400).json({ message: "Student not found or email is missing" });
    }

    const attendance = await Attendance.aggregate([
      { $unwind: "$records" },
      { $match: { "records.student": studentId } },
      {
        $group: {
          _id: "$records.student",
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: ["$records.present", 1, 0] } },
        },
      },
      {
        $project: {
          attendancePercentage: {
            $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
          },
        },
      },
    ]);

    const exams = await Exam.aggregate([
      { $unwind: "$results" },
      { $match: { "results.student": studentId } },
      {
        $group: {
          _id: "$results.student",
          averageMarks: { $avg: "$results.marksObtained" },
        },
      },
    ]);
    

    const report = `
  <h2>Student Performance Report</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
    <tr><th>Name</th><td>${student.name}</td></tr>
    <tr><th>Email</th><td>${student.email}</td></tr>
    <tr><th>Attendance</th><td>${attendance[0]?.attendancePercentage.toFixed(2) || "N/A"}%</td></tr>
    <tr><th>Average Marks</th><td>${exams[0]?.averageMarks.toFixed(2) || "N/A"}</td></tr>
  </table>
`;

    console.log("Sending report to:", student.email); // Debug

    await sendMail(student.email, "Student Performance Report", report);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
}

// Export as object to use directly in routes
module.exports = new ReportController();
