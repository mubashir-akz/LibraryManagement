const express = require('express');

const router = express.Router();

const employeeAuthController = require('../app/controllers/employee/employeeAuthController');
const employeeDashController = require('../app/controllers/employee/employeeDashController');
const employeeStudentController = require('../app/controllers/employee/employeeStudentController');
const employeeDashProtect = require('../app/middlewares/employee/employeeDashProtect');
const employeeAuthProtect = require('../app/middlewares/employee/employeeAuthProtect');

// getRoutes
router.get('/', employeeDashProtect, employeeAuthController().login);
router.get('/dash', employeeAuthProtect, employeeDashController().dashboard);
router.get('/otpget', employeeAuthController().otpGet);
router.get('/students', employeeAuthProtect, employeeStudentController().students);
router.get('/logout', employeeAuthController().logout);

// postRoutes
router.post('/', employeeAuthController().postLogin);
router.post('/otp', employeeAuthController().otpLogin);
router.post('/otpget', employeeAuthController().otpGetPost);
router.post('/addStudent', employeeStudentController().addStudent);

module.exports = router;
