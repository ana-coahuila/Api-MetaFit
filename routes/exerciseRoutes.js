const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/exercises/generate
// @desc    Generar rutina de ejercicios según BMI del usuario
// @access  Private
router.get('/generate', auth, async (req, res) => {
  try {
    // 1. Obtener usuario y su categoría BMI
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Buscar 3 ejercicios aleatorios para la categoría del usuario
    const exercises = await Exercise.aggregate([
      { $match: { bmiCategory: user.bmiCategory } },
      { $sample: { size: 3 } }
    ]);

    if (exercises.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron ejercicios para esta categoría BMI' 
      });
    }

    res.json({
      bmiCategory: user.bmiCategory,
      exercises
    });

  } catch (err) {
    res.status(500).json({ 
      message: 'Error al generar rutina de ejercicios',
      error: err.message 
    });
  }
});

module.exports = router;