const Course = require("../models/Course");
const Batch = require("../models/Batch");
const Enrollment = require('../models/Enrollment')

class CourseController {
  // 1. Add Course
  async addCourse(req, res) {
    try {
      const { name, description, duration, fees } = req.body;
      const course = new Course({ name, description, duration, fees });
      await course.save();
      res.status(201).json({message:"Course added successfully", data:course});
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to add course", error: err.message });
    }
  }

  // 2. Edit Course
  async editCourse(req, res) {
    try {
        const id=req.params.id;
        const{name, description, duration, fees}=req.body;
      const course = await Course.findByIdAndUpdate(id,{name, description, duration, fees});
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.status(200).json({message:"Course edited successfully"});
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to edit course", error: err.message });
    }
  }

  // 3. Delete Course
  async deleteCourse(req, res) {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.status(200).json({ message: "Course deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to delete course", error: err.message });
    }
  }

  // 4. List Courses with total batches and enrolled students
  async listCourses(req, res) {
    try {
      const courses = await Course.find();

      const result = await Promise.all(
        courses.map(async (course) => {
          const batchCount = await Batch.countDocuments({ course: course._id });
          const enrolledCount = await Enrollment.countDocuments({
            course: course._id,
          });

          return {
            ...course.toObject(),
            totalBatches: batchCount,
            totalEnrolledStudents: enrolledCount,
          };
        })
      );

      res.status(200).json(result);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to list courses", error: err.message });
    }
  }
}

module.exports = new CourseController();
