const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/franchise/franchise_controller');

router.post('/register', controllers.registerFranchise);
router.get('/all-franchises', controllers.allFranchises);
router.get('/search-franchise/:id', controllers.searchFranchiseByID);
router.get('/search-employees-by-franchise/:id', controllers.searchUsersByFranchise);
router.put('/edit-franchise/:id', controllers.editFranchise);
router.delete('/delete-franchise/:id', controllers.deleteFranchise);

module.exports = router;