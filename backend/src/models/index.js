// backend/src/models/index.js
const sequelize = require('../config/database');

const Course = require('./Course');
const Room = require('./Room');
const Student = require('./Student');
const Faculty = require('./Faculty');
const CourseRegistration = require('./CourseRegistration');
const ExamSchedule = require('./ExamSchedule');
const ExamInvigilator = require('./ExamInvigilator');

// Re-export all models
module.exports = {
    sequelize, // Export the sequelize instance
    Course,
    Room,
    Student,
    Faculty,
    CourseRegistration,
    ExamSchedule,
    ExamInvigilator
};