const controllers = require('../../controllers/menu/menu_controller');
const express = require('express');
const router = express.Router();

router.post('/register', controllers.registerMenu);
router.get('/all-menus', controllers.allMenus);
router.get('/franchise-menu/:id', controllers.franchiseMenu);

module.exports = router;