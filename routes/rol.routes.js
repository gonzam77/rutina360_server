const express = require('express');
const router = express.Router();

const rolController = require('../controllers/rolController');

router.post('/', rolController.createRol);
router.get('/', rolController.getRols);
router.get('/:id', rolController.getRolById);
router.put('/:id', rolController.updateRol);
router.delete('/:id', rolController.deleteRol);

module.exports = router;