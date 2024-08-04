const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/user/user_controller');
const { managerToken } = require('../../middlewares/manager_middleware');

router.post('/register', managerToken(), controllers.registerUser);
router.get('/all-users', managerToken(), controllers.allUsers);
router.get('/search-user', managerToken(), controllers.searchUser);
router.get('/search-user-id/:id', managerToken(), controllers.searchUserByID);
router.patch('/change-password/:id', controllers.changePassword);
router.patch('/change-user-franchise', managerToken(), controllers.editUserFranchise);
router.put('/edit-user/:id', managerToken(), controllers.editUser);
router.delete('/delete-user/:id', managerToken(), controllers.deleteUser);

module.exports = router;