const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/user/user_controller');

router.post('/register', controllers.registerUser);
router.get('/all-users', controllers.allUsers);
router.get('/search-user-id/:id', controllers.searchUserByID);
router.put('/change-password/:id', controllers.changePassword);
router.put('/edit-user/:id', controllers.editUser);
router.delete('/delete-user/:id', controllers.deleteUser);

module.exports = router;