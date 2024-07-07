const controller = require('../../controllers/order/order_controller');
const express = require('express');
const router = express.Router();

router.post('/register', controller.registerOrder);

module.exports = router;