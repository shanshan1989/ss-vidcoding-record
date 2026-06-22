const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const BudgetController = require('../controllers/budgetController');

router.use(authenticate);

router.get('/', BudgetController.list);
router.post('/', BudgetController.create);
router.put('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);

module.exports = router;
