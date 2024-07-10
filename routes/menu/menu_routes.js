const controllers = require('../../controllers/menu/menu_controller');
const express = require('express');
const router = express.Router();

router.post('/register', controllers.registerMenu);
router.get('/all-menus', controllers.allMenus);
router.get('/search-menu/:id', controllers.seachMenuById);
router.get('/franchise-menu/:id', controllers.franchiseMenu);
router.delete('/delete-menu/:id', controllers.deleteMenu);

module.exports = router;