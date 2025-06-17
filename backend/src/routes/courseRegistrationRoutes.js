// backend/src/routes/courseRegistrationRoutes.js
const express = require('express');
const router = express.Router();
const courseRegistrationController = require('../controllers/courseRegistrationController');

router.get('/', courseRegistrationController.getAllCourseRegistrations);
router.get('/:id', courseRegistrationController.getCourseRegistrationById);
router.post('/', courseRegistrationController.createCourseRegistration);
router.put('/:id', courseRegistrationController.updateCourseRegistration);
router.delete('/:id', courseRegistrationController.deleteCourseRegistration);

module.exports = router;