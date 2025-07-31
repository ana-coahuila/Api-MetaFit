const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');

// Obtener todas las comidas
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    console.error('Error al obtener las comidas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


module.exports = router;
