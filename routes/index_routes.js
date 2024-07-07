const userRoutes = require('./user/user_routes');
const authRoutes = require('./auth/auth_routes');
const franchiseRoutes = require('./franchise/franchise_routes');
const menuRoutes = require('./menu/menu_routes');
const orderRoutes = require('./order/order_routes');

const express = require('express');
const router = express.Router();

router.use('/api/v1/users', userRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/franchise', franchiseRoutes);
router.use('/api/v1/menu', menuRoutes);
router.use('/api/v1/order', orderRoutes);

module.exports = router;