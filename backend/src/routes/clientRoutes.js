const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const { checkClientLimit } = require('../middleware/checkLimits');

router.use(protect);

router.route('/')
  .get(getClients)
  .post(checkClientLimit, createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
