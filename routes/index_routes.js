const userRoutes = require('./user/user_routes');
const authRoutes = require('./auth/auth_routes');
const franchiseRoutes = require('./franchise/franchise_routes');

const express = require('express');
const router = express.Router();

router.use('/api/v1/users', userRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/franchise', franchiseRoutes);

module.exports = router;