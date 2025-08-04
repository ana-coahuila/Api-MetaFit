const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/plans/generate
// @desc    Generar plan automático basado en BMI del usuario
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    // 1. Obtener el usuario autenticado
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Verificar que el usuario tenga bmiCategory
    if (!user.bmiCategory) {
      return res.status(400).json({ message: 'El usuario no tiene categoría BMI asignada' });
    }

    // 3. Buscar un plan existente en la DB que coincida con la categoría del usuario
    const samplePlan = await Plan.findOne({ 
      bmiCategory: user.bmiCategory 
    });

    if (!samplePlan) {
      return res.status(404).json({ 
        message: 'No se encontraron planes para la categoría BMI del usuario' 
      });
    }

    // 4. Crear el nuevo plan para el usuario
    const newPlan = new Plan({
      userId: user._id,
      bmiCategory: user.bmiCategory,
      meals: {
        breakfast: samplePlan.meals.breakfast,
        lunch: samplePlan.meals.lunch,
        dinner: samplePlan.meals.dinner
      }
    });

    // 5. Guardar el plan y responder
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);

  } catch (err) {
    console.error('Error al generar plan:', err);
    res.status(500).json({ 
      message: 'Error al generar el plan',
      error: err.message 
    });
  }
});

// @route   GET /api/plans/me
// @desc    Obtener el plan del usuario actual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'No se encontró un plan para este usuario' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el plan' });
  }
});

module.exports = router;