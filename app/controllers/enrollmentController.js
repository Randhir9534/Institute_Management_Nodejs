const Enrollment = require('../models/Enrollment');

class EnrollmentController {
  // Enroll a student into a course
   async enrollStudent(req, res) {
    try {
      const { student, course } = req.body;

      const existing = await Enrollment.findOne({ student, course });
      if (existing) {
        return res.status(400).json({ message: 'Already enrolled' });
      }

      const enrollment = new Enrollment({ student, course });
      await enrollment.save();
      res.status(201).json(enrollment);
    } catch (err) {
      res.status(500).json({ message: 'Enrollment failed', error: err.message });
    }
  }
}

module.exports = new EnrollmentController();
