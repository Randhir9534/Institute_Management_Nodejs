const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');

class BatchController {
  // 1. Add Batch (Admin/Teacher)
   async addBatch(req, res) {
    try {
      const { name, course, startDate, endDate, assignedTeacher } = req.body;
      const batch = new Batch({ name, course, startDate, endDate, assignedTeacher });
      await batch.save();
      res.status(201).json({message:"Batch Created successfully", data:batch});
    } catch (err) {
      res.status(500).json({ message: 'Failed to add batch', error: err.message });
    }
  }

  // 2. Assign Students to Batch (Admin)
   async assignStudents(req, res) {
  try {
    const { batchId, studentIds } = req.body;

    // Fetch the batch to get the course ID
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const enrollments = studentIds.map(studentId => ({
      student: studentId,
      batch: batchId,
      course: batch.course, 
    }));

    await Enrollment.insertMany(enrollments);
    res.status(200).json({ message: 'Students assigned to batch', data:enrollments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign students', error: err.message });
  }
}


  // 3. List Batches (with Aggregation Lookup)
   async listBatches(req, res) {
    try {
      const { courseId } = req.query;

      const matchStage = courseId ? { $match: { course: { $eq: courseId } } } : { $match: {} };

      const batches = await Batch.aggregate([
        matchStage,
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTeacher',
            foreignField: '_id',
            as: 'teacherInfo',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'batch',
            as: 'enrollments',
          },
        },
        {
          $project: {
            name: 1,
            startDate: 1,
            endDate: 1,
            teacher: { $arrayElemAt: ['$teacherInfo.name', 0] },
            totalStudents: { $size: '$enrollments' },
          },
        },
      ]);

      res.status(200).json({message:"Get all batch with info", data:batches});
    } catch (err) {
      res.status(500).json({ message: 'Failed to list batches', error: err.message });
    }
  }

  // 4. Update Batch Details (Admin/Teacher)
   async updateBatch(req, res) {
    try {
      const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Batch not found' });
      res.status(200).json({message:"Batch updated successfully"});
    } catch (err) {
      res.status(500).json({ message: 'Failed to update batch', error: err.message });
    }
  }

  // 5. Delete Batch (Admin)
   async deleteBatch(req, res) {
    try {
      const deleted = await Batch.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Batch not found' });
      res.status(200).json({ message: 'Batch deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete batch', error: err.message });
    }
  }
}

module.exports = new BatchController();
