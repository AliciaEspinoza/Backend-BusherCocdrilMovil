const controller = require('../../controllers/order/order_controller');
const express = require('express');
const router = express.Router();

router.post('/register', controller.registerOrder);
router.get('/all-orders-franchise/:id', controller.allOrdersByFranchise);
router.get('/back-orders-franchise/:id', controller.backOrders);
router.get('/completed-orders-franchise/:id', controller.completedOrders);
router.patch('/complete-order/:id', controller.changeOrderStatus);
router.delete('/delete-order/:id', controller.deleteOrder);
router.delete('/dellete-all-orders-franchise/:id', controller.deleteAllOrdersByFranchise);
router.delete('/dellete-all-orders', controller.deleteAllOrders);

module.exports = router;