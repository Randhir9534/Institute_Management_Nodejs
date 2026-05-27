const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./app/config/db');
const authRoutes = require('./app/routes/authRoutes');
const path=require('path')
const fs=require('fs')
const courseRoutes = require('./app/routes/courseRoutes');
const batchRoutes = require('./app/routes/batchRoutes');
const enrollmentRoutes = require('./app/routes/enrollmentRoutes');
const attendanceRoutes = require('./app/routes/attendanceRoutes');
const examRoutes = require('./app/routes/examRoutes');
const reportRoutes = require('./app/routes/reportRoutes');



// ...other routes

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB
connectDB()

// ========== static ================
app.use(express.static('public'));
app.use('uploads',express.static(path.join(__dirname,'/uploads')))
app.use('/uploads',express.static('uploads'))

// // Routes
app.use('/api/auth', authRoutes);
// // ...other routes
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/reports', reportRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
