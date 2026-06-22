const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const AccountController = require('../controllers/accountController');

router.use(authenticate);

router.get('/', AccountController.list);
router.get('/:id', AccountController.get);
router.post('/', AccountController.create);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

module.exports = router;
