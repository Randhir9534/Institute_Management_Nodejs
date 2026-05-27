const Exam = require('../models/Exam');

class ExamController {
  // 1. Create Exam (Admin/Teacher)
 async createExam(req, res) {
    try {
      const { name, date, duration, totalMarks, batch } = req.body;
      const exam = new Exam({ name, date, duration, totalMarks, batch });
      await exam.save();
      res.status(201).json({message:"exam created successfully", data:exam});
    } catch (err) {
      res.status(500).json({ message: 'Failed to create exam', error: err.message });
    }
  }

  // 2. Assign Marks (Teacher)
 async assignMarks(req, res) {
    try {
      const { examId, results } = req.body;

      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: 'Exam not found' });

      exam.results = results;
      await exam.save();

      res.status(200).json({ message: 'Marks assigned',data:exam });
    } catch (err) {
      res.status(500).json({ message: 'Failed to assign marks', error: err.message });
    }
  }

  // 3. Fetch Results (Student or Teacher)
 async fetchResults(req, res) {
    try {
      const data = await Exam.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'results.student',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        {
          $project: {
            examName: '$name',
            date: 1,
            totalMarks: 1,
            marksObtained: '$results.marksObtained',
            studentName: { $arrayElemAt: ['$studentInfo.name', 0] }
          }
        }
      ]);

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch results', error: err.message });
    }
  }

  // 4. Update Exam (Teacher)
   async updateExam(req, res) {
    try {
      const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update exam', error: err.message });
    }
  }
}

module.exports =new ExamController();
