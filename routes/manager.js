const express = require('express');

const router = express.Router();

const managerAuthController = require('../app/controllers/manager/managerAuthController');
const managerDashController = require('../app/controllers/manager/managerDashController');

// getRoutes
router.get('/', managerAuthController().login);
router.get('/dash', managerDashController().dashboard);

// postRoutes
router.post('/', managerAuthController().postLogin);

module.exports = router;
