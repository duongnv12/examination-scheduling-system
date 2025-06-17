// backend/src/routes/examScheduleRoutes.js
const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');

router.get('/', examScheduleController.getAllExamSchedules);
router.get('/:id', examScheduleController.getExamScheduleById);
router.post('/', examScheduleController.createExamSchedule);
router.put('/:id', examScheduleController.updateExamSchedule);
router.delete('/:id', examScheduleController.deleteExamSchedule);

module.exports = router;