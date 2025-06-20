const express = require('express');
const router = express.Router();
const {
  createPlan,
  getAllPlans,
  getPlanByDate,
  updatePlan,
  deletePlan
} = require('../controllers/planController');

// Rutas para los planes
router.post('/', createPlan);
router.get('/', getAllPlans);
router.get('/:date', getPlanByDate);
router.put('/:date', updatePlan);
router.delete('/:date', deletePlan);

module.exports = router;