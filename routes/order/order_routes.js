const controller = require('../../controllers/order/order_controller');
const express = require('express');
const router = express.Router();

// :id -> order id

router.post('/register', controller.registerOrder);
router.get('/search-order/:id', controller.searchOrder);
router.get('/all-orders-franchise/:franchise', controller.allOrdersByFranchise);
router.get('/all-orders-by-table/:franchise/:table', controller.ordersByTable);
router.get('/all-completed-orders-by-table/:franchise/:table', controller.completedOrdersByTable);
router.get('/all-back-orders-by-table/:franchise/:table', controller.backOrdersByTable);
router.get('/back-orders-at-home/:franchise', controller.backOrdersAtHome);
router.get('/back-orders-restaurant/:franchise', controller.backOrdersRestaurant);
router.get('/completed-orders-restaurant/:franchise', controller.completedOrdersRestaurant);
router.get('/completed-orders-at-home/:franchise', controller.completedOrdersAtHome);
router.patch('/complete-order/:id', controller.changeOrderStatus);
router.put('/add-products-to-order/:id', controller.addProductsToOrder);
router.put('/remove-products-to-order/:id', controller.removeProductsToOrder);
router.delete('/delete-order/:id', controller.deleteOrder);
router.delete('/dellete-all-orders-franchise/:franchise', controller.deleteAllOrdersByFranchise);
router.delete('/dellete-all-orders', controller.deleteAllOrders);

module.exports = router;