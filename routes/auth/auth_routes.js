const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/auth/auth_controller');

router.post('/login', controllers.login);

module.exports = router;