// backend/src/routes/examInvigilatorRoutes.js
const express = require('express');
const router = express.Router();
const examInvigilatorController = require('../controllers/examInvigilatorController');

router.get('/', examInvigilatorController.getAllExamInvigilators);
router.get('/:id', examInvigilatorController.getExamInvigilatorById);
router.post('/', examInvigilatorController.createExamInvigilator);
router.put('/:id', examInvigilatorController.updateExamInvigilator);
router.delete('/:id', examInvigilatorController.deleteExamInvigilator);

module.exports = router;