const userRoutes = require('./user/user_routes');
const authRoutes = require('./auth/auth_routes');

const express = require('express');
const router = express.Router();

router.use('/api/v1/users', userRoutes);
router.use('/api/v1/auth', authRoutes);

module.exports = router;