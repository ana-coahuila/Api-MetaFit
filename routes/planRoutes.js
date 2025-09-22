const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Función auxiliar para mezclar un array aleatoriamente
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// @route   POST /api/plans/generate
// @desc    Generar o actualizar plan semanal basado en BMI del usuario
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    // Obtener usuario
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (!user.bmiCategory)
      return res.status(400).json({ message: 'El usuario no tiene categoría BMI asignada' });

    // Buscar todos los planes disponibles para la categoría BMI
    const samplePlans = await Plan.find({ bmiCategory: user.bmiCategory });
    if (!samplePlans || samplePlans.length === 0)
      return res.status(404).json({ message: 'No se encontraron planes para esta categoría BMI' });

    // Extraer todas las comidas posibles
    let breakfasts = samplePlans.map(p => p.meals.breakfast);
    let lunches = samplePlans.map(p => p.meals.lunch);
    let dinners = samplePlans.map(p => p.meals.dinner);

    breakfasts = shuffleArray(breakfasts);
    lunches = shuffleArray(lunches);
    dinners = shuffleArray(dinners);

    // Crear weeklyMeals sin repetir
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const weeklyMeals = {};
    for (let i = 0; i < days.length; i++) {
      weeklyMeals[days[i]] = [
        breakfasts[i % breakfasts.length],
        lunches[i % lunches.length],
        dinners[i % dinners.length]
      ];
    }

    // Verificar si ya existe plan del usuario
    let plan = await Plan.findOne({ userId: user._id });

    if (plan) {
      // Actualizar plan existente
      plan.weeklyMeals = weeklyMeals;
      plan.meals = samplePlans[0].meals; // mantiene estructura original
      await plan.save();
    } else {
      // Crear nuevo plan
      plan = new Plan({
        userId: user._id,
        bmiCategory: user.bmiCategory,
        meals: samplePlans[0].meals,
        weeklyMeals
      });
      await plan.save();
    }

    res.status(201).json(plan);
  } catch (err) {
    console.error('Error al generar el plan:', err);
    res.status(500).json({ message: 'Error al generar el plan', error: err.message });
  }
});

// @route   GET /api/plans/me
// @desc    Obtener el plan del usuario actual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ userId: req.user.id });
    if (!plan) return res.status(404).json({ message: 'No se encontró un plan para este usuario' });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el plan' });
  }
});

module.exports = router;
